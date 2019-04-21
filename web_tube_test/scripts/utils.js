export const variables = {
    mapDimension: 1200,
    skySphere: null,

    cameraSettings: {
        upperLimit: 80,
        lowerLimit: 15
    }
};

export const vehicleObjects = [
    {
        meshID: 'lambo_telo',
        folder: 'assets/lambo/',
        file: 'lambo.babylon',
        rotation: {
            x: Math.PI / 2,
            y: 0,
            z: Math.PI
        },
        editMesh: (mesh) => {
            mesh.position.y += 20;
            mesh.position.x += 25;
            mesh.scaling = new BABYLON.Vector3(3, 3, 3);
        }
    }, {
        meshID: 'transporter_telo',
        folder: 'assets/transporter/',
        file: 'transporter.babylon',
        rotation: {
            x: 0,
            y: 0,
            z: 0
        },
        editMesh: (mesh) => {
            mesh.position.y += 20;
            mesh.scaling = new BABYLON.Vector3(3, 3, 3);
        }
    }, {
        meshID: 'bus_telo',
        folder: 'assets/bus/',
        file: 'bus.babylon',
        rotation: {
            x: 0,
            y: 0,
            z: Math.PI / 2
        },
        editMesh: (mesh) => {
            mesh.position.y += 20;
            mesh.position.x += 15;
            mesh.scaling = new BABYLON.Vector3(3, 3, 3);
        }
    }, {
        meshID: 'truck_telo',
        folder: 'assets/truck/',
        file: 'truck2.babylon',
        rotation: {
            x: 0,
            y: 0,
            z: 0
        },
        editMesh: (mesh) => {
            mesh.position.y += 20;
            mesh.position.x -= 15;
            mesh.scaling = new BABYLON.Vector3(3, 3, 3);
        }
    }];
