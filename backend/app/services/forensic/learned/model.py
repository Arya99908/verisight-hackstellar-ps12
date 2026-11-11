"""Small RGB U-Net used only after an authorized screenshot corpus is available."""

from __future__ import annotations

try:
    import torch
    from torch import nn
    from torch.nn import functional as F
except ImportError as exc:  # pragma: no cover - exercised in installs without training extras
    raise RuntimeError(
        "PyTorch is required for the offline mask model. Install backend/requirements-training.txt."
    ) from exc


class ConvBlock(nn.Module):
    def __init__(self, in_channels: int, out_channels: int) -> None:
        super().__init__()
        self.layers = nn.Sequential(
            nn.Conv2d(in_channels, out_channels, kernel_size=3, padding=1, bias=False),
            nn.GroupNorm(num_groups=4, num_channels=out_channels),
            nn.GELU(),
            nn.Conv2d(out_channels, out_channels, kernel_size=3, padding=1, bias=False),
            nn.GroupNorm(num_groups=4, num_channels=out_channels),
            nn.GELU(),
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.layers(x)


class ScreenshotMaskUNet(nn.Module):
    """Compact pixel mask model; output is one tampering logit per input pixel."""

    architecture_id = "verisight-screenshot-mask-unet-v1"
    input_size = 256

    def __init__(self, base_channels: int = 8) -> None:
        super().__init__()
        self.enc1 = ConvBlock(3, base_channels)
        self.enc2 = ConvBlock(base_channels, base_channels * 2)
        self.enc3 = ConvBlock(base_channels * 2, base_channels * 4)
        self.enc4 = ConvBlock(base_channels * 4, base_channels * 8)
        self.pool = nn.MaxPool2d(2)
        self.bottleneck = ConvBlock(base_channels * 8, base_channels * 16)
        self.dec4 = ConvBlock(base_channels * 16 + base_channels * 8, base_channels * 8)
        self.dec3 = ConvBlock(base_channels * 8 + base_channels * 4, base_channels * 4)
        self.dec2 = ConvBlock(base_channels * 4 + base_channels * 2, base_channels * 2)
        self.dec1 = ConvBlock(base_channels * 2 + base_channels, base_channels)
        self.output = nn.Conv2d(base_channels, 1, kernel_size=1)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        x1 = self.enc1(x)
        x2 = self.enc2(self.pool(x1))
        x3 = self.enc3(self.pool(x2))
        x4 = self.enc4(self.pool(x3))
        x5 = self.bottleneck(self.pool(x4))

        y = self._join(x5, x4)
        y = self.dec4(y)
        y = self.dec3(self._join(y, x3))
        y = self.dec2(self._join(y, x2))
        y = self.dec1(self._join(y, x1))
        return self.output(y)

    @staticmethod
    def _join(x: torch.Tensor, skip: torch.Tensor) -> torch.Tensor:
        x = F.interpolate(x, size=skip.shape[-2:], mode="bilinear", align_corners=False)
        return torch.cat((x, skip), dim=1)
