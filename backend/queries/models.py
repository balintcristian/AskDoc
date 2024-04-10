from django.db import models

class Query(models.Model):
    question = models.TextField()
    answer = models.TextField()
    id=models.Index
    def __str__(self) -> str:
        return f"id: {self.id} Query answer: {self.answer} \n Query question: {self.question}"
    