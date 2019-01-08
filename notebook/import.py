import datetime
import logging
from os import environ

import boto3
import psycopg2
import requests
import ujson
from psycopg2.extras import LoggingConnection
from pyspark.sql import SparkSession
from pyspark.sql.functions import countDistinct


BUCKET = environ.get('bucket', 'telemetry-parquet')
# Note: For staging use 'test-tube-staging-db'.
DB = environ.get('db', 'test-tube-db')
PATH = 's3://%s/experiments/v1/' % BUCKET
NORMANDY_URL = 'https://normandy.services.mozilla.com/api/v1/recipe/'
LOG_LEVEL = logging.INFO  # Change to incr/decr logging output.
DEBUG_SQL = False  # Set to True to not insert any data.

EXPERIMENTS = {}

logging.basicConfig(level=LOG_LEVEL)
logger = logging.getLogger(__name__)


class StaleImportError(Exception):
    "Raise when we detect that we're importing data older than existing data."


def get_database_connection():
    global logger

    s3 = boto3.resource('s3')
    metasrcs = ujson.load(
        s3.Object('net-mozaws-prod-us-west-2-pipeline-metadata',
                  'sources.json').get()['Body'])
    creds = ujson.load(
        s3.Object(
            'net-mozaws-prod-us-west-2-pipeline-metadata',
            '%s/write/credentials.json'
            % metasrcs[DB]['metadata_prefix']
        ).get()['Body'])
    conn = psycopg2.connect(connection_factory=LoggingConnection,
                            host=creds['host'], port=creds.get('port', 5432),
                            user=creds['username'], password=creds['password'],
                            dbname=creds['db_name'])
    conn.initialize(logger)
    return conn


def should_process_experiment(exp):
    if exp['action'] not in ('preference-experiment', ):
        return False
    if exp['arguments'].get('isHighVolume', False):
        return False
    if not exp['enabled']:
        return False

    return True


def get_experiments():
    global EXPERIMENTS

    if EXPERIMENTS:
        return EXPERIMENTS

    resp = requests.get(NORMANDY_URL)
    if resp.status_code == 200:
        experiments = resp.json()
        for exp in experiments:
            if should_process_experiment(exp):
                try:
                    EXPERIMENTS[exp['arguments']['slug']] = exp
                except KeyError:
                    pass
    else:
        EXPERIMENTS = {}

    return EXPERIMENTS


def clear_population(cursor, exp):
    """
    Clear populations data for a given experiment.
    """
    sql = 'DELETE FROM api_population WHERE experiment=%s'
    params = [exp]
    if DEBUG_SQL:
        print(cursor.mogrify(sql, params))
    else:
        cursor.execute(sql, params)


def create_population(cursor, exp, row):
    """
    Adds population data for a given experiment record.
    """
    sql = ('INSERT INTO api_population '
           '(experiment, branch, stamp, count) '
           'VALUES (%s, %s, %s, %s) ')
    stamp = datetime.datetime.strptime(row['submission_date'], '%Y%m%d'),
    params = [exp, row['experiment_branch'], stamp, row['count']]
    if DEBUG_SQL:
        print(cursor.mogrify(sql, params))
    else:
        cursor.execute(sql, params)


process_date = environ.get('date')
if not process_date:
    # If no date in environment, assume we are running manually and use
    # yesterday's date.
    process_date = (datetime.date.today() -
                    datetime.timedelta(days=1)).strftime('%Y%m%d')

print('Querying data for date: %s' % process_date)

sparkSession = SparkSession.builder.appName('experiments-viewer').getOrCreate()

# Get database connection and initialize logging.
conn = get_database_connection()

for exp in get_experiments():

    # Get a fresh cursor, the first command will start the transaction.
    cursor = conn.cursor()

    # Update experiment populations.
    path = '%sexperiment_id=%s/' % (PATH, exp)
    df2 = sparkSession.read.parquet(path)

    rows = (df2.select('submission_date', 'experiment_branch', 'client_id')
               .groupBy('submission_date', 'experiment_branch')
               .agg(countDistinct('client_id').alias('count'))
               .orderBy('submission_date')
               .collect())

    clear_population(cursor, exp)

    for row in [r.asDict() for r in rows]:
        create_population(cursor, exp, row)
