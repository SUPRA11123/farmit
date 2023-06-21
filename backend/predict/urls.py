from django.urls import path

from backend import settings
from . import views
urlpatterns = [
    #path('', views.yolov5_view, name='post')
    path('results/', views.yolov5_view, name='results')
]