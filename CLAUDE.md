# Cartoonify-Me

Gruppenprojekt im Master-Modul **Medienverarbeitung** (Uni Oldenburg / OFFIS, WS 2026/27).
Team: Marten Wempe, Hendrik Peper. Kommunikation mit mir (dem Nutzer) auf Deutsch.

## Aufgabenstellung (Topic 2 „Cartoonify Me!“)

- Interaktives Tool, das Fotos cartoonisiert
- Verschiedene Intensitätsstufen und Stile (z. B. subtil, Comic, starke Konturen, Aquarell)
- Wichtige Bildstrukturen erhalten, Texturen und Details vereinfachen
- Verfahren vergleichen für **Porträts, Objekte und komplexe Hintergründe**
- Auswerten, wie gut wichtige Merkmale und Bildinhalte erhalten bleiben

**Projektziel:** Eine App, die Fotos in wählbaren Stilen cartoonisiert und klassische
Verfahren, GANs und einen Mehrfach-Adapter-Diffusionsansatz für Porträts, Objekte und
Hintergründe vergleicht.

## Vorgaben des Moduls (wichtig für die Bewertung)

- Umsetzung mit **Python und OpenCV**
- Dokumentation des gesamten Projekts im **Jupyter Notebook**, inklusive Grenzen und Stolpersteinen
- Eine **Pipeline, die die einzelnen Verarbeitungsschritte zeigt** (Zwischenergebnisse sichtbar machen)
- Regelmäßige Zwischenpräsentationen, Abschlusspräsentation am **12.02.** (20 Min. + 10 Min. Diskussion),
  Demo-Video des Prototyps, Notebook-Abgabe ca. zwei Wochen danach
- In der mündlichen Prüfung werden die verwendeten Methoden theoretisch eingeordnet.
  Code und Notebook sollen deshalb nachvollziehbar erklären, *warum* ein Verfahren so funktioniert.

## Verfahren

1. **Klassisch:** kantenerhaltende Glättung (Bilateralfilter, Mean Shift), Farbreduktion
   (k-Means, Posterisierung, SLIC-Superpixel), Konturen (adaptiver Threshold, Canny, DoG/XDoG).
   Parameter werden später zu Reglern in der App.
2. **GAN:** vortrainiertes Modell (z. B. AnimeGAN oder White-Box Cartoonization), kein eigenes Training.
3. **Mehrfach-Adapter-Diffusion** nach Jeon et al. (2025), „A photo cartoonization method based on
   text-to-image diffusion model“, Neurocomputing 620, 129221:
   - Stable Diffusion (Anime-Checkpoint, im Paper MeinaMix) bleibt eingefroren
   - Style-Adapter = LoRA, Stil per Trigger-Wort
   - Farb-Struktur-Adapter = ControlNet mit SLIC-Superpixel- und Canny-Bild (Paper: 0,7 : 0,3)
   - Semantik-Adapter = IP-Adapter (CLIP-Bild-Embedding über eigene Cross-Attention)
   - Paper-Gewichte: Semantik 0,5, Style 1,0
   - Die Autoren veröffentlichen keinen Code. Wir bauen das mit vortrainierten Bausteinen aus
     Hugging Face `diffusers` nach. **Kein eigenes Training.** Ein fertiges Superpixel-ControlNet gibt
     es nicht, daher ControlNet Canny + Tile/Color mit dem Superpixel-Bild als Eingabe.
   - Schwäche laut Paper: Porträts werden zu Anime-Figuren (Identität geht verloren).
     Unsere Erweiterung: z. B. IP-Adapter FaceID oder höheres Semantik-Gewicht.
   - Entscheidung: `diffusers` statt ComfyUI (Notebook-Doku und Einbindung ins Backend).
   - GPU nötig (ca. 8–12 GB VRAM, Colab oder Uni-Rechner); auf dem Mac nur langsam.

Evaluation wie im Paper: SSIM (Struktur), CLIP-I (Inhalt), Content Loss (VGG), FID (Stil),
eventuell eine kleine Nutzerbefragung.

## Meilensteine

1. Konzept und Recherche – erledigt
2. **Klassische Pipeline – aktuell** (Aufgabe von Marten, Ziel laut `Doku/TODO`: 17.11.)
3. Diffusions-Pipeline (+ GAN)
4. App und Evaluation
5. Abschluss (Präsentation 12.02., Demo-Video, Notebook)

Aufgabenverteilung und Termine stehen in `Doku/TODO`, bisherige Doku in `Doku/Doku`.

## Aktueller Fokus: Meilenstein 2

- Klassische Cartoonisierung mit OpenCV: zuerst Superpixel (SLIC) und Canny, dann
  Bilateralfilter, k-Means und adaptive Kanten zu einer vollständigen Pipeline kombinieren.
- **Noch keine Einbindung in die GUI/das Frontend.** Das kommt in Meilenstein 4.
- Verarbeitung als reine Funktionen in einem eigenen Modul unter `backend/src/`
  (z. B. `classical.py`): NumPy-Bild + Parameter rein, Bild raus, Zwischenschritte optional zurückgeben.
  Das Notebook ruft diese Funktionen nur auf, später nutzt sie auch das Backend.
- Jupyter Notebook für Doku und Experimente anlegen (z. B. `notebooks/`), mit Zwischenergebnissen
  der Pipeline und Beispielen für Porträt, Objekt und Landschaft.

## Basisprojekt (vom Lehrstuhl vorgegeben)

- `backend/`: FastAPI + Pillow, Start mit `conda activate simple-webapp`, dann
  `cd backend && python src/main.py` (http://127.0.0.1:8000, API-Doku unter `/docs`)
  - `src/main.py`: Endpunkte (Beispiel `/apply-blur`)
  - `src/image_processing.py`: Bildverarbeitung (Beispiel Box-Blur), Upload-Grenzen 10 MiB / 20 MP
- `frontend/`: Vue 3 + Vuetify + Vite, Start mit `cd frontend && npm run dev` (http://127.0.0.1:5173);
  Vite leitet `/api` an das Backend weiter. `src/api.js` enthält die Backend- und CEWE-Aufrufe.
- Python 3.12 in der Conda-Umgebung `simple-webapp`. Neue Pakete (z. B. `opencv-python`,
  `scikit-image`, `numpy`, `jupyter`) in `backend/requirements.txt` eintragen.
- Code-Kommentare auf Englisch wie im Basisprojekt, Stil des Basisprojekts beibehalten.
- Der CEWE-Zugangsschlüssel in `frontend/src/config.js` ist vom Kurs vorgegeben – nicht ändern.

## Materialien außerhalb des Repos

Modulordner (iCloud):
`~/Library/Mobile Documents/com~apple~CloudDocs/Uni/Master/Medienverarbeitung/`

- `Cartoonify/`: Paper als PDF, Kick-off-Präsentation, Meilensteinplan
- `Datensätze/`: `Landschaften.zip`, `Nordsee Bilder.zip` (Testbilder)
- `Vorlesungen/`: Vorlesungsfolien (u. a. Administration mit Themen und Bewertung, Histogramme und Punktoperationen)

Datensätze und große Modelle **nicht** ins Repo committen.

## Arbeitsweise

- Vor `git push` und vor größeren Umbauten am Basisprojekt nachfragen.
