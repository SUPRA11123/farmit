from django.contrib import admin
from .models import Sensor


class SensorAdmin(admin.ModelAdmin):
    list_display = ('name', 'latitude', 'longitude', 'farm', 'field')


admin.site.register(Sensor, SensorAdmin)
