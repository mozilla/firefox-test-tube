import datetime

from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from .models import Enrollment


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
            graduate_count=data.get('graduate_count'),
            update_count=data.get('update_count'),
            enroll_failed_count=data.get('enroll_failed_count'),
            unenroll_failed_count=data.get('unenroll_failed_count'),
            update_failed_count=data.get('update_failed_count'),
        )

    return Response('ok')
