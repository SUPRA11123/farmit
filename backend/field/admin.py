from django.contrib import admin
from .models import Field

class FieldAdmin(admin.ModelAdmin):
    list_display = ('name', 'crop_type', 'type', 'coordinates', 'farm')


admin.site.register(Field, FieldAdmin)