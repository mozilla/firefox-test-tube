import datetime
import json
import pytz

import requests_mock
from django.contrib.auth.models import User
from django.test import TestCase
from django.utils import timezone
from rest_framework.reverse import reverse

from backend.api.models import Enrollment, Population
from backend.api.views import NORMANDY_URL, _get_active_normandy_experiments

from . import DataTestCase, TestAuthMixin


@requests_mock.Mocker()
class TestExperiments(DataTestCase, TestAuthMixin):

    def setUp(self):
        User.objects.create_user(username='testuser',
                                 email='example@mozilla.com',
                                 password='password')
        self.client.login(username='testuser', password='password')
        self.url = reverse('v2-experiments')

        self.normandy_resp = [{
            'action': 'something-not-allowed',
            'enabled': False,
        }]

    def test_basic(self, mock):
        mock.register_uri('GET', NORMANDY_URL, json=self.normandy_resp)
        response = self.client.get(self.url)

        expected = {
            'experiments': [
                {
                    'id': None,
                    'slug': self.pop1.experiment,
                    'name': None,
                    'enabled': True,
                    'realtime': False,
                    'creationDate': self.pop1.stamp.date().isoformat(),
                },
                {
                    'id': None,
                    'slug': self.pop2.experiment,
                    'name': None,
                    'enabled': True,
                    'realtime': False,
                    'creationDate': self.pop2.stamp.date().isoformat(),
                },
            ]
        }
        self.assertEqual(response.json(), expected)

    def test_realtime_experiment(self, mock):
        # Test that a real-time experiment shows up in this API.
        we = timezone.now()
        ws = we - datetime.timedelta(minutes=5)
        # Include 2 records with different branches to verify DISTINCT.
        Enrollment.objects.create(experiment='realtime', branch='control',
                                  window_start=ws, window_end=we,
                                  enroll_count=5, unenroll_count=3)
        Enrollment.objects.create(experiment='realtime', branch='variant',
                                  window_start=ws, window_end=we,
                                  enroll_count=5, unenroll_count=3)
        # Include a None branch to test they get filtered.
        Enrollment.objects.create(experiment='null-branch', branch=None,
                                  window_start=ws, window_end=we,
                                  enroll_count=5, unenroll_count=3)
        # Include an inactive record to test they get filtered.
        Enrollment.objects.create(experiment='inactive', branch='control',
                                  window_start=ws, window_end=we,
                                  enroll_count=5, unenroll_count=3)

        normandy_resp = [{
            'action': 'preference-experiment',
            'enabled': True,
            'arguments': {
                'slug': 'realtime'
            },
        }]
        mock.register_uri('GET', NORMANDY_URL, json=normandy_resp)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        experiments = [e for e in data['experiments']
                       if e['realtime'] is True]
        self.assertEqual(experiments[0]['slug'], 'realtime')
        self.assertEqual(experiments[0]['realtime'], True)
        self.assertEqual(experiments[0]['creationDate'],
                         datetime.date.today().isoformat())
        # Make sure we are getting a distinct list of real time experiments.
        self.assertEqual(len(data['experiments']), 3)
        self.assertEqual(len(experiments), 1)

    def test_experiment_filtering(self, mock):
        # Test an experiment that should be returned.
        normandy_resp = [{
            'action': 'preference-experiment',
            'enabled': True,
            'arguments': {
                'slug': 'true-test-1'
            },
        }, {
            'action': 'opt-out-study',
            'enabled': True,
            'arguments': {
                'name': 'true-test-2'  # Also testing `name` vs `slug`.
            },
        }, {
            'action': 'bad-action',
            'enabled': True,
            'arguments': {
                'slug': 'bad-action-test'
            },
        }, {
            'action': 'preference-experiment',
            'enabled': False,
            'arguments': {
                'slug': 'not-enabled-test'
            },
        }, {
            'action': 'preference-experiment',
            'enabled': True,
            'arguments': {
                'isHighVolume': True,
                'slug': 'high-volume-test'
            },
        }]
        mock.register_uri('GET', NORMANDY_URL, json=normandy_resp)
        self.assertEqual(
            _get_active_normandy_experiments(),
            ['true-test-1', 'true-test-2']
        )


class TestExperimentBySlug(DataTestCase, TestAuthMixin):

    def setUp(self):
        User.objects.create_user(username='testuser',
                                 email='example@mozilla.com',
                                 password='password')
        self.client.login(username='testuser', password='password')
        self.url = reverse('v2-experiment-by-slug', args=[self.pop1.experiment])

    def test_basic(self):
        response = self.client.get(self.url)
        expected = {
            'id': None,
            'name': self.pop1.experiment,
            'description': '',  # TODO
            'authors': [],  # TODO
            'populations': [],
            'subgroups': [],
            'metrics': [],
        }
        self.assertDictEqual(response.json(), expected)

    def test_404(self):
        response = self.client.get(reverse('v2-experiment-by-slug', args=[99]))
        assert response.status_code == 404


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

    def setUp(self):
        User.objects.create_user(username='testuser',
                                 email='example@mozilla.com',
                                 password='password')
        self.client.login(username='testuser', password='password')

    def create_data(self):
        now = timezone.now()
        # Create data that cross an hour time barrier since some views
        # aggregate per hour, but keep them within the last 24 hours since the
        # other views aggregate over the last 24h.
        dt = datetime.datetime(now.year, now.month, now.day, now.hour, 5, 0,
                               tzinfo=pytz.UTC)
        self.window1 = (dt - datetime.timedelta(minutes=15),
                        dt - datetime.timedelta(minutes=10))
        self.window2 = (dt - datetime.timedelta(minutes=10),
                        dt - datetime.timedelta(minutes=5))
        self.window3 = (dt - datetime.timedelta(minutes=5), dt)

        Enrollment.objects.create(
            type='preference_study',
            experiment='pref-flip-1',
            branch='control',
            window_start=self.window1[0],
            window_end=self.window1[1],
            enroll_count=11,
            unenroll_count=1
        )
        Enrollment.objects.create(
            type='preference_study',
            experiment='pref-flip-1',
            branch='control',
            window_start=self.window2[0],
            window_end=self.window2[1],
            enroll_count=21,
            unenroll_count=2
        )
        Enrollment.objects.create(
            type='preference_study',
            experiment='pref-flip-1',
            branch='control',
            window_start=self.window3[0],
            window_end=self.window3[1],
            enroll_count=31,
            unenroll_count=3
        )
        Enrollment.objects.create(
            type='preference_study',
            experiment='pref-flip-1',
            branch='variant',
            window_start=self.window1[0],
            window_end=self.window1[1],
            enroll_count=15,
            unenroll_count=5
        )
        Enrollment.objects.create(
            type='preference_study',
            experiment='pref-flip-1',
            branch='variant',
            window_start=self.window2[0],
            window_end=self.window2[1],
            enroll_count=25,
            unenroll_count=10
        )
        Enrollment.objects.create(
            type='preference_study',
            experiment='pref-flip-1',
            branch='variant',
            window_start=self.window3[0],
            window_end=self.window3[1],
            enroll_count=35,
            unenroll_count=15
        )
        # Create a random bit of data in a different experiment.
        Enrollment.objects.create(
            type='preference_study',
            experiment='pref-flip-2',
            branch='control',
            window_start=self.window1[0],
            window_end=self.window1[1],
            enroll_count=99999,
            unenroll_count=99
        )


class TestRealtimePopulationApi(EnrollmentBaseTestCase, TestAuthMixin):

    def setUp(self):
        super().setUp()
        self.url = reverse('v2-experiment-realtime-populations',
                           args=['pref-flip-1'])
        self.create_data()

    def test_population_404(self):
        response = self.client.get(
            reverse('v2-experiment-realtime-populations', args=['foo']))
        self.assertEqual(response.status_code, 404)

    def test_population_api(self):
        # Population for control should be:
        #   11 - 1 = 10
        #   10 + 21 - 2 = 29
        #   29 + 31 - 3 = 57
        # Population for variant should be:
        #   15 - 5 = 10
        #   10 + 25 - 10 = 25
        #   25 + 35 - 15 = 45
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertDictEqual(
            data['population']['control'][0],
            {'window': self.window1[0].isoformat(), 'count': 10}
        )
        self.assertDictEqual(
            data['population']['control'][1],
            {'window': self.window2[0].isoformat(), 'count': 29}
        )
        self.assertDictEqual(
            data['population']['control'][2],
            {'window': self.window3[0].isoformat(), 'count': 57}
        )
        self.assertDictEqual(
            data['population']['variant'][0],
            {'window': self.window1[0].isoformat(), 'count': 10}
        )
        self.assertDictEqual(
            data['population']['variant'][1],
            {'window': self.window2[0].isoformat(), 'count': 25}
        )
        self.assertDictEqual(
            data['population']['variant'][2],
            {'window': self.window3[0].isoformat(), 'count': 45}
        )


class TestPopulationApi(TestCase, TestAuthMixin):

    def setUp(self):
        User.objects.create_user(username='testuser',
                                 email='example@mozilla.com',
                                 password='password')
        self.client.login(username='testuser', password='password')
        self.experiment = 'pref-flip-1'
        self.url = reverse('v2-experiment-populations', args=[self.experiment])
        Population.objects.bulk_create([
            Population(experiment=self.experiment, branch='control', count=1,
                       stamp=datetime.datetime(2018, 1, 1, tzinfo=pytz.UTC)),
            Population(experiment=self.experiment, branch='control', count=10,
                       stamp=datetime.datetime(2018, 1, 2, tzinfo=pytz.UTC)),
            Population(experiment=self.experiment, branch='control', count=50,
                       stamp=datetime.datetime(2018, 1, 3, tzinfo=pytz.UTC)),
            Population(experiment=self.experiment, branch='control', count=100,
                       stamp=datetime.datetime(2018, 1, 4, tzinfo=pytz.UTC)),
            Population(experiment=self.experiment, branch='variant', count=0,
                       stamp=datetime.datetime(2018, 1, 1, tzinfo=pytz.UTC)),
            Population(experiment=self.experiment, branch='variant', count=9,
                       stamp=datetime.datetime(2018, 1, 2, tzinfo=pytz.UTC)),
            Population(experiment=self.experiment, branch='variant', count=49,
                       stamp=datetime.datetime(2018, 1, 3, tzinfo=pytz.UTC)),
            Population(experiment=self.experiment, branch='variant', count=99,
                       stamp=datetime.datetime(2018, 1, 4, tzinfo=pytz.UTC)),
        ])

    def test_404(self):
        response = self.client.get(
            reverse('v2-experiment-populations', args=['foo']))
        self.assertEqual(response.status_code, 404)

    def test_population_api(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertDictEqual(
            data['population']['control'][0],
            {'window': '2017-12-31', 'count': 0})
        self.assertDictEqual(
            data['population']['control'][1],
            {'window': '2018-01-01', 'count': 1})
        self.assertDictEqual(
            data['population']['control'][4],
            {'window': '2018-01-04', 'count': 100})
        self.assertDictEqual(
            data['population']['variant'][0],
            {'window': '2017-12-31', 'count': 0})
        self.assertDictEqual(
            data['population']['variant'][1],
            {'window': '2018-01-01', 'count': 0})
        self.assertDictEqual(
            data['population']['variant'][4],
            {'window': '2018-01-04', 'count': 99})


class TestRealtimeEnrollmentCountsApi(EnrollmentBaseTestCase, TestAuthMixin):

    def setUp(self):
        super().setUp()
        self.url = reverse('v2-experiment-realtime-enrolls', args=['pref-flip-1'])
        self.create_data()

    def test_realtime_enrolls_404(self):
        response = self.client.get(
            reverse('v2-experiment-realtime-enrolls', args=['foo']))
        self.assertEqual(response.status_code, 404)

    def test_realtime_enrolls_api(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertDictEqual(
            data['population']['control'][0],
            {'window': self.window1[0].isoformat(), 'count': 11}
        )
        self.assertDictEqual(
            data['population']['control'][1],
            {'window': self.window2[0].isoformat(), 'count': 21}
        )
        self.assertDictEqual(
            data['population']['control'][2],
            {'window': self.window3[0].isoformat(), 'count': 31}
        )
        self.assertDictEqual(
            data['population']['variant'][0],
            {'window': self.window1[0].isoformat(), 'count': 15}
        )
        self.assertDictEqual(
            data['population']['variant'][1],
            {'window': self.window2[0].isoformat(), 'count': 25}
        )
        self.assertDictEqual(
            data['population']['variant'][2],
            {'window': self.window3[0].isoformat(), 'count': 35}
        )


class TestRealtimeUnenrollmentCountsApi(EnrollmentBaseTestCase, TestAuthMixin):

    def setUp(self):
        super().setUp()
        self.url = reverse('v2-experiment-realtime-unenrolls', args=['pref-flip-1'])
        self.create_data()

    def test_realtime_unenrolls_404(self):
        response = self.client.get(
            reverse('v2-experiment-realtime-unenrolls', args=['foo']))
        self.assertEqual(response.status_code, 404)

    def test_realtime_unenrolls_api(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertDictEqual(
            data['population']['control'][0],
            {'window': self.window1[0].isoformat(), 'count': 1}
        )
        self.assertDictEqual(
            data['population']['control'][1],
            {'window': self.window2[0].isoformat(), 'count': 2}
        )
        self.assertDictEqual(
            data['population']['variant'][0],
            {'window': self.window1[0].isoformat(), 'count': 5}
        )
        self.assertDictEqual(
            data['population']['variant'][1],
            {'window': self.window2[0].isoformat(), 'count': 10}
        )


class TestEnrollmentCountsApi(EnrollmentBaseTestCase, TestAuthMixin):

    def setUp(self):
        super().setUp()
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
            {'window': self.window1[0].replace(minute=0).isoformat(),
             'count': 32}
        )
        self.assertDictEqual(
            data['population']['control'][1],
            {'window': self.window3[0].replace(minute=0).isoformat(),
             'count': 31}
        )
        self.assertDictEqual(
            data['population']['variant'][0],
            {'window': self.window1[0].replace(minute=0).isoformat(),
             'count': 40}
        )
        self.assertDictEqual(
            data['population']['variant'][1],
            {'window': self.window3[0].replace(minute=0).isoformat(),
             'count': 35}
        )


class TestUnenrollmentCountsApi(EnrollmentBaseTestCase, TestAuthMixin):

    def setUp(self):
        super().setUp()
        self.url = reverse('v2-experiment-unenrolls', args=['pref-flip-1'])
        self.create_data()

    def test_unenrolls_404(self):
        response = self.client.get(
            reverse('v2-experiment-unenrolls', args=['foo']))
        self.assertEqual(response.status_code, 404)

    def test_unenrolls_api(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 200)
        data = response.json()

        self.assertDictEqual(
            data['population']['control'][0],
            {'window': self.window1[0].replace(minute=0).isoformat(),
             'count': 3}
        )
        self.assertDictEqual(
            data['population']['control'][1],
            {'window': self.window3[0].replace(minute=0).isoformat(),
             'count': 3}
        )
        self.assertDictEqual(
            data['population']['variant'][0],
            {'window': self.window1[0].replace(minute=0).isoformat(),
             'count': 15}
        )
        self.assertDictEqual(
            data['population']['variant'][1],
            {'window': self.window3[0].replace(minute=0).isoformat(),
             'count': 15}
        )
