from django.db import models


class Enrollment(models.Model):
    type = models.CharField(max_length=100)
    experiment = models.CharField(max_length=255, db_index=True)
    branch = models.CharField(max_length=255, blank=True, null=True)
    window_start = models.DateTimeField(db_index=True)
    window_end = models.DateTimeField()
    enroll_count = models.IntegerField()
    unenroll_count = models.IntegerField()
    graduate_count = models.IntegerField(blank=True, null=True)
    update_count = models.IntegerField(blank=True, null=True)
    enroll_failed_count = models.IntegerField(blank=True, null=True)
    unenroll_failed_count = models.IntegerField(blank=True, null=True)
    update_failed_count = models.IntegerField(blank=True, null=True)


class Population(models.Model):
    experiment = models.CharField(max_length=255, db_index=True)
    branch = models.CharField(max_length=255, blank=True, null=True)
    stamp = models.DateTimeField(db_index=True)
    count = models.IntegerField()
