from django.db import models
from farm.models import Farm


class Field(models.Model):
    name = models.CharField(max_length=50)
    crop_type = models.CharField(max_length=50)
    type = models.CharField(max_length=50)
    coordinates = models.CharField(max_length=500)
    farm = models.ForeignKey(Farm, on_delete=models.CASCADE, related_name='fields')

    class Meta:
        unique_together = ('name', 'farm')
