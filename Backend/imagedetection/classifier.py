from pathlib import Path

import torch
from torch import nn
from torchvision.transforms import v2


LABEL_MAP = {"messi": 0, "ronaldo": 1, "neymar": 2}
REVERSE_LABEL_MAP = {value: key for key, value in LABEL_MAP.items()}

transforms = v2.Compose([
    v2.ToImage(),
    v2.Resize(size=(224, 224), antialias=True),
    v2.ToDtype(torch.float32, scale=True),
    v2.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
])


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
checkpoint_path = Path(__file__).resolve().parents[2] / "model_state.pth"
model.load_state_dict(torch.load(checkpoint_path, map_location="cpu"))
model.eval()
