
import logging

from PIL import Image as PILImage
from PIL import UnidentifiedImageError

from rest_framework.decorators import api_view, permission_classes
from rest_framework import generics
from rest_framework.response import Response
from rest_framework.permissions import AllowAny

from .serializer import ImageSerializer
from .models import Image

logger = logging.getLogger(__name__)


class ImageDetectionView(generics.ListCreateAPIView):

    queryset = Image.objects.all()
    serializer_class = ImageSerializer


@api_view(["POST"])
@permission_classes([AllowAny])
def imageclassifier(request):

    file = request.FILES.get("file")
    name = request.data.get("name", "unknown")

    if not file:
        return Response(
            {"error": "No file provided"},
            status=400
        )

    # Validate uploaded image
    try:

        with PILImage.open(file) as image:
            image.verify()

        file.seek(0)

        with PILImage.open(file) as image:
            from .classifier import predict_image

            predicted_label = predict_image(image)

    except FileNotFoundError:
        logger.exception("Model checkpoint is missing")

        return Response(
            {"error": "The classification model is unavailable"},
            status=503
        )

    except (UnidentifiedImageError, OSError):
        return Response(
            {"error": "The uploaded file is not a valid image"},
            status=400
        )

    except Exception:
        logger.exception("Image classification failed")

        return Response(
            {"error": "Image classification failed. Please try again."},
            status=500
        )

    # Save uploaded image
    file.seek(0)

    serializer = ImageSerializer(
        data={
            "image": file,
            "name": name
        }
    )

    if serializer.is_valid():

        serializer.save()

        return Response(
            {
                "message": "Image uploaded successfully",
                "prediction": predicted_label,
                "data": serializer.data
            },
            status=201
        )

    return Response(
        {
            "error": "Validation failed",
            "details": serializer.errors
        },
        status=400
    )
