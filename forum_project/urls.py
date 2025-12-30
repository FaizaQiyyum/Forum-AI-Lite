from django.contrib import admin
from django.urls import path, include
from django.http import HttpResponse

def home(request):
    return HttpResponse("<h1>Backend is running!</h1><p>Please visit the frontend at <a href='http://localhost:8080'>http://localhost:8080</a></p>")

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', home, name='home'),
    path('', include('posts.urls')),
]
