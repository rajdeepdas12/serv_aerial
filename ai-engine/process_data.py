import os
import cv2
import pandas as pd
import json
from ultralytics import YOLO

model = YOLO('yolov8n.pt')
CONTAINER_CLASSES = [39, 41, 45, 58]

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

    for box in results.boxes:
        cls_id = int(box.cls[0])
        conf = float(box.conf[0])

        if cls_id in CONTAINER_CLASSES and conf > 0.30:
            container_found = True
            label = model.names[cls_id]
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
