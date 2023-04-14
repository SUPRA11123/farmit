from django.shortcuts import render

from django.http import JsonResponse
from django.shortcuts import render
from rest_framework.decorators import api_view
from .serializers import FieldSerializer
from .models import Field

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
    



# Create your views here.
