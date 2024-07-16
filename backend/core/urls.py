"""
urls configuration
"""
from django.conf import settings
from django.contrib import admin
from django.urls import path,include
from queries.api import views
from django.conf.urls.static import static
from queries.views import CreateUserView,CurrentUserView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/',include('core.api.urls')),
    path('user/register/',CreateUserView.as_view(),name='register'),
    path('token/',TokenObtainPairView.as_view(),name='get-token'),
    path('token/refresh/',TokenRefreshView.as_view(),name='refesh-token'),
    path('api-auth/',include('rest_framework.urls')),
    path('upload-pdf/', views.file_to_api, name='upload-pdf'),
    path('ask-question/', views.ask_question, name='ask-question'),
    path('user/me/', CurrentUserView.as_view(), name='current-user'),
    path('links/',views.app, name="links"),
    path('',views.app, name="app"),
]
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL,document_root=settings.MEDIA_ROOT)