"""backend URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.urls import path
from django.contrib import admin
from user import views
from farm import views as farm_views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('signup/', views.signup),
    path('signin/', views.signin),
    path('getuserbyemail/<str:email>/', views.get_user),
    path('getuserbyid/<int:id>/', views.getUserById),
    path('createfarm/', farm_views.create_farm),
    path('getfarmbyowner/<int:id>/', farm_views.getFarmByOwner),
]
