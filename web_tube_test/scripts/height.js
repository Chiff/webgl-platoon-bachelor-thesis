import { MAP_CANVAS, terrainGeneration } from './terrain/index.js';
import { createGroundPath, getPath } from './path.js';
import { variables } from './utils.js';

const MAGIC_ANGLE = 40; //deg
const TERRAIN_SETTINGS = {
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

export function initTerrainDraw(scene) {
    terrainGeneration(TERRAIN_SETTINGS);

    const ratio = variables.mapDimension / TERRAIN_SETTINGS.mapDimension;
    const points = createGroundPath(getPath(), scene).map(points => new BABYLON.Vector3(points.x / ratio, points.y / ratio, points.z / ratio));

    const mapCanvas = MAP_CANVAS();
    const ctx = mapCanvas.getContext('2d');

    ctx.lineWidth = 5;
    ctx.strokeStyle = 'black';

    ctx.translate(mapCanvas.width / 2, mapCanvas.height / 2);
    ctx.rotate(MAGIC_ANGLE * Math.PI / 180);

    for (let i = 0; i < points.length - 1; i += 2) {
        ctx.moveTo(points[i].x, points[i].z);
        ctx.lineTo(points[i + 1].x, points[i + 1].z);
    }

    ctx.stroke();

    document.getElementById('imgSave').src = mapCanvas.toDataURL();
    $('#terrain').remove();
}
