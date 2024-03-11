from django.db import models

# Create your models here.
class Query(models.Model):
    question = models.TextField()
    answer = models.TextField()

    def __str__(self) -> str:
        return f"Query answer: {self.answer} \n Query question:{self.question}"
    