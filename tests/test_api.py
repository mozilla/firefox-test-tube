import datetime
import json
import pytz

from django.contrib.auth.models import User
from django.test import TestCase
from django.utils import timezone
from rest_framework.reverse import reverse

from backend.api import factories
from backend.api.models import Enrollment

from . import DataTestCase


class TestExperiments(DataTestCase):

    def setUp(self):
        User.objects.create_user(username='testuser',
                                 email='example@mozilla.com',
                                 password='password')
        self.client.login(username='testuser', password='password')
        self.url = reverse('v2-experiments')

    def test_basic(self):
        response = self.client.get(self.url)
        expected = {
            'experiments': [
                {
                    'id': self.dataset.id,
                    'slug': self.dataset.slug,
                    'name': self.dataset.name,
                    'enabled': True,
                    'creationDate': self.dataset.created_at.date().isoformat(),
                },
                {
                    'id': self.dataset_older.id,
                    'slug': self.dataset_older.slug,
                    'name': self.dataset_older.name,
                    'enabled': False,
                    'creationDate': self.dataset_older.created_at.date().isoformat(),
                },
            ]
        }
        self.assertEqual(response.json(), expected)

    def test_null_ordering(self):
        # Sometimes the `created_at` field can be NULL.
        self.dataset.created_at = None
        self.dataset.save()

        response = self.client.get(self.url)
        data = response.json()
        self.assertEqual(len(data['experiments']), 2)
        self.assertEqual(data['experiments'][0]['id'], self.dataset_older.id)

    def test_display(self):
        # Test that a newer experiment with display=False isn't returned.
        factories.DataSetFactory(display=False)

        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(len(data['experiments']), 2)
        self.assertEqual(data['experiments'][0]['id'], self.dataset.id)
        self.assertEqual(data['experiments'][1]['id'], self.dataset_older.id)


class TestExperimentBySlug(DataTestCase):

    def setUp(self):
        User.objects.create_user(username='testuser',
                                 email='example@mozilla.com',
                                 password='password')
        self.client.login(username='testuser', password='password')
        self.url = reverse('v2-experiment-by-slug', args=[self.dataset.slug])

    def test_basic(self):
        response = self.client.get(self.url)
        expected = {
            'id': self.dataset.id,
            'name': self.dataset.name,
            'description': '',  # TODO
            'authors': [],  # TODO
            'populations': self.dataset.get_populations(),
            'subgroups': self.dataset.get_subgroups(),
            'metrics': self.dataset.get_metrics(),
        }
        self.assertEqual(response.json(), expected)

    def test_404(self):
        response = self.client.get(reverse('v2-experiment-by-slug', args=[99]))
        assert response.status_code == 404

    def test_display(self):
        # Test that an experiment with display=False isn't returned.
        dataset = factories.DataSetFactory(display=False)
        response = self.client.get(reverse('v2-experiment-by-slug',
                                           args=[dataset.id]))
        assert response.status_code == 404


class TestMetricById(DataTestCase):

    def setUp(self):
        User.objects.create_user(username='testuser',
                                 email='example@mozilla.com',
                                 password='password')
        self.client.login(username='testuser', password='password')
        self.url = reverse('v2-metric-by-id',
                           args=[self.dataset.id, self.flag_metric.id])

    def test_basic(self):
        response = self.client.get(self.url)
        stats = {
            'mean': {
                'value': 10.0,
                'confidence_low': 9.9,
                'confidence_high': 11.1,
                'confidence_level': 0.01,
            }
        }
        expected = {
            'id': self.flag_metric.id,
            'name': self.flag_metric.name,
            'description': self.flag_metric.description,
            'type': self.flag_metric.type,
            'units': {'x': self.flag_metric.units},
            'populations': [{
                'name': 'chaos',
                'n': 12345,
                'data': [
                    {'x': '1', 'y': 0.9, 'count': 12600},
                    {'x': '10', 'y': 0.07, 'count': 980},
                    {'x': '100', 'y': 0.03, 'count': 420},
                ],
                'stats': stats,
            }, {
                'name': 'control',
                'n': 12345,
                'data': [
                    {'x': '1', 'y': 0.9, 'count': 12600},
                    {'x': '10', 'y': 0.07, 'count': 980},
                    {'x': '100', 'y': 0.03, 'count': 420},
                ],
                'stats': stats,
            }]
        }
        self.assertEqual(response.json(), expected)


# This is separated to create a more custom set of data for testing.
class TestScalarMetric(TestCase):

    @classmethod
    def setUpTestData(cls):
        scalar_metric = factories.MetricFactory(source_name='scalar_metric',
                                                type='UintScalar',
                                                description='scalar metric')
        dataset = factories.DataSetFactory()
        coll = factories.CollectionFactory(metric=scalar_metric,
                                           dataset=dataset,
                                           population='control')
        total = 3053.0
        data = {1: 100, 2: 500, 3: 300, 4: 200, 5: 190, 6: 180, 7: 170,
                8: 160, 9: 150, 10: 140, 11: 130, 12: 120, 13: 110, 14: 100,
                15: 90, 16: 80, 17: 70, 18: 60, 19: 50, 20: 40, 21: 30, 22: 20,
                23: 10, 24: 9, 25: 8, 26: 7, 27: 6, 28: 5, 29: 4, 30: 3, 31: 2,
                32: 1, 33: 1, 34: 1, 35: 1, 36: 1, 37: 1, 38: 1, 39: 1, 40: 1}

        for rank, bucket in enumerate(sorted(data.keys()), 1):
            count = data[bucket]
            factories.PointFactory(collection=coll,
                                   bucket=bucket,
                                   proportion=count / total,
                                   count=count,
                                   rank=rank)

        cls.dataset = dataset
        cls.metric = scalar_metric

    def setUp(self):
        User.objects.create_user(username='testuser',
                                 email='example@mozilla.com',
                                 password='password')
        self.client.login(username='testuser', password='password')

    def test_basic_api_v2(self):
        url = reverse('v2-metric-by-id',
                      args=[self.dataset.id, self.metric.id])
        response = self.client.get(url)
        data = response.json()

        # Spot check some basic top level information.
        self.assertEqual(data['name'], self.metric.name)
        self.assertEqual(data['type'], self.metric.type)
        self.assertEqual(data['populations'][0]['name'], 'control')

        # Spot check a few buckets.
        points = data['populations'][0]['data']
        self.assertEqual(points[1],
                         {'x': 1, 'count': 100,
                          'y': round(100 / 3053.0, 16)})
        # Bucket 19 should contain data from 19 and 20.
        self.assertEqual(points[19],
                         {'x': 19, 'count': 90,
                          'y': round((50 + 40) / 3053.0, 16)})
        # Bucket 31 should contain data from 31, 32, 33.
        self.assertEqual(points[25],
                         {'x': 31, 'count': 4,
                          'y': round((2 + 1 + 1) / 3053.0, 16)})
        # Make sure the last bucket to have data is included.
        self.assertEqual(points[28],
                         {'x': 40, 'count': 1,
                          'y': round(1 / 3053.0, 16)})


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


class EnrollmentBaseTestCase(TestCase):

    def create_data(self):
        self.window1 = timezone.now()
        self.window2 = self.window1 + datetime.timedelta(seconds=5)
        self.window3 = self.window2 + datetime.timedelta(seconds=5)

        Enrollment.objects.create(
            type='preference_study',
            experiment='pref-flip-1',
            branch='control',
            window_start=self.window1,
            window_end=self.window2,
            enroll_count=10,
            unenroll_count=1
        )
        Enrollment.objects.create(
            type='preference_study',
            experiment='pref-flip-1',
            branch='control',
            window_start=self.window2,
            window_end=self.window3,
            enroll_count=20,
            unenroll_count=2
        )
        Enrollment.objects.create(
            type='preference_study',
            experiment='pref-flip-1',
            branch='variant',
            window_start=self.window1,
            window_end=self.window2,
            enroll_count=11,
            unenroll_count=5
        )
        Enrollment.objects.create(
            type='preference_study',
            experiment='pref-flip-1',
            branch='variant',
            window_start=self.window2,
            window_end=self.window3,
            enroll_count=21,
            unenroll_count=10
        )
        # Create a random bit of data in a different experiment.
        Enrollment.objects.create(
            type='preference_study',
            experiment='pref-flip-2',
            branch='control',
            window_start=self.window1,
            window_end=self.window2,
            enroll_count=99999,
            unenroll_count=99
        )


class TestEnrollmentPopulationApi(EnrollmentBaseTestCase):

    def setUp(self):
        self.url = reverse('v2-experiment-populations', args=['pref-flip-1'])
        self.create_data()

    def test_population_404(self):
        response = self.client.get(
            reverse('v2-experiment-populations', args=['foo']))
        self.assertEqual(response.status_code, 404)

    def test_population_api(self):
        # Population for control should be 10 - 1 + 20 - 2 = 27.
        # Population for variant should be 11 - 5 + 21 - 10 = 17.
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertDictEqual(
            data['population']['control'][0],
            {'window': self.window1.isoformat(), 'count': 9}
        )
        self.assertEqual(
            data['population']['control'][1],
            {'window': self.window2.isoformat(), 'count': 27}
        )
        self.assertEqual(
            data['population']['variant'][0],
            {'window': self.window1.isoformat(), 'count': 6}
        )
        self.assertEqual(
            data['population']['variant'][1],
            {'window': self.window2.isoformat(), 'count': 17}
        )


class TestEnrollmentCountsApi(EnrollmentBaseTestCase):

    def setUp(self):
        self.url = reverse('v2-experiment-enrolls', args=['pref-flip-1'])
        self.create_data()

    def test_enrolls_404(self):
        response = self.client.get(
            reverse('v2-experiment-enrolls', args=['foo']))
        self.assertEqual(response.status_code, 404)

    def test_enrolls_api(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertDictEqual(
            data['population']['control'][0],
            {'window': self.window1.isoformat(), 'count': 10}
        )
        self.assertEqual(
            data['population']['control'][1],
            {'window': self.window2.isoformat(), 'count': 20}
        )
        self.assertEqual(
            data['population']['variant'][0],
            {'window': self.window1.isoformat(), 'count': 11}
        )
        self.assertEqual(
            data['population']['variant'][1],
            {'window': self.window2.isoformat(), 'count': 21}
        )
