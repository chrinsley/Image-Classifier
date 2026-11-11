from io import BytesIO
from unittest.mock import patch

from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase
from PIL import Image


class ImageClassifierViewTests(TestCase):
    @patch(
        "imagedetection.classifier.predict_image",
        side_effect=FileNotFoundError("checkpoint missing"),
    )
    def test_missing_checkpoint_is_not_reported_as_invalid_image(self, _predict):
        image_bytes = BytesIO()
        Image.new("RGB", (1, 1)).save(image_bytes, format="PNG")
        upload = SimpleUploadedFile(
            "test.png",
            image_bytes.getvalue(),
            content_type="image/png",
        )

        response = self.client.post(
            "/imageclassifier/",
            {"file": upload, "name": "test.png"},
        )

        self.assertEqual(response.status_code, 503)
        self.assertEqual(
            response.json(),
            {"error": "The classification model is unavailable"},
        )
