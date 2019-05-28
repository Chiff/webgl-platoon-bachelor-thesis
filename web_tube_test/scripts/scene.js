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
        ground.isPickable = false;

        this.ground = ground;
    }

    // TODO - 28.5.2019
    //  - refactor
    treeTest() {
        BABYLON.SceneLoader.Append('assets/foliage/', 'bush.babylon', this.scene);
        BABYLON.SceneLoader.Append('assets/foliage/', 'grass.babylon', this.scene);
        BABYLON.SceneLoader.Append('assets/foliage/', 'tree-1.babylon', this.scene);
        BABYLON.SceneLoader.Append('assets/foliage/', 'tree-2.babylon', this.scene);

        const self = this;
        this.scene.executeWhenReady(function () {
            const parentSPS = self.ground;
            const positions = [...parentSPS.getVerticesData(BABYLON.VertexBuffer.PositionKind)];

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

                particle.scaling.y = Math.random() + 0.5;

                positions.splice(randomPosition - 9, 12);

                const position = {...particle.position};
                position.y = -2;
                const direction = new BABYLON.Vector3(0, 1, 0);
                const ray = new BABYLON.Ray(position, direction, 100);

                const hit = self.scene.pickWithRay(ray);

                if (hit.pickedMesh && hit.pickedMesh.name === 'road') {
                    myBuilder(particle,i,s,y);
                }
            };

            // tree 1
            let t = self.scene.getMeshByName('tree-1');

            const SPSTree1 = new BABYLON.SolidParticleSystem('SPSTree1', self.scene, {updatable: false});
            SPSTree1.addShape(t, 80, {positionFunction: myBuilder});
            const SPSMeshTree = SPSTree1.buildMesh();
            SPSMeshTree.material = t.material;
            SPSMeshTree.parent = parentSPS;
            SPSMeshTree.isPickable = false;

            t.dispose();

            // tree 2
            let t2 = self.scene.getMeshByName('tree-2');

            const SPSTree2 = new BABYLON.SolidParticleSystem('SPSTree2', self.scene, {updatable: false});
            SPSTree2.addShape(t2, 80, {positionFunction: myBuilder});
            const SPSMeshTree2 = SPSTree2.buildMesh();
            SPSMeshTree2.material = t2.material;
            SPSMeshTree2.parent = parentSPS;
            SPSMeshTree2.isPickable = false;

            t2.dispose();

            // grass 1
            let g = self.scene.getMeshByName('grass-1');

            const SPSGrass1 = new BABYLON.SolidParticleSystem('SPSGrass1', self.scene, {updatable: false});
            SPSGrass1.addShape(g, 350, {positionFunction: myBuilder});
            const SPSMeshGrass = SPSGrass1.buildMesh();
            SPSMeshGrass.material = t.material;
            SPSMeshGrass.parent = parentSPS;
            SPSMeshGrass.isPickable = false;

            g.dispose();

            // bush 1
            let b = self.scene.getMeshByName('bush-1');

            const SPSBush1 = new BABYLON.SolidParticleSystem('SPSBush1', self.scene, {updatable: false});
            SPSBush1.addShape(b, 350, {positionFunction: myBuilder});
            const SPSMeshBush = SPSBush1.buildMesh();
            SPSMeshBush.material = b.material;
            SPSMeshBush.parent = parentSPS;
            SPSMeshBush.isPickable = false;

            b.dispose();
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
