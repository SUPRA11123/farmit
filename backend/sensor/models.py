from django.db import models

class Sensor(models.Model):
    name = models.CharField(max_length=50)
    latitude = models.FloatField()
    longitude = models.FloatField()
    farm = models.ForeignKey('farm.Farm', on_delete=models.CASCADE, related_name='sensors')


# Create your models here.

