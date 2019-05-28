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
        // this.scene.createDefaultEnvironment();

        const light = new BABYLON.HemisphericLight('hemi', new BABYLON.Vector3(0, 50, 0), this.scene);

        this.createGround();
        this.road = new Road({
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
        groundMaterial.specularColor = new BABYLON.Color3(0.3, 0.3, 0.3);

        // groundMaterial.diffuseTexture = new BABYLON.Texture('assets/grass.jpg', this.scene);
        // groundMaterial.diffuseTexture.uScale = 12;
        // groundMaterial.diffuseTexture.vScale = 12;

        // const grassTexture = new BABYLON.GrassProceduralTexture(name + 'textbawl', 512, this.scene);
        groundMaterial.ambientTexture = new BABYLON.Texture('assets/grass.png', this.scene);
        groundMaterial.ambientTexture.uScale = 30;
        groundMaterial.ambientTexture.vScale = 30;

        // TODO - 19.4.2019 - create ground with smaller `mapDimension`
        const ground = BABYLON.Mesh.CreateGroundFromHeightMap(
            'ground',
            document.getElementById('imgSave').src,
            variables.mapDimension, variables.mapDimension, 200, 0, 4,
            this.scene,
            false
        );
        // myGround.rotation.y +=  Math.PI;
        ground.diffuseColor = BABYLON.Color3.Black();
        ground.material = groundMaterial;
        ground.maxRange = 1;

        this.ground = ground;
    }

    treeTest() {
        const success = function (s) {
            console.log(s);
        };
        // BABYLON.SceneLoader.Append('assets/foliage/', 'flower.babylon', this.scene, success);
        // BABYLON.SceneLoader.Append('assets/foliage/', 'bush.babylon', this.scene, success);
        BABYLON.SceneLoader.Append('assets/foliage/', 'grass.babylon', this.scene, success);
        BABYLON.SceneLoader.Append('assets/foliage/', 'tree-1-2.babylon', this.scene, success);
        BABYLON.SceneLoader.Append('assets/foliage/', 'tree-2.babylon', this.scene, success);

        const self = this;
        this.scene.executeWhenReady(function () {
            const parentSPS = self.ground;
            const positions = [...parentSPS.getVerticesData(BABYLON.VertexBuffer.PositionKind)];

            let road = self.scene.getMeshByID('road');
            // road.enableEdgesRendering();
            // road.edgesWidth = 4.0;
            // road.edgesColor = new BABYLON.Color4(0, 0, 1, 1);

            const myBuilder = function (particle, i, s, y = 0) {
                if (positions.length < 3) {
                    throw 'OUT OF INDICES!';
                }

                let randomPosition = Math.round(Math.random() * (positions.length - 90)) + 90;
                randomPosition -= (randomPosition % 3);

                particle.position = new BABYLON.Vector3(
                    positions[randomPosition],
                    positions[randomPosition + 1] + y,
                    positions[randomPosition + 2]
                );

                particle.scaling.y += Math.random() * 0.8 + 0.3;

                positions.splice(randomPosition - 9, 12);
                // if (road.intersectsMesh(particle, false)) {
                //     console.log('BYE!', particle.position);
                //     particle.dispose()
                //     return null;
                // }
                // return particle;
            };

            // tree 1
            let t = self.scene.getMeshByName('tree-1');

            var SPSTree1 = new BABYLON.SolidParticleSystem('SPSTree1', self.scene, {updatable: false});
            SPSTree1.addShape(t, 50, {positionFunction: myBuilder});
            var SPSMeshTree = SPSTree1.buildMesh();
            SPSMeshTree.material = t.material;
            SPSMeshTree.parent = parentSPS;

            t.dispose();

            // tree 2
            let t2 = self.scene.getMeshByName('tree-2');
            const meshes2 = [t2];
            for (let i = 0; i < 50; i++) {
                let tree = t2.clone();
                meshes2.push(tree);
            }

            meshes2.forEach((mesh, i) => myBuilder(mesh, null, i, -8));
            BABYLON.Mesh.MergeMeshes(meshes2);

            // grass 1
            let g = self.scene.getMeshByName('grass-1');

            var SPSGrass1 = new BABYLON.SolidParticleSystem('SPSGrass1', self.scene, {updatable: false});
            SPSGrass1.addShape(g, 300, {positionFunction: myBuilder});
            var SPSMeshGrass = SPSGrass1.buildMesh();
            SPSMeshGrass.material = t.material;
            SPSMeshGrass.parent = parentSPS;
        });
    }

    createCamera() {
        const camera = new BABYLON.ArcRotateCamera('Camera', 3 * Math.PI / 2, Math.PI / 2, 30, BABYLON.Vector3.Zero(), this.scene);
        camera.attachControl(this.canvas, true);

        camera.upperRadiusLimit = variables.cameraSettings.upperLimit;
        camera.lowerRadiusLimit = variables.cameraSettings.lowerLimit;
        // camera.maxZ = 150;

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

                    $controls.append('<button id="' + obj.meshID + 'Cam" disabled>cam</button>');
                    $('#' + obj.meshID + 'Cam').click(function () {
                        vehicle.focusCar(cam, true);
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
