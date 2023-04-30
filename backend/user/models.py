from django.db import models
from django.contrib.auth.hashers import make_password

# Create your models here.

class User(models.Model):
    
    name = models.CharField(max_length=50)
    email = models.EmailField(max_length=50, unique=True)
    password = models.CharField(max_length=50)
    role = models.CharField(max_length=9)
        # allow farm to have multiple users with role 'farmer' 


    def __str__(self):
        return self.email

    def set_password(self, password):
       self.password = make_password(password)