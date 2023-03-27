from django.contrib import admin
from .models import Farm

class FarmAdmin(admin.ModelAdmin):
    list_display = ('name', 'country', 'latitude', 'longitude', 'owner')


admin.site.register(Farm, FarmAdmin)