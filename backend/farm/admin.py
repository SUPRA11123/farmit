from django.contrib import admin
from .models import Farm

class FarmAdmin(admin.ModelAdmin):
    list_display = ('name', 'country', 'latitude', 'longitude', 'owner', 'get_farmers', 'get_fieldmanagers')

    def get_farmers(self, obj):
        return ", ".join([f.email for f in obj.farmers.all()])
    
    get_farmers.short_description = 'Farmers'

    def get_fieldmanagers(self, obj):
        return ", ".join([f.email for f in obj.fieldmanagers.all()])
    
    get_fieldmanagers.short_description = 'Field Managers'
    

    
admin.site.register(Farm, FarmAdmin)