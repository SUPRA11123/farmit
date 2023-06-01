from django.db import models
from django.contrib.auth.hashers import make_password
from django.core.validators import MinLengthValidator, RegexValidator

# Create your models here.

class User(models.Model):
    
    name = models.CharField(max_length=50)
    email = models.EmailField(max_length=50, unique=True)
    password = models.CharField(
        max_length=50,
        validators=[
            MinLengthValidator(8, message="Password must be at least 8 characters long."),
            RegexValidator(
                regex=r"^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)[A-Za-z\d]+$",
                message="Password must contain at least one uppercase letter, one lowercase letter, and one digit.",
            ),
        ],
    )
    role = models.CharField(max_length=20)
        # allow farm to have multiple users with role 'farmer' 


    def __str__(self):
        return self.email

    def set_password(self, password):
       self.password = make_password(password)