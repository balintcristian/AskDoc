from rest_framework.viewsets import ModelViewSet
from ..models import Query
from .serializers import QuerySerializer
import requests
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from dotenv import load_dotenv
import os
import json

# Declare file_path as a global variable
global file_path
file_path = ""

def read_txt_file():
    filename = 'pdfId.txt'
    global file_path
    script_dir = os.path.dirname(os.path.abspath(__file__))
    two_levels_up = os.path.abspath(os.path.join(script_dir, os.pardir, os.pardir))
    core_dir = os.path.join(two_levels_up, 'core')
    static_dir = os.path.join(core_dir, 'static')
    file_path = os.path.join(static_dir, filename)  # Update the global file_path here
    try:
        with open(file_path, 'r') as file:
            content = file.read()
        return content
    except FileNotFoundError:
        return None

def set_file_content(content):
    global file_path
    try:
        with open(file_path, 'w') as file:
            file.write(content)
    except IOError as e:
        print(f"Error writing to file '{file_path}': {e}")


global sourceId
sourceId = {read_txt_file()}

global api_key
api_key=os.environ.get("API_KEY")
load_dotenv()
class QueryViewSet(ModelViewSet):
    queryset=Query.objects.all()
    serializer_class= QuerySerializer

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
            global sourceId
            sourceId=response_data['sourceId']
            print("SourceId inside try block: ", sourceId)
            set_file_content(sourceId)
            print(read_txt_file())
            return JsonResponse(response_data)
        except requests.RequestException as e:
            return JsonResponse({'error': str(e)}, status=500)

    return JsonResponse({'error': 'Invalid request'}, status=400)


@csrf_exempt
def ask_question(request):
    if request.method == 'POST':
        global sourceId
        global api_key
        question = json.loads(request.body).get('question')
        print("sourceId: ", sourceId)
        print("Received question:", question)
        if not question:
            return JsonResponse({'error': 'Question is missing'}, status=400)
        if not sourceId:
            return JsonResponse({'error': 'source_id is missing'}, status=400)
        api_url = 'https://api.chatpdf.com/v1/chats/message'
        data =  {'sourceId': sourceId,'messages': [{'role': "user",'content': question,}]}
        headers = {'x-api-key': api_key,"Content-Type": "application/json"}
        
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

    return JsonResponse({'error': 'Invalid request method'}, status=405)





