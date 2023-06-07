from django.http import JsonResponse

from .serializers import UserSerializer
from .models import User
from rest_framework.decorators import api_view
from django.contrib.auth.hashers import check_password
import jwt, datetime
from farm.models import Farm
from field.models import Field



@api_view(['POST'])
def signup(request):
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return JsonResponse(serializer.data)
    else:
        errors = serializer.errors
        return JsonResponse({'message': 'Validation failed', 'errors': errors}, status=400)


@api_view(['POST'])
def signin(request):
    
    email = request.data['email']
    # make password
    password = request.data.get('password', '')  # get password if exists, else set to empty string
    
    user = User.objects.filter(email=email).first()
    if user and (not password or check_password(password, user.password)):
        if password == '' or check_password(password, user.password):
            serializer = UserSerializer(user)

            payload = {
                'id': user.id,
                'role': user.role,
                'exp': datetime.datetime.utcnow() + datetime.timedelta(minutes=60),
                'iat': datetime.datetime.utcnow()
            }

            token = jwt.encode(payload, 'secret', algorithm='HS256')

            print(jwt.decode(token, 'secret', algorithms=['HS256']))

            reponse = JsonResponse(serializer.data)

            reponse.set_cookie(key='jwt', value=token, httponly=True)
            
        
        return JsonResponse({'token': token})
    return JsonResponse({'message': 'Invalid credentials'}, status=401)

@api_view(['GET'])
def get_user(request, email):
            if User.objects.filter(email=email).exists():
                user = User.objects.get(email=email)
                serializer = UserSerializer(user)
                return JsonResponse(serializer.data)
            return JsonResponse({'message': 'User not found'}, status=200)


@api_view(['GET'])
def getUserById(request, id):
    if User.objects.filter(id=id).exists():
        user = User.objects.get(id=id)
        serializer = UserSerializer(user)
        return JsonResponse(serializer.data)
    return JsonResponse({'message': 'User not found'}, status=200)

@api_view(['GET'])
def getTeam(request, id):
    # get all users of the farm
    try:
        farm = Farm.objects.get(id=id)
        farmers = farm.farmers.all()
        fieldManagers = farm.fieldmanagers.all()
        users = farmers | fieldManagers
        # add owner to the list
        users = users | User.objects.filter(id=farm.owner.id)
        serializer = UserSerializer(users, many=True)
        return JsonResponse(serializer.data, safe=False)
    except Farm.DoesNotExist:
        return JsonResponse({'message': 'Farm not found'}, status=400)


@api_view(['DELETE'])
def deleteUser(request, email):
    if User.objects.filter(email=email).exists():
        user = User.objects.get(email=email)
        user.delete()
        return JsonResponse({'message': 'User deleted'}, status=200)
    return JsonResponse({'message': 'User not found'}, status=200)

@api_view(['DELETE'])
def deleteAccount(request):
    password = request.data['password']
    email = request.data['email']
    if User.objects.filter(email=email).exists():
        user = User.objects.get(email=email)
        if check_password(password, user.password):
            user.delete()
            return JsonResponse({'message': 'User deleted'}, status=200)
        return JsonResponse({'message': 'Invalid credentials'}, status=401)
    
@api_view(['PUT'])
def changePassword(request):
    # i want to send the current password and the new one
    # check if the current password is correct
    # if it is, change it to the new one
    # if not, return error
    email = request.data['email']
    currentPassword = request.data['currentPassword']
    newPassword = request.data['newPassword']
    if User.objects.filter(email=email).exists():
        user = User.objects.get(email=email)
        if check_password(currentPassword, user.password):
            user.password = newPassword
            user.set_password(newPassword)
            user.save()
            return JsonResponse({'message': 'Password changed'}, status=200)
        return JsonResponse({'message': 'Invalid credentials'}, status=401)
    
@api_view(['PUT'])
def editUser(request, id):
    user = User.objects.get(id=id)
    role = user.role
    newRole = request.data['role']
    if role == 'farmer' and newRole == 'field manager':
        fields = request.data['fields']
        for field in fields:
            field = Field.objects.get(id=field)
            field.manager = user
            field.save()

            farm = field.farm
            farm.fieldmanagers.add(user)
            farm.farmers.remove(user)
            farm.save()

            user.role = newRole
            user.save()
    elif role == 'field manager' and newRole == 'farmer':
        # get the fields that the user is managing
        fields = Field.objects.filter(manager=user)
        for field in fields:
            field.manager = None
            field.save()

            farm = field.farm
            farm.fieldmanagers.remove(user)
            farm.farmers.add(user)
            farm.save()
            
            user.role = newRole
            user.save()
    elif role == 'field manager' and newRole == 'field manager':
        fields = request.data['fields']

         # if the user is already managing fields, remove him from them
        if Field.objects.filter(manager=user).exists():
                managedFields = Field.objects.filter(manager=user)
                for field in managedFields:
                    field.manager = None
                    field.save()

                    farm = field.farm
                    farm.fieldmanagers.remove(user)
                    farm.save()

        for field in fields:
            
            field = Field.objects.get(id=field)
            field.manager = user
            field.save()

            farm = field.farm
            farm.fieldmanagers.add(user)
            farm.save()

            user.role = newRole
            user.save()

    elif role == 'farmer' and newRole == 'farmer':
        pass

    else:
        return JsonResponse({'message': 'Invalid role'}, status=400)
    
    return JsonResponse({'message': 'User updated'}, status=200)


        
            





    

  
