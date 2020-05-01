import { variables } from './utils.js';

export function getPath() {
    return variables.pathInfo.points.map(point => new BABYLON.Vector3(point.x, point.y, point.z));
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

export function createCarPath(path) {
    return path;
}
