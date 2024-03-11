from rest_framework.viewsets import ModelViewSet
from ..models import Query
from .serializers import QuerySerializer
class QueryViewSet(ModelViewSet):
    queryset=Query.objects.all()
    serializer_class= QuerySerializer