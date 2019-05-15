import datetime
import json
import pytz

from django.test import TestCase
from rest_framework.reverse import reverse

from backend.api.models import Enrollment


class TestEnrollmentIngestionApi(TestCase):

    def setUp(self):
        self.url = reverse('v2-enrollment')
        self.payload = {
            'enrollment': [
                {
                    'type': 'preference_study',
                    'experiment_id': 'pref-flip-123',
                    'branch_id': 'control',
                    'window_start': 1529588100000,
                    'window_end': 1529588400000,
                    'enroll_count': 7,
                    'unenroll_count': 2,
                    'submission_date_s3': '20180621',
                },
                {}  # Test this doesn't break ingestion.
            ]
        }

    def test_invalid(self):
        for v in ('get', 'put', 'delete', 'patch'):
            response = getattr(self.client, v)(self.url)
            self.assertEqual(response.status_code, 405)

        response = self.client.post(self.url)
        self.assertEqual(response.status_code, 204)

    def test_recording(self):
        response = self.client.post(self.url, json.dumps(self.payload),
                                    content_type='application/json')
        self.assertEqual(response.status_code, 200)

        enroll = Enrollment.objects.get()
        expected = self.payload['enrollment'][0]
        self.assertEqual(enroll.experiment, expected['experiment_id'])
        self.assertEqual(enroll.branch, expected['branch_id'])
        self.assertEqual(enroll.window_start,
                         datetime.datetime(2018, 6, 21, 13, 35, 0, tzinfo=pytz.UTC))
        self.assertEqual(enroll.window_end,
                         datetime.datetime(2018, 6, 21, 13, 40, 0, tzinfo=pytz.UTC))
        self.assertEqual(enroll.enroll_count, 7)
        self.assertEqual(enroll.unenroll_count, 2)

    def test_null_branch(self):
        payload = self.payload
        payload['enrollment'][0]['branch_id'] = None

        response = self.client.post(self.url, json.dumps(self.payload),
                                    content_type='application/json')
        self.assertEqual(response.status_code, 200)

        enroll = Enrollment.objects.get()
        self.assertEqual(enroll.branch, None)
