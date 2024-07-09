from rest_framework.viewsets import ModelViewSet
from rest_framework.response import Response
from rest_framework import status
from ..models import Query,Conversation
from .serializers import QuerySerializer,ConversationSerializer
import requests
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from dotenv import load_dotenv
import os
import json
from django.shortcuts import render
import logging

logger = logging.getLogger(__name__)


global api_key
api_key=os.environ.get("API_KEY")
load_dotenv()

class QueryViewSet(ModelViewSet):
    queryset = Query.objects.all()
    serializer_class = QuerySerializer

class ConversationViewSet(ModelViewSet):
    queryset = Conversation.objects.all()
    serializer_class = ConversationSerializer
    def destroy(self, request, *args, **kwargs):
        conversation = self.get_object()
        headers = {
        'x-api-key': api_key,
        'Content-Type': 'application/json',
        }
        data = {
        'sources': [conversation.sourceId],
        }
        self.perform_destroy(conversation)
        try:
            external_api_url = 'https://api.chatpdf.com/v1/sources/delete'
            response = requests.post(external_api_url, json=data,headers=headers)
            response.raise_for_status()
        except requests.exceptions.RequestException as e:
            error_msg = f'Failed to delete conversation or call external API: {e}'
            logger.error(error_msg)
            return Response({'error': error_msg}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        logger.info('Conversation deleted successfully and API call successful.')
        return Response({'message': 'Conversation deleted successfully and API call successful.'}, status=status.HTTP_204_NO_CONTENT)

def index(request):
    return render(request, 'index.html',{})

def home(request):
    return render(request, 'home.html',{})

@csrf_exempt
def ask_question(request):
    if request.method == 'POST':
        global api_key
        try:
            data = json.loads(request.body)
            question = data.get('question')
            sourceId = data.get('sourceId')
            if not question:
                return JsonResponse({'error': 'Question is missing'}, status=400)
            if not sourceId:
                return JsonResponse({'error': 'SourceId is missing'}, status=400)
            api_url = os.environ.get('ChatPDF_API')
            payload = {'sourceId': sourceId, 'messages': [{'role': "user", 'content': question}]}            
            print("Data object before being posted:", payload)
            headers = {'x-api-key': api_key, "Content-Type": "application/json"}
            print("Headers object before being posted:", headers)
            response = requests.post(api_url, json=payload, headers=headers)
            response_data = response.json()
            print("Response inside try block:", response)
            answer = response_data.get('content')
            if answer is not None:
                return JsonResponse({'answer': answer})
            else:
                return JsonResponse({'error': 'No answer available from API'}, status=404)
        except json.JSONDecodeError as e:
            return JsonResponse({'error': 'Invalid JSON format in request body'}, status=400)
        except requests.RequestException as e:
            return JsonResponse({'error': str(e)}, status=500)
    else:
        return JsonResponse({'error': 'Invalid request method'}, status=405)


@csrf_exempt  # Disable CSRF protection for this view (since it's receiving requests from the frontend)
def file_to_api(request):
    if request.method == 'POST' and request.FILES:
        uploaded_file = request.FILES.get('file')
        if uploaded_file:
            files = {'file': uploaded_file}
            api_url = 'https://api.chatpdf.com/v1/sources/add-file'
            global api_key
            headers = {"x-api-key": api_key}
            try:
                response = requests.post(api_url, files=files, headers=headers)
                response_data = response.json()
                sourceId = response_data.get('sourceId')
                print("sourceId inside try block:", sourceId)
                return JsonResponse(response_data)
            except requests.RequestException as e:
                return JsonResponse({'error': str(e)}, status=500)
        return JsonResponse({'error': 'Invalid request'}, status=400)
    return JsonResponse({'error': 'Invalid request method'}, status=405)





