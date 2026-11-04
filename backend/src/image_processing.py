"""Image processing functions. Add your own effects here."""

import io
from typing import BinaryIO

from PIL import Image, ImageFilter, ImageOps

# Limits stop accidentally huge photos from using too much memory.
MAX_IMAGE_PIXELS = 20_000_000
SUPPORTED_FORMATS = ("JPEG", "PNG", "WEBP", "GIF", "BMP", "TIFF")


def process_image_blur(file: BinaryIO) -> bytes:
    """Blur the first frame, preserving transparency and normalizing EXIF orientation."""
    # Pillow reads the uploaded file directly, without an extra copy of its bytes.
    with Image.open(file, formats=SUPPORTED_FORMATS) as original:
        if original.width * original.height > MAX_IMAGE_PIXELS:
            raise ValueError("Images must contain at most 20 million pixels.")

        # Palette images (including GIFs) must be converted before BoxBlur.
        has_alpha = "A" in original.getbands() or "transparency" in original.info
        # Correct camera rotation and keep transparency when converting color modes.
        with (
            ImageOps.exif_transpose(original).convert(
                "RGBA" if has_alpha else "RGB"
            ) as image,
            # Change this filter or its radius to experiment with your own effect.
            image.filter(ImageFilter.BoxBlur(10)) as blurred,
        ):
            # Do not return EXIF, GPS, or other source metadata in the result.
            blurred.info.clear()
            # Encode the result as PNG bytes to send back to the browser.
            output = io.BytesIO()
            blurred.save(output, format="PNG")
            return output.getvalue()
