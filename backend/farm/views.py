from django.shortcuts import render

# Create your views here.
from django.http import JsonResponse
from django.shortcuts import render
from rest_framework.decorators import api_view
from django.db.models import Q

from .models import User
from .serializers import FarmSerializer
from .models import Farm
from field.models import Field


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
def getFarmByOwnerOrFarmer(request, id):
    try:
        farm = Farm.objects.filter(Q(owner=id) | Q(farmers=id)).first()
        serializer = FarmSerializer(farm)
        return JsonResponse(serializer.data)
    except Farm.DoesNotExist:
        return JsonResponse({'message': 'Farm not found'}, status=200)

@api_view(['PUT'])
def addFarmer(request, id):
    # with id of the user, add user to the field 'farmers' of the farm
    if Farm.objects.filter(id=id).exists():
        farm = Farm.objects.get(id=id)
        user = request.data['email']
        # get user by email
        if not User.objects.filter(email=user).exists():
            return JsonResponse({'message': 'User not found'}, status=400)
        user = User.objects.get(email=user)
        farm.farmers.add(user)
        farm.save()
        return JsonResponse({'message': 'User added to the farm successfully'}, status=200)
    
@api_view(['GET'])
def getFarmByFieldManager(request, id):
    # get field by field manager
    try:
        field = Field.objects.get(manager=id)
        farm = field.farm
        serializer = FarmSerializer(farm)
        return JsonResponse(serializer.data)
    except Field.DoesNotExist:
        return JsonResponse({'message': 'Field not found'}, status=400)
    except Farm.DoesNotExist:
        return JsonResponse({'message': 'Farm not found'}, status=400)

     