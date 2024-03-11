from rest_framework.serializers import ModelSerializer
from ..models import Query
class QuerySerializer(ModelSerializer):
    class Meta:
        model=Query
        fields=('id','question','answer')