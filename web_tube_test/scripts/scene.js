import { Road } from './road.js';
import { Vehicle } from './vehicle.js';
import { variables, vehicleObjects } from './utils.js';
import './height.js';

export default class Scene {
    constructor() {
        this.canvas = document.getElementById('renderCanvas');
        this.engine = new BABYLON.Engine(this.canvas, true);

        this.init();

        this.engine.runRenderLoop(() => {
            this.scene.render();
        });
    }

    init() {
        this.createCarPath();

        this.createScene();
        this.createCamera();

        variables.skySphere = this.createSkySphere();

        this.loadObject();
    }

    createScene() {
        this.scene = new BABYLON.Scene(this.engine);

        const light = new BABYLON.HemisphericLight('hemi', new BABYLON.Vector3(0, 50, 0), this.scene);

        this.createGround();
        new Road({
            path: this.mySinus,
            scene: this.scene,
            textureUrl: 'assets/cesta.png',
            textureScale: {x: 1, y: 6},
            textureOffset: {x: 0.89, y: 0}
        });
    }

    createGround() {
        const groundMaterial = new BABYLON.StandardMaterial('groundMaterial', this.scene);

        groundMaterial.alpha = 1.0;
        groundMaterial.diffuseColor = new BABYLON.Color3(1.0, 1.0, 1.0);
        groundMaterial.backFaceCulling = false;
        groundMaterial.diffuseTexture = new BABYLON.Texture('assets/grass.jpg', this.scene);

        groundMaterial.diffuseTexture.uScale = 10;
        groundMaterial.diffuseTexture.vScale = 10;

        // TODO - 19.4.2019 - create ground with smaller `mapDimension`
        const myGround = BABYLON.Mesh.CreateGroundFromHeightMap(
            'ground',
            document.getElementById('imgSave').src,
            variables.mapDimension, variables.mapDimension, 200, 0, 50,
            this.scene,
            false
        );

        myGround.rotation.y += 0.6;
        myGround.position.y = -1.5;
        myGround.diffuseColor = BABYLON.Color3.Black();
        myGround.material = groundMaterial;
    }

    createCamera() {
        const camera = new BABYLON.ArcRotateCamera('Camera', 3 * Math.PI / 2, Math.PI / 2, 30, BABYLON.Vector3.Zero(), this.scene);
        camera.attachControl(this.canvas, true);

        camera.upperRadiusLimit = variables.cameraSettings.upperLimit;
        camera.lowerRadiusLimit = variables.cameraSettings.lowerLimit;

        this.camera = camera;
    }

    createSkySphere() {
        const skySphere = BABYLON.Mesh.CreateSphere('skySphere', 160, 750 / 3, this.scene);
        skySphere.isPickable = false;

        const skySphereMaterial = new BABYLON.StandardMaterial('skySphereMaterial', this.scene);
        skySphereMaterial.backFaceCulling = false;
        skySphereMaterial.reflectionTexture = new BABYLON.Texture('assets/sky.jpg', this.scene);
        skySphereMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.PROJECTION_MODE;
        skySphereMaterial.diffuseColor = BABYLON.Color3.Black();
        skySphereMaterial.specularColor = BABYLON.Color3.Black();
        skySphere.material = skySphereMaterial;

        return skySphere;
    }

    // TODO - 19.4.2019
    //  - extract path to util.js
    //  - autoAdjust path by ground dimensions
    createCarPath() {
        const mySinus = [];
        const carPath = [];

        // const radius = 120;
        // const center = {x: 0, y: 0};
        // const step = 300;
        // for (let i = 0; i <= 2 * Math.PI; i += (Math.PI / 2) / step) {
        //     const x = (center.x + radius * Math.cos(i)) + (Math.sin(i) * 30);
        //     const y = 10 + (Math.sin(i * 5) * 5);
        //     const z = (center.y + radius * Math.sin(i)) + (Math.sin(i) * 50);
        //     mySinus.push(new BABYLON.Vector3(x, y, z));
        //
        //     const xCar = x + 13 * Math.cos(i);
        //     const yCar = y * 1.15;
        //     const zCar = z + 13 * Math.sin(i);
        //     carPath.push(new BABYLON.Vector3(xCar, yCar, zCar));
        // }

        for (let i = 0; i < 500; i++) {
            const x = i;
            const y = 15;
            const z = 0;
            mySinus.push(new BABYLON.Vector3(x, y, z));

            const xCar = x; //* Math.cos(i);
            const yCar = y + 1.15; //* 1.15;
            const zCar = z - 26; //* Math.sin(i);
            carPath.push(new BABYLON.Vector3(xCar, yCar, zCar));
        }

        this.carPath = carPath;
        this.mySinus = mySinus;
    }

    loadObject() {
        let time = -2800;
        vehicleObjects.map((obj) => {
            const vehicle = new Vehicle(this.scene);

            vehicle.load(obj.meshID, obj.folder, obj.file, obj.editMesh).then(() => {
                setTimeout(() => {
                    vehicle.addFollowPath(this.carPath);
                    vehicle.focusCar(this.camera);
                }, time += 3000);
            }).catch(e => console.error(e));
        });
    }
}
