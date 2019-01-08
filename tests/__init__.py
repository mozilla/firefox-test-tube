import datetime

from django.test import TestCase
from django.utils import timezone

from backend.api import factories


class DataTestCase(TestCase):

    maxDiff = None

    @classmethod
    def setUpTestData(cls):

        populations = []
        pop1 = None
        pop2 = None

        for i in (2, 1):
            for b in ('control', 'variant'):
                for d in (0, 1, 2):
                    pop = factories.PopulationFactory(
                        experiment='experiment-%s' % i,
                        branch=b,
                        stamp=timezone.now() - datetime.timedelta(days=d),
                        count=i + d * 111
                    )
                    populations.append(pop)

                    if pop1 is None and i == 1:
                        pop1 = pop
                    if pop2 is None and i == 2:
                        pop2 = pop

        cls.populations = populations
        cls.pop1 = pop1
        cls.pop2 = pop2


class TestAuthMixin:

    def test_403(self, *args, **kwargs):
        if hasattr(self, 'url'):
            self.client.logout()
            response = self.client.get(self.url)
            self.assertEqual(response.status_code, 403)
