"""Start the local backend with: python src/main.py (from backend/)."""

import uvicorn
from fastapi import FastAPI, HTTPException, UploadFile
from fastapi.responses import Response
from PIL import Image

from image_processing import process_image_blur

MAX_UPLOAD_BYTES = 10 * 1024 * 1024
app = FastAPI(title="Media Processing API")


# Vite forwards the frontend's /api/apply-blur request here as /apply-blur.
@app.post("/apply-blur")
def apply_blur(file: UploadFile) -> Response:
    """Receive an uploaded image and return the blurred image as PNG."""
    if file.size is not None and file.size > MAX_UPLOAD_BYTES:
        raise HTTPException(413, "Images must be 10 MiB or smaller.")

    try:
        # FastAPI runs this normal def route in a worker thread; Pillow can read the file directly.
        image_bytes = process_image_blur(file.file)
    except (OSError, ValueError, SyntaxError, Image.DecompressionBombError) as exc:
        raise HTTPException(
            400,
            "Upload a valid JPEG, PNG, WebP, GIF, BMP, or TIFF image with at most 20 million pixels.",
        ) from exc
    return Response(image_bytes, media_type="image/png")


if __name__ == "__main__":
    # Start the local server; reload=True restarts it when Python files change.
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
