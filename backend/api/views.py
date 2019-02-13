import datetime

import requests
from django.db import connection
from django.db.models import Max, Sum
from django.db.models.functions import TruncHour
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.exceptions import NotFound
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from .models import Enrollment, Population


NORMANDY_URL = "https://normandy.services.mozilla.com/api/v1/recipe/?format=json&enabled=true"


def _get_active_normandy_experiments():
    active = []

    resp = requests.get(NORMANDY_URL)
    if resp.status_code == 200:
        for exp in resp.json():
            if (exp['action'] in ('preference-experiment', 'opt-out-study') and
                    exp['arguments'].get('isHighVolume', False) is False and
                    exp['enabled'] is True):
                active.append(
                    exp['arguments'].get('slug',
                                         exp['arguments'].get('name')))

    return active


@api_view(['GET'])
def experiments(request):
    datasets = (
        Population.objects.values('experiment')
                          .annotate(stamp=Max('stamp'))
                          .order_by('-stamp')
    )
    data = []
    for d in datasets:
        data.append({
            'id': None,
            'slug': d['experiment'],
            'name': None,
            'enabled': True,
            'realtime': False,
            'creationDate': d['stamp'].date().isoformat(),
        })

    # Get the list of active experiments from Normandy.
    active = _get_active_normandy_experiments()

    # Take away the experiments we have already imported.
    realtime = set(active) - set([d['slug'] for d in data])

    # Query the remaining set of active experiments from the real-time list.
    yesterday = timezone.now() - datetime.timedelta(days=1)
    experiments = list(
        Enrollment.objects.filter(experiment__in=realtime)
                          .filter(window_start__gte=yesterday)
                          .filter(branch__isnull=False)
                          .distinct('experiment')
                          .values_list('experiment', flat=True)
    )

    if experiments:
        for exp in experiments:
            data.append({
                'id': None,
                'slug': exp,
                'name': None,
                'enabled': True,
                'realtime': True,
                'creationDate': datetime.date.today().isoformat(),
            })

    return Response({'experiments': data})


@api_view(['GET'])
def experiment_by_slug(request, exp_slug):
    dataset = Population.objects.filter(experiment=exp_slug)
    if not dataset:
        raise NotFound('No experiment with given slug found.')

    dataset = dataset.first()

    data = {
        'id': None,
        'name': dataset.experiment,
        'description': '',
        'authors': [],
        'populations': [],
        'subgroups': [],
        'metrics': [],
    }
    return Response(data)


@api_view(['GET'])
def realtime_experiment_populations(request, exp_slug):
    """
    Returns realtime population data in 5m windows over the past 24 hrs.
    """
    enrollment = Enrollment.objects.filter(experiment=exp_slug).exists()
    if not enrollment:
        raise NotFound('No experiment with given slug found.')

    branches = list(
        Enrollment.objects.filter(experiment=exp_slug)
                          .exclude(branch__isnull=True)
                          .distinct('branch')
                          .values_list('branch', flat=True)
    )

    # Raw SQL because we're using CTEs and WINDOW functions.
    sql = """
        WITH enroll_sums AS (
          SELECT branch, window_start, enroll_count, unenroll_count,
            SUM(enroll_count) OVER (PARTITION BY branch ORDER BY window_start) AS enrolls,
            SUM(unenroll_count) OVER (PARTITION BY branch ORDER BY window_start) AS unenrolls
          FROM api_enrollment
          WHERE experiment=%s AND branch IS NOT NULL
        )
        SELECT
          branch,
          window_start,
          enrolls - unenrolls AS population
        FROM enroll_sums
        WHERE window_start >= NOW() - INTERVAL '1 day'
        ORDER BY branch, window_start ASC
    """
    with connection.cursor() as cursor:
        cursor.execute(sql, [exp_slug])
        rows = cursor.fetchall()

    # Set up the data dictionary.
    data = {'population': {}}
    for branch in branches:
        data['population'][branch] = []

    for row in rows:
        data['population'][row[0]].append({
            'window': row[1].isoformat(),
            'count': row[2]
        })

    return Response(data)


@api_view(['GET'])
def experiment_populations(request, exp_slug):
    """
    Returns population data in 1d windows over all time.
    """
    population = Population.objects.filter(experiment=exp_slug).exists()
    if not population:
        raise NotFound('No experiment with given slug found.')

    data = {'population': {}}
    qs = (Population.objects.filter(experiment=exp_slug)
                            .order_by('stamp', 'branch'))
    for pop in qs:
        if pop.branch not in data['population']:
            # Make the first record a zero-based population for charting.
            # TODO: Ideally the starting date would match the experiment start
            # date from Experimenter.
            data['population'][pop.branch] = [{
                'window': (pop.stamp.date() -
                           datetime.timedelta(days=1)).isoformat(),
                'count': 0,
            }]

        data['population'][pop.branch].append({
            'window': pop.stamp.date().isoformat(),
            'count': pop.count,
        })

    return Response(data)


@api_view(['GET'])
def realtime_experiment_enrolls(request, exp_slug):
    enrollment = Enrollment.objects.filter(experiment=exp_slug).exists()
    if not enrollment:
        raise NotFound('No experiment with given slug found.')

    branches = list(
        Enrollment.objects.filter(experiment=exp_slug)
                          .exclude(branch__isnull=True)
                          .distinct('branch')
                          .values_list('branch', flat=True)
    )

    start_time = timezone.now() - datetime.timedelta(hours=24)
    data = {'population': {}}
    for branch in branches:
        data['population'][branch] = []

        enrolls = (
            Enrollment.objects.filter(experiment=exp_slug,
                                      branch=branch,
                                      window_start__gte=start_time)
                              .order_by('window_start')
        )
        for enroll in enrolls:
            data['population'][enroll.branch].append({
                'window': enroll.window_start.isoformat(),
                'count': enroll.enroll_count,
            })

    return Response(data)


@api_view(['GET'])
def realtime_experiment_unenrolls(request, exp_slug):
    enrollment = Enrollment.objects.filter(experiment=exp_slug).exists()
    if not enrollment:
        raise NotFound('No experiment with given slug found.')

    branches = list(
        Enrollment.objects.filter(experiment=exp_slug)
                          .exclude(branch__isnull=True)
                          .distinct('branch')
                          .values_list('branch', flat=True)
    )

    start_time = timezone.now() - datetime.timedelta(hours=24)
    data = {'population': {}}
    for branch in branches:
        data['population'][branch] = []

        enrolls = (
            Enrollment.objects.filter(experiment=exp_slug,
                                      branch=branch,
                                      window_start__gte=start_time)
                              .order_by('window_start')
        )
        for enroll in enrolls:
            data['population'][enroll.branch].append({
                'window': enroll.window_start.isoformat(),
                'count': enroll.unenroll_count,
            })

    return Response(data)


@api_view(['GET'])
def experiment_enrolls(request, exp_slug):
    enrollment = Enrollment.objects.filter(experiment=exp_slug).exists()
    if not enrollment:
        raise NotFound('No experiment with given slug found.')

    data = {'population': {}}
    enrolls = (
        Enrollment.objects.filter(experiment=exp_slug)
                          .exclude(branch__isnull=True)
                          .annotate(period=TruncHour('window_start'))
                          .values('period', 'branch')
                          .annotate(counts=Sum('enroll_count'))
                          .order_by('period')
    )

    for enroll in enrolls:
        if enroll['branch'] not in data['population']:
            data['population'][enroll['branch']] = []

        data['population'][enroll['branch']].append({
            'window': enroll['period'].isoformat(),
            'count': enroll['counts'],
        })

    return Response(data)


@api_view(['GET'])
def experiment_unenrolls(request, exp_slug):
    enrollment = Enrollment.objects.filter(experiment=exp_slug).exists()
    if not enrollment:
        raise NotFound('No experiment with given slug found.')

    data = {'population': {}}
    unenrolls = (
        Enrollment.objects.filter(experiment=exp_slug)
                          .exclude(branch__isnull=True)
                          .annotate(period=TruncHour('window_start'))
                          .values('period', 'branch')
                          .annotate(counts=Sum('unenroll_count'))
                          .order_by('period')
    )

    for unenroll in unenrolls:
        if unenroll['branch'] not in data['population']:
            data['population'][unenroll['branch']] = []

        data['population'][unenroll['branch']].append({
            'window': unenroll['period'].isoformat(),
            'count': unenroll['counts'],
        })

    return Response(data)


@api_view(['POST'])
@permission_classes((AllowAny,))
def enrollment(request):
    """
    Take a JSON payload from telemetry streaming to record experiment enrollment.
    """
    payload = request.data.get('enrollment')
    if not payload or not isinstance(payload, list):
        return Response('No data', status=status.HTTP_204_NO_CONTENT)

    # Note: The telemetry-streaming job currently only sends 1 item in each
    # payload, but this may change in the future. If it does, consider using
    # `bulk_create` here.
    for data in payload:
        if not data:
            continue

        window_start = timezone.make_aware(
            datetime.datetime.fromtimestamp(data['window_start'] / 1000))
        window_end = timezone.make_aware(
            datetime.datetime.fromtimestamp(data['window_end'] / 1000))

        Enrollment.objects.create(
            type=data['type'],
            experiment=data['experiment_id'],
            branch=data['branch_id'],
            window_start=window_start,
            window_end=window_end,
            enroll_count=data['enroll_count'],
            unenroll_count=data['unenroll_count'],
        )

    return Response('ok')
