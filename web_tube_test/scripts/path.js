import { variables } from './utils.js';

export function getPath() {
    return variables.pathInfo.points.map(point => new BABYLON.Vector3(point.x, point.y, point.z));

    // manualna generacia jednotlivych bodov
    // const path = [];
    //
    // const step = 300;
    // const center = {x: 0, y: 0};
    // const radius = 100;
    //
    // const parts = variables.mapDimension / step;
    // const start = -variables.mapDimension / 2;
    // for (let i = 0; i < step; i += 1) {
    //     const x = start + parts * i;
    //
    //     path.push({
    //         x: x,
    //         y: 0,
    //         z: Math.sin(x / 35) * 15
    //     });
    // }
    //
    // for (let i = 0; i <= 2 * Math.PI; i += (Math.PI / 2) / step) {
    //     const x = (center.x + radius * Math.sin(i)) + (Math.cos(i) * 30);
    //     // const y = 10 + (Math.sin(i * 5) * 5);
    //     const y = 0;
    //     const z = (center.y + radius * Math.sin(i)) + (Math.sin(i) * 50);
    //     path.push(new BABYLON.Vector3(x, y, z));
    // }
    //
    // return path.map(point => new BABYLON.Vector3(point.x, point.y, point.z));
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
