from django.contrib import admin
from .models import Sensor


class SensorAdmin(admin.ModelAdmin):
    list_display = ('name', 'latitude', 'longitude', 'farm')


admin.site.register(Sensor, SensorAdmin)
