"""
urls configuration
"""
from django.conf import settings
from django.contrib import admin
from django.urls import path,include
from queries.api import views
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/',include('core.api.urls')),
    path('upload-pdf/', views.file_to_api, name='upload-pdf'),
    path('ask-question/', views.ask_question, name='ask-question'),
    # path('index/',views.index, name="index"),
    path('',views.home, name="home"),
]
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL,document_root=settings.MEDIA_ROOT)