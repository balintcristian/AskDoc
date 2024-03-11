from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import QueryViewSet

query_router=DefaultRouter()
query_router.register(r'queries',QueryViewSet)