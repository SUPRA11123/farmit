from django.http import JsonResponse
from .serializers import UserSerializer
from .models import User
from rest_framework.decorators import api_view
from django.contrib.auth.hashers import check_password
import jwt, datetime

@api_view(['POST'])
def signup(request):
            serializer = UserSerializer(data=request.data)
            print(request.data)
            if serializer.is_valid():
                serializer.save()
                return JsonResponse(serializer.data)
            else:
                return JsonResponse({'message': 'User already exists'}, status=200)
            
            # add a message to the response


@api_view(['POST'])
def signin(request):
    
    email = request.data['email']
    password = request.data['password']
    user = User.objects.filter(email=email).first()
    if user and check_password(password, user.password):
        serializer = UserSerializer(user)

        payload = {
            'id': user.id,
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