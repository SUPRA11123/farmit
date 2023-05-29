from django.db import models
from farm.models import Farm
from user.models import User


class Field(models.Model):
    name = models.CharField(max_length=50)
    crop_type = models.CharField(max_length=50)
    type = models.CharField(max_length=50)
    coordinates = models.CharField(max_length=500)
    area = models.FloatField()
    farm = models.ForeignKey(Farm, on_delete=models.CASCADE, related_name='fields')
    # add manager to manage fields
    manager = models.ForeignKey(User, on_delete=models.SET_NULL, related_name='manager', blank=True, null=True)

    class Meta:
        unique_together = ('name', 'farm')

    def __str__(self):
        return self.name
