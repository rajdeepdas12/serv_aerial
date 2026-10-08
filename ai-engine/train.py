import argparse
import os
import shutil
import torch
from ultralytics import YOLO

def main():
    parser = argparse.ArgumentParser(description="Train YOLOv8 on dengue breeding site dataset")
    parser.add_argument("--epochs", type=int, default=30, help="Number of epochs (default: 30)")
    parser.add_argument("--imgsz", type=int, default=640, help="Image size (default: 640)")
    parser.add_argument("--batch", type=int, default=16, help="Batch size (default: 16)")
    parser.add_argument("--workers", type=int, default=4, help="Worker threads (default: 4)")
    args = parser.parse_args()

    script_dir = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(script_dir, "yolov8n.pt")
    data_yaml = os.path.join(script_dir, "dataset", "data.yaml")
    target_best_pt = os.path.join(script_dir, "best.pt")

    # Automatic device detection
    device = "0" if torch.cuda.is_available() else "cpu"
    print(f"[{'CUDA' if torch.cuda.is_available() else 'CPU'}] Selected training device: {device}")
    print(f"Loading base model: {model_path}")
    print(f"Dataset configuration: {data_yaml}")
    print(f"Training parameters: epochs={args.epochs}, imgsz={args.imgsz}, batch={args.batch}")

    model = YOLO(model_path)

    print(f"Starting YOLOv8 training for {args.epochs} epochs (imgsz={args.imgsz})...")
    results = model.train(
        data=data_yaml,
        epochs=args.epochs,
        imgsz=args.imgsz,
        batch=args.batch,
        workers=args.workers,
        device=device,
        project=os.path.join(script_dir, "runs", "detect"),
        name="train",
        exist_ok=True
    )

    print("Training finished!")

    # Locate generated best.pt
    best_weights_path = None
    if hasattr(model, "trainer") and hasattr(model.trainer, "best") and model.trainer.best:
        if os.path.exists(str(model.trainer.best)):
            best_weights_path = str(model.trainer.best)

    if not best_weights_path:
        default_candidate = os.path.join(script_dir, "runs", "detect", "train", "weights", "best.pt")
        if os.path.exists(default_candidate):
            best_weights_path = default_candidate

    if best_weights_path and os.path.exists(best_weights_path):
        print(f"Found best model weights at: {best_weights_path}")
        shutil.copy2(best_weights_path, target_best_pt)
        print(f"Successfully copied best weights to: {target_best_pt}")
    else:
        print(f"Warning: Could not automatically locate best.pt. Please check {os.path.join(script_dir, 'runs')}")

if __name__ == "__main__":
    main()
