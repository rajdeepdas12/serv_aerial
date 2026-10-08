import argparse
import json
import os
import sys
import time
import cv2
from ultralytics import YOLO

def main():
    parser = argparse.ArgumentParser(description="Run YOLO inference on a single image")
    parser.add_argument("--image", required=True, help="Path to input image")
    parser.add_argument("--output", default=None, help="Path to save annotated image")
    parser.add_argument("--conf", type=float, default=0.25, help="Confidence threshold")
    args = parser.parse_args()

    script_dir = os.path.dirname(os.path.abspath(__file__))
    best_model_path = os.path.join(script_dir, "best.pt")
    base_model_path = os.path.join(script_dir, "yolov8n.pt")

    is_custom_trained = os.path.exists(best_model_path)
    model_to_use = best_model_path if is_custom_trained else base_model_path

    if not os.path.exists(model_to_use):
        print(json.dumps({"error": f"Model file not found: {model_to_use}"}))
        sys.exit(1)

    t0 = time.time()
    model = YOLO(model_to_use)
    results = model(args.image, conf=args.conf, verbose=False)[0]
    inference_time = round((time.time() - t0) * 1000, 1)

    # Relevant classes for breeding risk
    coco_containers = {39: "bottle", 41: "cup", 45: "bowl", 58: "potted plant", 75: "vase"}

    detections = []
    max_conf = 0.0

    for box in results.boxes:
        cls_id = int(box.cls[0])
        conf = float(box.conf[0])
        xyxy = [int(v) for v in box.xyxy[0].tolist()]
        label = model.names.get(cls_id, f"Class {cls_id}")

        if is_custom_trained:
            is_breeding_site = True
        else:
            is_breeding_site = cls_id in coco_containers

        risk_level = "High Risk" if is_breeding_site and conf >= 0.50 else ("Moderate Risk" if is_breeding_site else "Low / Non-Target")

        if conf > max_conf:
            max_conf = conf

        detections.append({
            "class_id": cls_id,
            "label": label,
            "confidence": round(conf, 4),
            "confidence_pct": f"{round(conf * 100, 1)}%",
            "accuracy_score": round(conf * 100, 1),
            "box": xyxy,
            "is_breeding_site": is_breeding_site,
            "risk_level": risk_level
        })

    annotated_saved = False
    output_path = args.output
    if output_path:
        annotated_img = results.plot()
        os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
        cv2.imwrite(output_path, annotated_img)
        annotated_saved = True

    response = {
        "success": True,
        "model_file": os.path.basename(model_to_use),
        "is_custom_trained": is_custom_trained,
        "classes_in_model": list(model.names.values()),
        "inference_time_ms": inference_time,
        "total_detections": len(detections),
        "detections": detections,
        "highest_accuracy_pct": f"{round(max_conf * 100, 1)}%" if detections else "0%",
        "has_breeding_hazard": any(d["is_breeding_site"] for d in detections),
        "annotated_image": output_path if annotated_saved else None
    }

    print(json.dumps(response))

if __name__ == "__main__":
    main()
