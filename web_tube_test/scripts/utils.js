export const variables = {
    mapDimension: 400,
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
            mesh.scaling = new BABYLON.Vector3(1, 1, 1);
        }
    }, {
        meshID: 'transporter',
        folder: 'assets/transporter/',
        file: 'transporter.babylon',
        editMesh: (mesh) => {
            mesh.position.y += 20;
            mesh.scaling = new BABYLON.Vector3(0.8, 0.8, 0.8);
        }
    }, {
        meshID: 'bus',
        folder: 'assets/bus/',
        file: 'bus.babylon',
        editMesh: (mesh) => {
            mesh.position.y += 20;
            mesh.position.x += 15;
            mesh.scaling = new BABYLON.Vector3(1, 1, 1);
        }
    }, {
        meshID: 'truck',
        folder: 'assets/truck/',
        file: 'truck2.babylon',
        editMesh: (mesh) => {
            mesh.position.y += 20;
            mesh.position.x -= 15;
            mesh.scaling = new BABYLON.Vector3(1, 1, 1);
        }
    }];
