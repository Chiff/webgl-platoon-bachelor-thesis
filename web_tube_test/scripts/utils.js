export const variables = {
    mapDimension: 1200,
    skySphere: null,

    cameraSettings: {
        upperLimit: 1200,
        lowerLimit: 0
    }
};

export const vehicleObjects = [
    {
        meshID: 'lambo',
        folder: 'assets/lambo/',
        file: 'lambo.babylon',
        editMesh: (mesh) => {
            mesh.position.y += 20;
            mesh.position.x += 25;
            mesh.scaling = new BABYLON.Vector3(3, 3, 3);
        }
    }, {
        meshID: 'transporter',
        folder: 'assets/transporter/',
        file: 'transporter.babylon',
        editMesh: (mesh) => {
            mesh.position.y += 20;
            mesh.scaling = new BABYLON.Vector3(3, 3, 3);
        }
    }, {
        meshID: 'bus',
        folder: 'assets/bus/',
        file: 'bus.babylon',
        editMesh: (mesh) => {
            mesh.position.y += 20;
            mesh.position.x += 15;
            mesh.scaling = new BABYLON.Vector3(3, 3, 3);
        }
    }, {
        meshID: 'truck',
        folder: 'assets/truck/',
        file: 'truck2.babylon',
        editMesh: (mesh) => {
            mesh.position.y += 20;
            mesh.position.x -= 15;
            mesh.scaling = new BABYLON.Vector3(3, 3, 3);
        }
    }];
