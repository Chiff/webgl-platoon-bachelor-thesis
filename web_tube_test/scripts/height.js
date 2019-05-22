import terrainGeneration from './terrain/index.js';
import { variables } from './utils.js';

const settings = {
    genShadows: false,
    mapDimension: 512,
    mapType: 3,
    roughness: 30,
    smoothIterations: 10,
    smoothness: 1,
    sunX: -100,
    sunY: -100,
    sunZ: 4,
    unitSize: '1'
};

terrainGeneration(settings);

const ratio = variables.mapDimension / settings.mapDimension;

const points = [];
const radius = 120 * ratio;
const center = {x: 0, y: 0};
const step = 150;
// for (let i = 0; i <= 2 * Math.PI; i += (Math.PI / 2) / step) {
//     const x = (center.x + radius * Math.cos(i)) + (Math.sin(i) * 30);
//     const y = 10 + (Math.sin(i * 5) * 5);
//     const z = (center.y + radius * Math.sin(i)) + (Math.sin(i) * 50);
//
//     const x2 = x - (-11 * ratio) * Math.cos(i);
//     const y2 = y;
//     const z2 = z - (-11 * ratio) * Math.sin(i);
//
//     const x3 = x - (50 * ratio) * Math.cos(i);
//     const y3 = y;
//     const z3 = z - (50 * ratio) * Math.sin(i);
//
//     points.push({
//         x: x2 + settings.mapDimension / 2,
//         y: y2 + settings.mapDimension / 2,
//         z: z2 + settings.mapDimension / 2
//     });
//
//     points.push({
//         x: x3 + settings.mapDimension / 2,
//         y: y3 + settings.mapDimension / 2,
//         z: z3 + settings.mapDimension / 2
//     });
// }

for (let i = 0; i < settings.mapDimension; i++) {
    const x = -settings.mapDimension / 2 + i;
    const y = 0;
    const z = (Math.sin(50));
    // const x = i;
    // const y = 15;
    // const z = 0;

    const x2 = x;
    const y2 = y;
    const z2 = z - 5 * ratio;

    const x3 = x;
    const y3 = y;
    const z3 = z + 29 * ratio;

    points.push({
        x: x2 + settings.mapDimension / 2,
        y: y2 + settings.mapDimension / 2,
        z: z2 + settings.mapDimension / 2
    });

    points.push({
        x: x3 + settings.mapDimension / 2,
        y: y3 + settings.mapDimension / 2,
        z: z3 + settings.mapDimension / 2
    });
}

const mapCanvas = document.getElementById('terrain');
const ctx = mapCanvas.getContext('2d');
ctx.lineWidth = 2;

for (let i = 0; i < points.length - 1; i += 2) {
    let y = (((points[i].y + points[i + 1].y) / 2) / 7.5) /** 4.35*/;
    let opacity = 1;

    ctx.strokeStyle = 'black';
    ctx.moveTo(points[i].x, points[i].z);
    ctx.lineTo(points[i + 1].x, points[i + 1].z);
}
ctx.stroke();

const imgSave = document.getElementById('imgSave');
imgSave.src = mapCanvas.toDataURL();


