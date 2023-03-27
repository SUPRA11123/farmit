from django.shortcuts import render

# Create your views here.
from django.http import JsonResponse
from django.shortcuts import render
from rest_framework.decorators import api_view
from .serializers import FarmSerializer
from .models import Farm


@api_view(['POST'])
def create_farm(request):
        print(request)
        serializer = FarmSerializer(data=request.data)
        name = request.data['name']
        if Farm.objects.filter(name=name).exists():
            return JsonResponse({'message': 'Farm name is already registered in our system'}, status=400)
        if serializer.is_valid():
            serializer.save()
            return JsonResponse({'message': 'Farm info updated successfully'}, status=201)
        else:
            return JsonResponse({'message': 'Please check if every field is filled correctly'}, status=400)

# get farm by email of the owner
@api_view(['GET'])
def getFarmByOwner(request, id):
    if Farm.objects.filter(owner=id).exists():
        farm = Farm.objects.get(owner=id)
        serializer = FarmSerializer(farm)
        return JsonResponse(serializer.data)
    return JsonResponse({'message': 'Farm not found'}, status=200)