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

        this.treeTest();
    }

    createGround() {
        const groundMaterial = new BABYLON.StandardMaterial('groundMaterial', this.scene);


        groundMaterial.alpha = 1.0;
        groundMaterial.diffuseColor = new BABYLON.Color3(1.0, 1.0, 1.0);
        groundMaterial.backFaceCulling = false;

        // groundMaterial.diffuseTexture = new BABYLON.Texture('assets/grass.jpg', this.scene);
        // groundMaterial.diffuseTexture.uScale = 12;
        // groundMaterial.diffuseTexture.vScale = 12;

        // const grassTexture = new BABYLON.GrassProceduralTexture(name + 'textbawl', 512, this.scene);
        groundMaterial.ambientTexture = new BABYLON.Texture('assets/grass.png', this.scene);
        groundMaterial.ambientTexture.uScale = 30;
        groundMaterial.ambientTexture.vScale = 30;

        // TODO - 19.4.2019 - create ground with smaller `mapDimension`
        const myGround = BABYLON.Mesh.CreateGroundFromHeightMap(
            'ground',
            document.getElementById('imgSave').src,
            variables.mapDimension, variables.mapDimension, 150, 0, 4,
            this.scene,
            false
        );
        // myGround.rotation.y +=  Math.PI;
        myGround.diffuseColor = BABYLON.Color3.Black();
        myGround.material = groundMaterial;
        myGround.maxRange = 1;
    }
    treeTest() {
        //leaf material
        const green = new BABYLON.StandardMaterial('green', this.scene);
        green.diffuseTexture = new BABYLON.Texture("assets/grass.jpg", this.scene);

        //trunk and branch material
        const bark = new BABYLON.StandardMaterial('bark', this.scene);
        bark.emissiveTexture = new BABYLON.Texture("https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/Bark_texture_wood.jpg/800px-Bark_texture_wood.jpg", this.scene);
        bark.diffuseTexture = new BABYLON.Texture("https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/Bark_texture_wood.jpg/800px-Bark_texture_wood.jpg", this.scene);
        bark.diffuseTexture.uScale = 2.0;//Repeat 5 times on the Vertical Axes
        bark.diffuseTexture.vScale = 2.0;//Repeat 5 times on the Horizontal Axes

        //Tree parameters
        const trunk_height = 20;
        const trunk_taper = 0.6;
        const trunk_slices = 5;
        const boughs = 2; // 1 or 2
        const forks = 4;
        const fork_angle = Math.PI / 4;
        const fork_ratio = 2 / (1 + Math.sqrt(5)); //PHI the golden ratio
        const branch_angle = Math.PI / 3;
        const bow_freq = 2;
        const bow_height = 3.5;
        const branches = 10;
        const leaves_on_branch = 5;
        const leaf_wh_ratio = 0.5;

        const tree = createTree(trunk_height, trunk_taper, trunk_slices, bark, boughs, forks, fork_angle, fork_ratio, branches, branch_angle, bow_freq, bow_height, leaves_on_branch, leaf_wh_ratio, green, this.scene);
        tree.position.y = 0;
        tree.scaling.x = 0.4;
        tree.scaling.y = 0.4;
        tree.scaling.z = 0.4;
    }

    createCamera() {
        const camera = new BABYLON.ArcRotateCamera('Camera', 3 * Math.PI / 2, Math.PI / 2, 30, BABYLON.Vector3.Zero(), this.scene);
        camera.attachControl(this.canvas, true);

        camera.upperRadiusLimit = variables.cameraSettings.upperLimit;
        camera.lowerRadiusLimit = variables.cameraSettings.lowerLimit;

        this.camera = camera;
    }

    createSkySphere() {
        const skySphere = BABYLON.Mesh.CreateSphere('skySphere', 160, 150, this.scene);
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

        for (let i = 0; i < variables.mapDimension; i++) {
            const x = -variables.mapDimension / 2 + i;
            const y = 0.2;
            const z = 0;
            mySinus.push(new BABYLON.Vector3(x, y, z));

            const xCar = x; //* Math.cos(i);
            const yCar = y; //* 1.15;
            const zCar = z - 10; //* Math.sin(i);
            if (i > 60 && i < variables.mapDimension - 60)
                carPath.push(new BABYLON.Vector3(xCar, yCar, zCar));
        }

        this.carPath = carPath;
        this.mySinus = mySinus;
    }

    loadObject() {
        let time = -2800;
        vehicleObjects.map((obj) => {
            const vehicle = new Vehicle(this.scene);
            const cam = this.camera;
            vehicle.load(obj.meshID, obj.folder, obj.file, obj.editMesh).then(() => {
                setTimeout(() => {

                    vehicle.addFollowPath(this.carPath);
                    const $controls = $('.controls');

                    $controls.append('<button id="' + obj.meshID + 'SpeedDown"> - </button>');
                    $('#' + obj.meshID + 'SpeedDown').click(function () {
                        vehicle.changeSpeed(0.85);
                    });

                    $controls.append('<button id="' + obj.meshID + '">' + obj.meshID + '</button>');
                    $('#' + obj.meshID).click(function () {
                        vehicle.focusCar(cam);
                    });

                    $controls.append('<button id="' + obj.meshID + 'SpeedUp"> + </button><span> | </span>');
                    $('#' + obj.meshID + 'SpeedUp').click(function () {
                        vehicle.changeSpeed(1.15);
                    });
                }, time += 3000);
            }).catch(e => console.error(e));
        });
    }
}
