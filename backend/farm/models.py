from django.db import models
from user.models import User


class Farm(models.Model):
    name = models.CharField(max_length=50)
    country = models.CharField(max_length=50)
    latitude = models.FloatField()
    longitude = models.FloatField()
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='farms')

    def __str__(self):
        return self.name