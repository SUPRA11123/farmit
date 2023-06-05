from django.shortcuts import render

from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from .models import Task
from .serializers import TaskSerializer
from rest_framework.decorators import api_view
from farm.models import Farm
from user.models import User


@api_view(['GET'])
def get_task(request, task_id):
    task = get_object_or_404(Task, id=task_id)
    serializer = TaskSerializer(task)
    return JsonResponse(serializer.data)

@api_view(['POST'])
def create_task(request):
    serializer = TaskSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return JsonResponse(serializer.data, status=201)
    return JsonResponse(serializer.errors, status=400)

@api_view(['PUT'])
def update_task(request, task_id):
    task = get_object_or_404(Task, id=task_id)
    serializer = TaskSerializer(task, data=request.data)
    if serializer.is_valid():
        serializer.save()
        return JsonResponse(serializer.data)
    return JsonResponse(serializer.errors, status=400)


@api_view(['DELETE'])
def delete_task(request, task_id):
    task = get_object_or_404(Task, id=task_id)
    task.delete()
    return JsonResponse({'message': 'Task deleted successfully'}, status=204)

@api_view(['GET'])
def get_tasks_by_farm(request, id):
    farm = Farm.objects.get(id=id)
    farmers = farm.farmers.all()
    fieldmanagers = farm.fieldmanagers.all()
    users = farmers | fieldmanagers
    
    # Get the tasks which have one of the users assigned as the farmer
    tasks = Task.objects.filter(farmer__in=users)
    serializer = TaskSerializer(tasks, many=True)
    return JsonResponse(serializer.data, safe=False)

@api_view(['GET'])
def get_tasks_by_assignee(request, id):
   farmer = User.objects.get(id=id)
   tasks = Task.objects.filter(farmer=farmer)
   serializer = TaskSerializer(tasks, many=True)
   return JsonResponse(serializer.data, safe=False)

 
 




