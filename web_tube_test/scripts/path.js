import { variables } from './utils.js';

export function getPath() {
    // return variables.pathInfo.points.map(point => new BABYLON.Vector3(point.x, point.y, point.z));

    const path = [];
    const fullPath = variables.pathInfo.points;
    const step = (variables.pathInfo.points.length - 1) / (variables.totalPathPoints);


    const start = fullPath[0];
    path.push(new BABYLON.Vector3(start.x, start.y, start.z));

    for (let i = 1; i < variables.totalPathPoints; i++) {
        const index = Math.round(step * i);
        const point = fullPath[index];
        path.push(new BABYLON.Vector3(point.x, point.y, point.z));
    }

    const end = fullPath[fullPath.length - 1];
    path.push(new BABYLON.Vector3(end.x, end.y, end.z));

    return path;
}

export function createGroundPath(path, scene) {
    const shape = [
        new BABYLON.Vector3(-15, 0.05, 0),
        new BABYLON.Vector3(9, 0.05, 0)
    ];

    const mesh = BABYLON.MeshBuilder.ExtrudeShape('road', {
        shape: shape,
        path: new BABYLON.Curve3(path).getPoints(),
        sideOrientation: BABYLON.Mesh.DOUBLESIDE,
        updatable: false
    }, scene);

    const positions = mesh.getVerticesData(BABYLON.VertexBuffer.PositionKind);

    const result = [];
    for (let i = 0; i < positions.length; i += 3) {
        result.push(new BABYLON.Vector3(positions[i], positions[i + 1], positions[i + 2]));
    }

    mesh.dispose();
    return result;
}
