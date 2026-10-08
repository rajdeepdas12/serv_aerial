import { NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs/promises';
import { existsSync } from 'fs';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'No image file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    await fs.mkdir(uploadsDir, { recursive: true });

    const timestamp = Date.now();
    const sanitizedName = file.name ? file.name.replace(/[^a-zA-Z0-9._-]/g, '_') : 'image.jpg';
    const inputFileName = `input_${timestamp}_${sanitizedName}`;
    const outputFileName = `annotated_${timestamp}_${sanitizedName}`;

    const inputFilePath = path.join(uploadsDir, inputFileName);
    const outputFilePath = path.join(uploadsDir, outputFileName);

    await fs.writeFile(inputFilePath, buffer);

    // Locate Python inside .venv
    const possiblePythonPaths = [
      path.join(process.cwd(), '..', 'ai-engine', '.venv', 'Scripts', 'python.exe'),
      path.join(process.cwd(), '..', 'ai-engine', '.venv', 'bin', 'python'),
      'python3',
      'python'
    ];

    let pythonExe = 'python';
    for (const p of possiblePythonPaths) {
      if (existsSync(p)) {
        pythonExe = p;
        break;
      }
    }

    const scriptPath = path.join(process.cwd(), '..', 'ai-engine', 'predict.py');

    const result = await new Promise((resolve, reject) => {
      const child = spawn(pythonExe, [
        scriptPath,
        '--image', inputFilePath,
        '--output', outputFilePath,
        '--conf', '0.20'
      ]);

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('close', (code) => {
        if (code !== 0) {
          console.error('Detection script error:', stderr);
          return reject(new Error(stderr || `Process exited with code ${code}`));
        }
        try {
          // Find json block from stdout
          const jsonStart = stdout.indexOf('{');
          const jsonEnd = stdout.lastIndexOf('}');
          if (jsonStart !== -1 && jsonEnd !== -1) {
            const parsed = JSON.parse(stdout.slice(jsonStart, jsonEnd + 1));
            resolve(parsed);
          } else {
            reject(new Error('Invalid JSON output from model runner'));
          }
        } catch (e) {
          reject(e);
        }
      });
    });

    return NextResponse.json({
      ...result,
      original_image_url: `/uploads/${inputFileName}`,
      annotated_image_url: `/uploads/${outputFileName}`
    });
  } catch (error) {
    console.error('Error running detection:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process image' },
      { status: 500 }
    );
  }
}
