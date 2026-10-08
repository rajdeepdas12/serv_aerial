# serv_aerial (Project Aedes)
**Autonomous Edge-AI Dengue Breeding Site Detection System**

---

## 🛰️ Project Overview

**serv_aerial** is an edge-AI vector surveillance platform designed to identify, localize, and map potential *Aedes aegypti* mosquito breeding grounds (discarded containers, plastic bottles, cups, bowls, potted plants) using aerial or rover payloads.

The project consists of three integrated components:
1. **Hardware Payload (`esp32_payload/`)**: C++ firmware for an ESP32-CAM module with an attached GPS receiver and SD card logger.
2. **AI Inference Engine (`ai-engine/`)**: Python computer vision pipeline powered by YOLOv8 trained on container classes (classes `39: bottle`, `41: cup`, `45: bowl`, `58: potted plant`) that processes drone/rover imagery, tags GPS coordinates, and draws bounding boxes around risks.
3. **Command Dashboard (`aedes-dashboard/`)**: Next.js (App Router) command center with React-Leaflet interactive mapping displaying high-risk coordinates, confidence scores, and photographic evidence.

---

## 📁 Project Structure

```text
serv_aerial/
│
├── aedes-dashboard/ (aliased as serv_aerial)   <-- Next.js Web Application
│   ├── app/
│   │   ├── globals.css                         <-- Global CSS styling
│   │   ├── layout.js                          <-- Root layout with dark theme
│   │   └── page.js                            <-- Main serv_aerial command UI
│   ├── components/
│   │   └── Map.js                             <-- Dynamic React-Leaflet interactive map
│   ├── public/                                <-- Bridge where AI outputs data
│   │   ├── detections.json                    <-- Exported GPS coordinates & threats
│   │   └── detections/
│   │       └── img_1.jpg                      <-- YOLO annotated detection image
│   └── package.json                           <-- Dependencies (Next.js, Leaflet, React-Leaflet)
│
├── ai-engine/                                 <-- AI Inference Pipeline
│   ├── .venv/                                 <-- Python virtual environment
│   ├── process_data.py                        <-- YOLOv8 inference & annotation script
│   ├── targets.csv                            <-- Simulated SD card GPS telemetry log
│   ├── img_1.jpg                              <-- Raw test photo
│   ├── requirements.txt                       <-- Python requirements
│   └── yolov8n.pt                             <-- Pre-trained YOLOv8 nano model
│
└── esp32_payload/                             <-- Embedded Firmware
    └── esp32_payload.ino                      <-- ESP32-CAM firmware with GPS & SD card writer
```

---

## 🚀 Execution Workflow

### 1. Web Dashboard
The web server runs the interactive map on `http://localhost:3000`.
To start the web server from the project root:
```powershell
npm run dev
```
*(Or navigate to the dashboard directory: `cd aedes-dashboard && npm run dev`)*


### 2. Run the AI Inference Pipeline
Whenever new images and GPS coordinates are added from the field:
```powershell
cd ai-engine
python process_data.py
```
- The script detects any container classes with confidence > 0.30.
- Bounding boxes are drawn onto the images.
- Annotated photos and `detections.json` are automatically published to the Next.js `public/` directory.

### 3. ESP32-CAM Hardware Payload
To deploy on physical hardware:
1. Open the `esp32_payload/esp32_payload.ino` file in the Arduino IDE.
2. Select board **AI Thinker ESP32-CAM**.
3. Connect your GPS receiver to GPIO 13 (RXD2).
4. Insert a MicroSD card formatted as FAT32.
5. Flash the sketch to the ESP32-CAM.
