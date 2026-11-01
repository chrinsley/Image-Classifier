from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()
# Create your models here.
class Image(models.Model):
    name = models.CharField(max_length=100)
    image = models.ImageField(upload_to='images/')