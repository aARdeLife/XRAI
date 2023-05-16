// Import necessary libraries
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import { ARButton } from 'three/examples/jsm/webxr/ARButton.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as THREE from 'three';

// Set up video stream
const video = document.getElementById('video');
const stream = await navigator.mediaDevices.getUserMedia({ video: true });
video.srcObject = stream;
await new Promise((resolve) => video.onloadedmetadata = resolve);

// Set up Three.js scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 10);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.xr.enabled = true;

// Add AR button
document.body.appendChild(ARButton.createButton(renderer, { requiredFeatures: ['hit-test'] }));

// Load 3D model
const loader = new GLTFLoader();
let model;
loader.load('https://github.com/aARdeLife/XRAI/blob/d085c3081b351632cb5b1c5497e96339f92a9d59/Pol.gltf', (gltf) => {
    model = gltf.scene;
    scene.add(model);
    model.visible = false; // Initially the model is not visible
});

// Set up object detection
const objectDetectionModel = await cocoSsd.load();

renderer.setAnimationLoop(() => {
    // Run object detection
    // Run object detection
objectDetectionModel.detect(video).then(predictions => {
    // Select the first detected object, regardless of its class
    const prediction = predictions[0];
    if (prediction) {
        if (!model.visible) {
            model.visible = true;
            // Position the model based on the prediction's bounding box
            // This is a very rough approximation and you'll likely need to adjust this
            const bbox = prediction.bbox;
            const x = bbox[0] + bbox[2] / 2;
            const y = bbox[1] + bbox[3] / 2;
            model.position.set(x, y, -1); // Set z to -1 to position the model in front of the camera
        }
    } else {
        model.visible = false;
    }
});


    renderer.render(scene, camera);
});

