import os
import cv2
import pandas as pd
import json
from ultralytics import YOLO

# Load the fine-tuned dengue breeding site model (falling back to yolov8n.pt if training not yet completed)
model_path = 'best.pt' if os.path.exists('best.pt') else 'yolov8n.pt'
model = YOLO(model_path)
print(f"Using model: {model_path} with classes: {model.names}")

# Target public directory in the Next.js dashboard
NEXTJS_PUBLIC_DIR = "../aedes-dashboard/public"
output_img_dir = os.path.join(NEXTJS_PUBLIC_DIR, "detections")
os.makedirs(output_img_dir, exist_ok=True)

df = pd.read_csv('targets.csv', names=['filename', 'lat', 'lng'])
df = df[df['filename'] != 'filename']
detections_export = []

for index, row in df.iterrows():
    img_path = str(row['filename']).lstrip('/')
    if not os.path.exists(img_path):
        print(f"Skipping {img_path}: File not found.")
        continue

    results = model(img_path, verbose=False)[0]
    container_found = False
    label = None
    conf = None

    for box in results.boxes:
        cls_id = int(box.cls[0])
        box_conf = float(box.conf[0])

        if box_conf > 0.30:
            container_found = True
            label = model.names.get(cls_id, f"Class {cls_id}")
            conf = box_conf
            print(f"Detected {label} ({conf:.2f}) in {img_path}")
            break

    if container_found:
        annotated_img = results.plot()
        export_path = os.path.join(output_img_dir, img_path)
        cv2.imwrite(export_path, annotated_img)

        detections_export.append({
            "id": img_path,
            "image": f"/detections/{img_path}",
            "lat": float(row['lat']),
            "lng": float(row['lng']),
            "label": label,
            "confidence": round(conf, 2)
        })

output_json_path = os.path.join(NEXTJS_PUBLIC_DIR, 'detections.json')
with open(output_json_path, 'w') as f:
    json.dump(detections_export, f, indent=4)

print(f"Processed {len(detections_export)} detections. Saved results to {output_json_path}")
