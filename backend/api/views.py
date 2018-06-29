import datetime

from django.db import connection
from django.db.models import F
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.exceptions import NotFound
from rest_framework.response import Response

from .models import Collection, DataSet, Enrollment, Metric, Stats


@api_view(['GET'])
def experiments(request):
    datasets = (
        DataSet.objects.visible()
                       .order_by(F('created_at').desc(nulls_last=True))
    )
    data = []
    for d in datasets:
        data.append({
            'id': d.id,
            'slug': d.slug,
            'name': d.name,
            'enabled': d.enabled,
            'creationDate': d.created_at.date().isoformat() if d.created_at else None,
        })

    return Response({'experiments': data})


@api_view(['GET'])
def experiment_by_slug(request, exp_slug):
    try:
        dataset = DataSet.objects.visible().get(slug=exp_slug)
    except DataSet.DoesNotExist:
        raise NotFound('No experiment with given slug found.')

    data = {
        'id': dataset.id,
        'name': dataset.name,
        'description': '',  # TODO
        'authors': [],
        'populations': dataset.get_populations(),
        'subgroups': dataset.get_subgroups(),
        'metrics': dataset.get_metrics(),
    }
    return Response(data)


@api_view(['GET'])
def experiment_populations(request, exp_slug):
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
def metric_by_id(request, exp_id, metric_id):
    metric = Metric.objects.get(id=metric_id)
    # TODO: Add subgroups.
    pops = Collection.objects.filter(dataset=exp_id,
                                     metric=metric_id,
                                     subgroup='All').order_by('population')
    stats = {}
    for s in Stats.objects.filter(dataset=exp_id, metric=metric_id):
        stats[s.population] = {
            'mean': {
                'value': s.value,
                'confidence_low': s.confidence_low,
                'confidence_high': s.confidence_high,
                'confidence_level': s.confidence_level,
            }
        }

    populations = []
    for p in pops:
        if metric.type == 'UintScalar':
            populations.append({
                'name': p.population,
                'n': p.num_observations,
                'data': [
                    dict(x=d.bucket,
                         y=round(d.proportion, 16),
                         count=d.count) for d in p.hdr()
                ],
                'stats': stats.get(p.population),
            })
        else:
            populations.append({
                'name': p.population,
                'n': p.num_observations,
                'data': [
                    dict(x=d.bucket,
                         y=round(d.proportion, 16),
                         count=d.count) for d in p.points()],
                'stats': stats.get(p.population),
            })

    data = {
        'id': metric.id,
        'name': metric.name,
        'description': metric.description,
        'type': metric.type,
        'units': {'x': metric.units},
        'populations': populations,
    }

    return Response(data)


@api_view(['POST'])
def enrollment(request):
    """
    Take a JSON payload from telemetry streaming to record experiment enrollment.
    """
    payload = request.data.get('enrollment')
    if not payload or not isinstance(payload, list):
        return Response('No data', status=status.HTTP_204_NO_CONTENT)

    # Note: The telemetry-streaming job currently only sends 1 item in each
    # payload, but may change this in the future. If it does, consider using
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
