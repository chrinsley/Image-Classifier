from rest_framework.decorators import api_view, permission_classes
from rest_framework import generics
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from PIL import Image as PILImage
from PIL import UnidentifiedImageError
import torch

from .serializer import ImageSerializer
from .models import Image
from .classifier import REVERSE_LABEL_MAP, model, transforms


class ImageDetectionView(generics.ListCreateAPIView):
    queryset = Image.objects.all()
    serializer_class = ImageSerializer


@api_view(["POST"])
@permission_classes([AllowAny])
def imageclassifier(request):
    file = request.FILES.get('file')
    name = request.data.get('name', 'unknown')

    if not file:
        return Response({"error": "No file provided"}, status=400)

    try:
        with PILImage.open(file) as image:
            image.verify()
        file.seek(0)
    except (UnidentifiedImageError, OSError):
        return Response({"error": "The uploaded file is not a valid image"}, status=400)

    with PILImage.open(file) as image:
        transformed_image = transforms(image.convert("RGB"))
    input_tensor = transformed_image.unsqueeze(0)

    with torch.no_grad():
        output = model(input_tensor)

    predicted_class_idx = output.argmax(dim=1).item()
    predicted_label = REVERSE_LABEL_MAP[predicted_class_idx]
    file.seek(0)
    
    serializer = ImageSerializer(data={'image': file, 'name': name})
    if serializer.is_valid():
        serializer.save()
        return Response(
            {
                "message": "Image uploaded successfully",
                "prediction": predicted_label,
                "data": serializer.data,
            },
            status=201,
        )
    
    return Response({"error": "Validation failed", "details": serializer.errors}, status=400)