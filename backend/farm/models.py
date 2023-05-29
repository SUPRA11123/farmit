from django.db import models
from user.models import User


class Farm(models.Model):
    name = models.CharField(max_length=60)
    country = models.CharField(max_length=60)
    latitude = models.FloatField()
    longitude = models.FloatField()
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='farms')
    farmers = models.ManyToManyField(User, related_name='farmers', blank=True)
    fieldmanagers= models.ManyToManyField(User, related_name='fieldmanagers', blank=True)

    def __str__(self):
        return self.name
        