# serv_aerial
**Autonomous Edge-AI Dengue Breeding Site Detection System**

---

## 🛰️ Project Overview

**serv_aerial** is an edge-AI vector surveillance platform designed to identify, localize, and map potential *Aedes aegypti* mosquito breeding grounds (discarded containers, tires, plastic bottles, coconut shells, drain inlets, vases) using aerial or field payloads.

The project consists of three integrated components:
1. **Command Dashboard (`aedes-dashboard/`)**: Next.js command center featuring interactive Leaflet GIS mapping, real-time threat visualization, and an interactive **Photo Upload & Model Accuracy Inspection** suite.
2. **AI Engine (`ai-engine/`)**: Python computer vision pipeline powered by YOLOv8 supporting dataset training (`train.py`), single-image accuracy evaluation (`predict.py`), and batch geotagged processing (`process_data.py`).
3. **Hardware Payload (`esp32_payload/`)**: C++ firmware for an ESP32-CAM module with an attached GPS receiver and SD card logger.

---

## 📁 Project Structure

```text
serv_aerial/
│
├── aedes-dashboard/                            <-- Next.js Web Application
│   ├── app/
│   │   ├── api/
│   │   │   ├── detect/route.js                <-- Photo upload & YOLO accuracy inference API
│   │   │   └── pin/route.js                   <-- Pin manual detection to live map
│   │   ├── globals.css                        <-- Global dark-mode design system
│   │   ├── layout.js                          <-- Root layout with dark theme
│   │   └── page.js                            <-- Main command UI & tabbed workspace
│   ├── components/
│   │   ├── Map.js                             <-- Dynamic React-Leaflet interactive map
│   │   └── PhotoInspector.js                  <-- Photo upload, bounding box & accuracy tester
│   ├── public/                                <-- AI outputs and sample media
│   │   ├── detections.json                    <-- Exported GPS coordinates & threats
│   │   ├── samples/                           <-- Test sample images (bottle, tire)
│   │   └── detections/                        <-- YOLO annotated detection imagery
│   └── package.json                           <-- Dependencies (Next.js, Leaflet, React-Leaflet)
│
├── ai-engine/                                 <-- AI Pipeline & Model Training
│   ├── train.py                               <-- YOLOv8 fine-tuning script with device detection
│   ├── predict.py                             <-- Single-image inference & accuracy calculator
│   ├── process_data.py                        <-- Batch GPS telemetry annotation script
│   ├── targets.csv                            <-- Simulated GPS telemetry log
│   ├── img_1.jpg                              <-- Raw test photo
│   └── requirements.txt                       <-- Python requirements (ultralytics, opencv, torch)
│
└── esp32_payload/                             <-- Embedded Firmware
    └── esp32_payload.ino                      <-- ESP32-CAM firmware with GPS & SD card writer
```

---

## 🚀 Execution Workflow

### 1. Web Dashboard & Photo Accuracy Tester
The web server runs the interactive map and photo accuracy tester on `http://localhost:3000`.
To start the web server from the project root:
```bash
npm run dev
```
Navigate to **Photo Accuracy Tester** to upload photos, verify confidence scores, view bounding box annotations, and pin new hazards directly to the live map.

### 2. Fine-Tuning YOLOv8 on Custom Dengue Dataset
To train the YOLOv8 model on custom Roboflow breeding site data (Bottle, Coconut-Exocarp, Drain-Inlet, Tire, Vase):
```bash
cd ai-engine
python train.py --epochs 30 --imgsz 640
```
- Automatically uses CUDA GPU if available, otherwise CPU.
- Automatically places the trained `best.pt` model directly into the pipeline.

### 3. Batch Telemetry Processing
To process simulated field telemetry images against GPS coordinates:
```bash
cd ai-engine
python process_data.py
```
- Detects breeding site objects with confidence > 0.30.
- Annotates images and exports updated coordinates to `aedes-dashboard/public/detections.json`.

### 4. ESP32-CAM Hardware Payload
To deploy on physical hardware:
1. Open `esp32_payload/esp32_payload.ino` in the Arduino IDE.
2. Select board **AI Thinker ESP32-CAM**.
3. Connect your GPS receiver to GPIO 13 (RXD2).
4. Insert a MicroSD card formatted as FAT32.
5. Flash the sketch to the ESP32-CAM.
.
