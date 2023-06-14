from django.http import JsonResponse
from django.shortcuts import render
from rest_framework.decorators import api_view
from .models import Sensor
from .serializers import SensorSerializer



@api_view(['GET'])
def getSensors(request, id):
    if Sensor.objects.filter(farm=id).exists():
        sensors = Sensor.objects.filter(farm=id)
        serializer = SensorSerializer(sensors, many=True)
        return JsonResponse(serializer.data, safe=False)
    else:
        return JsonResponse([], safe=False)
    
@api_view(['POST'])
def create_sensor(request):
    serializer = SensorSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return JsonResponse(serializer.data, safe=False)
    return JsonResponse(serializer.errors, safe=False)


# Create your views here.
