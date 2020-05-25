import { MAP_CANVAS, terrainGeneration } from './terrain/index.js';
import { createGroundPath } from './path.js';
import { variables } from './utils.js';
import { Vector3 } from '@babylonjs/core';
import $ from 'jquery';

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

export function initTerrainDraw(scene, path) {
    terrainGeneration(TERRAIN_SETTINGS);

    const ratio = variables.mapDimension / TERRAIN_SETTINGS.mapDimension;
    const points = createGroundPath(path, scene).map(points => new Vector3(points.x / ratio, points.y / ratio, points.z / ratio));

    const mapCanvas = MAP_CANVAS();
    const ctx = mapCanvas.getContext('2d');

    ctx.lineWidth = 10;
    ctx.strokeStyle = 'black';

    ctx.translate(mapCanvas.width / 2, mapCanvas.height / 2);
    ctx.scale(variables.pathInfo.scale.x, variables.pathInfo.scale.y);

    for (let i = 0; i < points.length - 1; i += 2) {
        ctx.moveTo(points[i].x, points[i].z);
        ctx.lineTo(points[i + 1].x, points[i + 1].z);
    }

    ctx.stroke();

    document.getElementById('imgSave').src = mapCanvas.toDataURL();
    $('#terrain').hide();

    if (!variables.debug) {
        $('#imgSave').hide();
    }
}
