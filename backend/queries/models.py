from django.db import models
from django.contrib.auth.models import User
class Conversation(models.Model):
    name = models.TextField(max_length=50)
    pdf=models.FileField(upload_to='docs/')
    sourceId=models.TextField(max_length=25, blank=True)
    uploadDate=models.DateTimeField(auto_now_add=True)
    author=models.ForeignKey(User, on_delete=models.CASCADE)
    def __str__(self) -> str:
        return f"Doc title: { self.pdf.name}, ConversationId: {self.pk},Author:{self.author.username}, Upload: {self.uploadDate.ctime()}"
class Query(models.Model):
    question = models.TextField()
    answer = models.TextField()
    uploadDate=models.DateTimeField(auto_now_add=True)
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE)
    def __str__(self) -> str:
        return f"CoversationId: {self.conversation.name} QueryId: {self.pk} \n Query answer: {self.answer} \n Query question: {self.question} \n Upload: {self.uploadDate.ctime()}"