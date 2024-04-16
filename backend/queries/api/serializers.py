from rest_framework.serializers import ModelSerializer
from ..models import Query
from ..models import Conversation

class ConversationSerializer(ModelSerializer):
    class Meta:
        model = Conversation
        fields = ('id', 'name', 'pdf', 'sourceId', 'uploadDate')

class QuerySerializer(ModelSerializer):
    class Meta:
        model = Query
        fields = ('id', 'question', 'answer', 'conversation_id')