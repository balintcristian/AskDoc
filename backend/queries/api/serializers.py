from rest_framework import serializers
from ..models import Query
from ..models import Conversation

class ConversationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Conversation
        fields = ('id', 'name', 'pdf', 'sourceId', 'uploadDate')

class QuerySerializer(serializers.ModelSerializer):
    class Meta:
        model = Query
        fields = ['id', 'question', 'answer', 'conversation']
