# 🌈 Wonder World — Kids' Learning + Image Editor

A playful, rainbow-themed educational web app for kids with a home playground
scene, light/dark (sunrise/night) themes, an animated cursor sparkle trail,
four learning categories (Animals, Fruits, Vegetables, Birds), and a real
OpenCV-powered image editor.

## Project structure

```
kids-image-world/
├── backend/
│   ├── main.py              # FastAPI app (serves the API + the frontend)
│   ├── image_processor.py   # All OpenCV image operations
│   ├── requirements.txt
│   └── uploads/
└── frontend/
    ├── index.html
    ├── style.css
    └── script.js
```

## Run it

```bash
cd kids-image-world/backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Open **http://localhost:8000** — the FastAPI app serves the frontend directly,
so there's nothing else to run.

## How it works

- **Home screen** — CSS/SVG-free, pure HTML+CSS playground scene (running
  kite-flying kids, see-saw, trees, clouds, rainbow) with a live sunrise ⇄
  night theme switch and a lightweight canvas-based cursor sparkle trail.
- **Categories → Items** — clicking a category (Animals / Fruits /
  Vegetables / Birds) shows four real, recognizable photos (fetched live from
  Wikipedia's public thumbnail API by article title, e.g. "Lion", "Banana")
  that pop into a big card when clicked.
- **Image Editor** — uploads go to `POST /upload`, which decodes the image
  with OpenCV and stores it server-side under a session id. Every button and
  slider calls `POST /process` with an operation name + parameters; the
  backend runs the actual OpenCV function (`image_processor.py`) and streams
  back the edited PNG — nothing is faked with CSS filters. `POST /reset`
  restores the original upload, and `GET /download` streams the current
  edited image as a file.

## API quick reference

| Method | Endpoint     | Purpose                                   |
|--------|--------------|--------------------------------------------|
| POST   | `/upload`    | Upload an image, returns a `session_id`    |
| POST   | `/process`   | Apply one OpenCV operation                 |
| POST   | `/reset`     | Restore the original image                 |
| GET    | `/download`  | Download the current edited image          |

Notes:
- Sessions are stored in memory, so restarting the server clears them.
- Internet access is needed for the live Wikipedia photos in the learning
  section; the image editor itself works fully offline once the page and
  its assets are loaded.
