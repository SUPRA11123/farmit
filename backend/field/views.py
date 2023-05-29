from django.shortcuts import render

from django.http import JsonResponse
from django.shortcuts import render
from rest_framework.decorators import api_view
from .serializers import FieldSerializer
from .models import Field
from farm.models import Farm
from user.models import User

# get all fields
@api_view(['GET'])
def getFieldsById(request, id):
    if Field.objects.filter(farm=id).exists():
        fields = Field.objects.filter(farm=id)
        serializer = FieldSerializer(fields, many=True)
        return JsonResponse(serializer.data, safe=False)
    return JsonResponse({'message': 'Fields not found'}, status=200)

@api_view(['POST'])
def create_field(request):
   # create field only if field with the same name and farm does not exist
    name = request.data['name']
    farm = request.data['farm']
    if Field.objects.filter(name=name, farm=farm).exists():
        return JsonResponse({'message': 'Field name is already registered in our system'}, status=400)
    serializer = FieldSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return JsonResponse({'message': 'Field info updated successfully'}, status=201)
    else:
        return JsonResponse({'message': 'Please check if every field is filled correctly'}, status=400)
    
@api_view(['PUT'])
def add_field_manager(request, id):
    # with id of the user, add user to the field 'manager' of the field
    if Field.objects.filter(id=id).exists():
        field = Field.objects.get(id=id)
        user = request.data['email']
        # get user by email
        if not User.objects.filter(email=user).exists():
            return JsonResponse({'message': 'Field manager not found'}, status=400)
        user = User.objects.get(email=user)
        print(user)
        field.manager = user
        field.save()

        farm = field.farm
        # add the field manager to the farm
        farm.fieldmanagers.add(user)
        farm.save()
        return JsonResponse({'message': 'Field manager added to the field successfully'}, status=200)
    
@api_view(['GET'])
def getFieldsByManager(request, id):
    # get field by field manager
    try:
        fields = Field.objects.filter(manager=id)
        serializer = FieldSerializer(fields, many=True)
        return JsonResponse(serializer.data, safe=False)
    except Field.DoesNotExist:
        return JsonResponse({'message': 'Field not found'}, status=400)

@api_view(['GET'])
def getFieldById(request, id):
    # get field by id
    try:
        field = Field.objects.get(id=id)
        serializer = FieldSerializer(field)
        return JsonResponse(serializer.data, safe=False)
    except Field.DoesNotExist:
        return JsonResponse({'message': 'Field not found'}, status=400)
    

    
    


     


# Create your views here.
