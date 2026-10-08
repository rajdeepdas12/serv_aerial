import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function POST(request) {
  try {
    const body = await request.json();
    const detectionsFilePath = path.join(process.cwd(), 'public', 'detections.json');

    let current = [];
    try {
      const data = await fs.readFile(detectionsFilePath, 'utf-8');
      current = JSON.parse(data);
    } catch (e) {
      current = [];
    }

    // Default or jitter position near existing ones
    const baseLat = current.length > 0 ? current[0].lat : 22.5726;
    const baseLng = current.length > 0 ? current[0].lng : 88.3639;
    const randomOffset = () => (Math.random() - 0.5) * 0.005;

    const newDetection = {
      id: body.id || `upload_${Date.now()}`,
      image: body.image || '/detections/img_1.jpg',
      lat: body.lat || +(baseLat + randomOffset()).toFixed(4),
      lng: body.lng || +(baseLng + randomOffset()).toFixed(4),
      label: body.label || 'Breeding Site',
      confidence: body.confidence || 0.85,
      timestamp: new Date().toISOString()
    };

    current.unshift(newDetection);
    await fs.writeFile(detectionsFilePath, JSON.stringify(current, null, 4));

    return NextResponse.json({ success: true, pinned: newDetection });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
