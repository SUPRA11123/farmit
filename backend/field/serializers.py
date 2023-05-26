from rest_framework import serializers
from .models import Field


class FieldSerializer(serializers.ModelSerializer):
    class Meta:
        model = Field
        fields = ('id', 'name', 'crop_type', 'type', 'coordinates', 'area', 'farm', 'manager')