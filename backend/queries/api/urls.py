from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import QueryViewSet,ConversationViewSet

api_router=DefaultRouter()
api_router.register(r'queries',QueryViewSet, basename='queries')
api_router.register(r'conversations',ConversationViewSet,basename='conversation')