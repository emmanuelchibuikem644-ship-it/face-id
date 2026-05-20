// lib/faceApi.js  — lightweight @vladmandic/face-api wrapper
// Models go in /public/models/
// Download from: https://github.com/vladmandic/face-api/tree/master/model

let faceapi = null;
let modelsLoaded = false;

export async function loadModels() {
  if (modelsLoaded) return;
  if (!faceapi) faceapi = await import("@vladmandic/face-api");

  const MODEL_URL = "/models";
  await Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
    faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_URL),
    faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
  ]);
  modelsLoaded = true;
}

export async function getFaceDescriptor(videoEl) {
  if (!faceapi) return null;
  const opts = new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.5 });
  const det = await faceapi
    .detectSingleFace(videoEl, opts)
    .withFaceLandmarks(true)
    .withFaceDescriptor();
  return det ? det.descriptor : null;
}

export function euclideanDistance(a, b) {
  return Math.sqrt(a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0));
}

export function findBestMatch(descriptor, candidates, threshold = 0.5) {
  let best = null;
  for (const c of candidates) {
    const dist = euclideanDistance(Array.from(descriptor), c.faceDescriptor);
    if (dist < threshold && (!best || dist < best.distance)) {
      best = { studentId: c.studentId, distance: dist };
    }
  }
  return best;
}
