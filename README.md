# WebApp Base Project

A starting point for Media Processing 2026/2027 projects, using Vue, Vuetify,
FastAPI, and Pillow. Upload a photo, apply a blur, and compare the result.
You can also log in to CEWE myPhotos to use photos from your account.

## How the project works

- The **frontend** is the interface you see in your browser. It uses Vue for the
  application and Vuetify for ready-made interface components, such as buttons.
- The **backend** is a Python server. FastAPI receives requests from the frontend,
  and Pillow processes the images.

Both parts run locally on your computer, in separate terminals.

## First-time setup

### 1. Install Node.js and npm

Download and install **Node.js 24 LTS** from the
[official Node.js website](https://nodejs.org/en/download/), using the installer
for your operating system. Keep the default installation options.

Node.js runs the frontend development tools. Its installer also includes **npm**,
the package manager that downloads the frontend's JavaScript dependencies, so
you do not need to install npm separately.

After installation, open a new terminal and check:

```sh
node --version
npm --version
```

On Windows, if PowerShell blocks `npm.ps1`, use `npm.cmd` instead of `npm`
for all commands in this guide, for example `npm.cmd --version`.

### 2. Install Conda and create a Python environment

**Conda** keeps a project's Python version and installed packages separate from
other projects. We will use it to create an environment with **Python 3.12**,
then use Python's package manager, **pip**, to install the backend dependencies.

If you already have Miniconda installed, skip the installation below.
Otherwise, install **Miniconda**, the smaller distribution that includes Conda:

1. Follow the [official Miniconda installation guide](https://www.anaconda.com/docs/getting-started/installation)
   for your operating system, choosing Miniconda rather than the full Anaconda Distribution.
2. On Windows, choose **Just Me** and keep the default options. After installation,
   open **Anaconda Prompt** from the Start menu. You can use this for the commands
   below without configuring PowerShell.
3. On macOS or Linux, open a new terminal after following the installer instructions.

Create the project environment once:

```sh
conda create --name simple-webapp python=3.12 pip
```

We use this project environment instead of installing packages into Conda's
default `base` environment.

### 3. Open the project folder

Clone this repository.
Open the `webapp-base-project` folder in your editor, for example VS Code.

In your terminal, navigate to that same folder. On Windows, for example:

```sh
cd "C:\path\to\webapp-base-project"
```

### 4. Install and start the backend

From the project folder, run:

```sh
conda activate simple-webapp
cd backend
python -m pip install -r requirements.txt
python src/main.py
```

`conda activate` selects the environment for this terminal. Your prompt should
show `(simple-webapp)`.
The pip command installs the packages listed in `requirements.txt` into that
environment. `python src/main.py` then starts the backend server.

Leave this terminal running. The backend is at http://127.0.0.1:8000.
Open http://127.0.0.1:8000/docs to see and try its API endpoints.

### 5. Install and start the frontend

Open a **second terminal** and navigate to the frontend folder folder. Run:

```sh
cd frontend
npm ci
npm run dev
```

`npm ci` installs the frontend packages. `npm run dev` starts Vite, the frontend development server.
You do not need to activate the Python environment in this terminal.

Open **http://127.0.0.1:5173** in your browser to use the app. Try uploading an
image and applying the blur. Keep both terminals running while working;
changes to your code reload automatically. Press **Ctrl+C** in each terminal
to stop its server.

No `.env` files or extra configuration are needed. The frontend forwards `/api`
requests to the local backend using the proxy in `frontend/vite.config.js`.
The course CEWE access key is already set in `frontend/src/config.js`.

## Starting again later

You only install the tools and create the Conda environment once. For each new
work session, open two terminals, both starting in the project folder.

**Backend terminal:**

```sh
conda activate simple-webapp
cd backend
python src/main.py
```

**Frontend terminal:**

```sh
cd frontend
npm run dev
```

Then open http://127.0.0.1:5173.

### Useful Conda commands

- `conda env list` lists your environments; `*` marks the active one.
- `conda activate simple-webapp` switches this terminal to the project environment.
  Do this whenever you open a new backend terminal.
- `conda deactivate` leaves the current environment. Stop the backend with
  **Ctrl+C** first. This does not delete the environment or its installed packages.

For more details, see the [Conda environment guide](https://docs.conda.io/projects/conda/en/stable/user-guide/tasks/manage-environments.html).

## Project structure and where to start coding

`frontend/` contains the browser application; `backend/` contains the Python
server. Inside `frontend/src/`, `views/` contains pages, `components/` contains
reusable interface pieces, and `router/` connects URLs to pages.

| File                                           | What it does                                    |
| ---------------------------------------------- | ----------------------------------------------- |
| `frontend/src/main.js`                         | Start Vue and register Vuetify and the router   |
| `frontend/src/App.vue`                         | Define the app's overall layout                 |
| `frontend/src/components/MainComponent.vue`    | Upload a photo and show the processing result   |
| `frontend/src/components/GalleryComponent.vue` | Browse and select photos                        |
| `frontend/src/api.js`                          | Send requests to the Python backend and CEWE    |
| `frontend/src/store.js`                        | Share photos and login state between components |
| `frontend/src/config.js`                       | Set API addresses and the course access key     |
| `backend/src/main.py`                          | Receive requests from the frontend              |
| `backend/src/image_processing.py`              | Process images; add your own effects here       |

The example accepts JPEG, PNG, WebP, GIF, BMP, and TIFF images up to 10 MiB
and 20 million pixels. It returns PNG images. CEWE processing uses the original
photo, not its small gallery preview. CEWE login lasts for the current browser tab.

## Learn more
[Vue](https://vuejs.org/guide/introduction.html),
[Vuetify](https://vuetifyjs.com/), [FastAPI](https://fastapi.tiangolo.com/),
[Pillow](https://pillow.readthedocs.io/).

## CEWE API

In collaboration with CEWE, the Media Processing course provides students with access to the CEWE myPhotos API (https://www.cewe-myphotos.com/de-de/), allowing you to integrate external photo storage and processing into your projects.

You can access the documentation for the CEWE API at https://tcmp.photoprintit.com/apidocs/swagger-ui/index.html#, where all available API endpoints are listed, along with instructions on how to use them. (Username: CEWE, Password: Freude).
