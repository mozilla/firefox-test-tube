from unittest import mock

from django.contrib.auth.models import User
from django.test import TestCase
from django.urls import reverse


class TestIndex(TestCase):

    def setUp(self):
        User.objects.create_user(username='testuser',
                                 email='example@mozilla.com',
                                 password='password')
        self.url = reverse('index')

    def test_non_authed_user(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 302)
        self.assertEqual(response.url, '/accounts/authenticate/?next=/')

    def test_authed_user(self):
        self.client.login(username='testuser', password='password')
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 200)

    @mock.patch('builtins.open', create=True)
    def test_missing_yarn_build_files(self, mock_open):
        self.client.login(username='testuser', password='password')
        mock_open.side_effect = FileNotFoundError()

        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 501)
