from django.contrib import admin

from django.contrib import admin
from .models import Task

class TaskAdmin(admin.ModelAdmin):
    list_display = ('title', 'description', 'farmer', 'field', 'created_at', 'status')
    list_filter = ('farmer', 'created_at')
    search_fields = ('title', 'description', 'farmer__username')
    date_hierarchy = 'created_at'

admin.site.register(Task, TaskAdmin)