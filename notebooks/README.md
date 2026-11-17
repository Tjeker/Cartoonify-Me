# Klassische Cartoon-Pipeline (Meilenstein 2)

`klassische_pipeline.ipynb` dokumentiert das klassische Vergleichsverfahren
(Bilateralfilter, k-Means-Farbquantisierung, Kantenerkennung) mit allen
Zwischenschritten, drei Stilen (`soft`, `klassisch`, `poster`) und drei
Intensitätsstufen je Stil.

Dieses Notebook ist unabhängig von `backend/` und `frontend/` — es dient der
Recherche/Doku für Meilenstein 2, nicht der App selbst. Die Integration in die
FastAPI-App folgt erst in Meilenstein 4.

## Setup

```sh
cd notebooks
python3 -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
jupyter notebook klassische_pipeline.ipynb
```

## Eigenes Foto verwenden

Das Notebook erzeugt standardmäßig ein synthetisches Testbild, da im Repository
kein echtes Foto liegt. Für aussagekräftige Ergebnisse ein eigenes Foto (z. B.
aus dem Nordsee-Datensatz) nach `notebooks/samples/` legen und in der Zelle
unter "Testbild" anpassen:

```python
original = load_image("samples/mein_foto.jpg")
```
