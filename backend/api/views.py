import datetime

from django.db.models import F
from django.utils import timezone
from rest_framework.decorators import api_view
from rest_framework.exceptions import NotFound, ValidationError
from rest_framework.response import Response

from .models import Collection, DataSet, Metric, Stats, Enrollment


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
        raise ValidationError

    # Note: The telemetry-streaming job currently only sends 1 item in each
    # payload, but may change this in the future. If it does, consider using
    # `bulk_create` here.
    for data in payload:
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
