from django.urls import path
from .views import ImageDetectionView, imageclassifier


urlpatterns = [
    path('images/', ImageDetectionView.as_view(), name='image-detection'),
    path('imageclassifier/', imageclassifier, name='imageclassifier'),
]