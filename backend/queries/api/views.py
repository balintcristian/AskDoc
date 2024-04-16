from rest_framework.viewsets import ModelViewSet
from ..models import Query,Conversation
from .serializers import QuerySerializer,ConversationSerializer
import requests
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from dotenv import load_dotenv
import os
import json
from django.shortcuts import render
global api_key
api_key=os.environ.get("API_KEY")
load_dotenv()
class QueryViewSet(ModelViewSet):
    queryset = Query.objects.all()
    serializer_class = QuerySerializer


class ConversationViewSet(ModelViewSet):
    queryset=Conversation.objects.all()
    serializer_class= ConversationSerializer
    
    

def home(request):
    return render(request, 'home.html',{})
@csrf_exempt
def ask_question(request):
    if request.method == 'POST':
        global api_key
        question = json.loads(request.body).get('question')
        sourceId = json.loads(request.body).get('sourceId')
        print("sourceId: ", sourceId)
        print("Received question:", question)
        if not question:
            return JsonResponse({'error': 'Question is missing'}, status=400)
        if not sourceId:
            return JsonResponse({'error': 'Source_id is missing'}, status=400)
        api_url = 'https://api.chatpdf.com/v1/chats/message'
        print("sourceId after if checks:", sourceId)
        data =  {'sourceId': sourceId,'messages': [{'role': "user",'content': question,}]}
        print("Data object before being posted:",data)
        headers = {'x-api-key': api_key,"Content-Type": "application/json"}
        print("Heeaders object before being posted:",headers)
        
        try:
            response = requests.post(api_url, json=data, headers=headers)
            response_data = response.json()
            print("Response inside try block: ", response)
            print("ResponseData inside try block: ",response_data)
            answer = response_data['content']
            if answer:
                return JsonResponse({'answer': answer})
            else:
                return JsonResponse({'error': 'Failed to get answer from API'}, status=500)
        except requests.RequestException as e:
            return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt  # Disable CSRF protection for this view (since it's receiving requests from the frontend)
def file_to_api(request):
    if request.method == 'POST' and request.FILES:
        uploaded_file = request.FILES['file']
        files = {'file': uploaded_file}
        global api_key
        headers={"x-api-key":api_key}
        api_url = 'https://api.chatpdf.com/v1/sources/add-file'  # Replace with your API endpoint
        try:
            response = requests.post(api_url, files=files,headers=headers)
            response_data = response.json()
            sourceId=response_data['sourceId']
            print("sourceId inside try block: ", sourceId)
            return JsonResponse(response_data)
        except requests.RequestException as e:
            return JsonResponse({'This is an excepttion error': str(e)}, status=500)

    return JsonResponse({'error': 'Invalid request'}, status=400)



    return JsonResponse({'error': 'Invalid request method'}, status=405)





