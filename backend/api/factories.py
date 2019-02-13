import datetime

import factory
from django.utils import timezone

from . import models


class PopulationFactory(factory.django.DjangoModelFactory):
    experiment = factory.Sequence(lambda n: 'experiment-%s' % n)
    branch = factory.Iterator(['control', 'variant'])
    stamp = factory.Sequence(lambda n: timezone.now() - datetime.timedelta(days=n))
    count = factory.Sequence(lambda n: n * 111)

    class Meta:
        model = models.Population
