
from pathlib import Path
from functools import lru_cache


LABEL_MAP = {
    "messi": 0,
    "ronaldo": 1,
    "neymar": 2
}

REVERSE_LABEL_MAP = {
    value: key for key, value in LABEL_MAP.items()
}


@lru_cache(maxsize=1)
def load_classifier():

    # Heavy imports happen only when classification is requested
    import torch
    from torch import nn
    from torchvision.transforms import v2

    class ImageModel(nn.Module):

        def __init__(self):
            super().__init__()

            self.sequential = nn.Sequential(
                nn.Conv2d(3, 32, 3),
                nn.ReLU(),
                nn.MaxPool2d(2),

                nn.Conv2d(32, 64, 3),
                nn.ReLU(),
                nn.MaxPool2d(2, 2),

                nn.AdaptiveAvgPool2d((1, 1)),
                nn.Flatten(),
                nn.Linear(64, 3),
            )

        def forward(self, x):
            return self.sequential(x)

    model = ImageModel()

    checkpoint_path = (
        Path(__file__).resolve().parents[2] / "model_state.pth"
    )

    if not checkpoint_path.exists():
        raise FileNotFoundError(
            f"Checkpoint not found: {checkpoint_path}"
        )

    state_dict = torch.load(
        checkpoint_path,
        map_location="cpu",
        weights_only=True
    )

    model.load_state_dict(state_dict)
    model.eval()

    preprocess = v2.Compose([
        v2.ToImage(),
        v2.Resize((224, 224), antialias=True),
        v2.ToDtype(torch.float32, scale=True),
        v2.Normalize(
            mean=[0.485, 0.456, 0.406],
            std=[0.229, 0.224, 0.225]
        ),
    ])

    return torch, model, preprocess


def predict_image(image):

    torch, model, preprocess = load_classifier()

    image_tensor = preprocess(image.convert("RGB"))

    input_tensor = image_tensor.unsqueeze(0)

    with torch.inference_mode():

        output = model(input_tensor)

        predicted_class_idx = output.argmax(dim=1).item()

    return REVERSE_LABEL_MAP[predicted_class_idx]
