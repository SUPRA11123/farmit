from django.db import models

from django.db import models
from user.models import User
from field.models import Field

class Task(models.Model):
    title = models.CharField(max_length=100)
    description = models.TextField()
    farmer = models.ForeignKey(User, on_delete=models.CASCADE)
    field = models.ForeignKey(Field, on_delete=models.CASCADE, default=None)
    created_at = models.DateTimeField(auto_now_add=True)
    deadline = models.DateTimeField()

    def __str__(self):
        return self.title
