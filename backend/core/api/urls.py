from rest_framework.routers import DefaultRouter
from queries.api.urls import query_router
from django.urls import path,include

router=DefaultRouter()
#queries
router.registry.extend(query_router.registry)
urlpatterns= [
    path('',include(router.urls))
    ]