import { Road } from './road.js';
import { Vehicle } from './vehicle.js';
import { variables, vehicleObjects } from './utils.js';
import { initTerrainDraw } from './height.js';
import { createCarPath, getPath } from './path.js';

export default class Scene {

    constructor() {
        console.log('[Scene] - init');

        this.canvas = document.getElementById('renderCanvas');
        this.engine = new BABYLON.Engine(this.canvas, true);

        this.init();

        window.addEventListener('resize', () => {
            this.engine.resize();
        });

        this.engine.runRenderLoop(() => {
            this.scene.render();

            const fpsLabel = document.getElementById('fpsLabel');
            fpsLabel.innerHTML = this.engine.getFps().toFixed() + ' fps';
        });
    }

    init() {
        this.path = getPath();
        this.carPath = createCarPath(this.path);

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
            path: this.path,
            scene: this.scene,
            textureUrl: 'assets/cesta.png',
            textureScale: {x: 1, y: 6},
            textureOffset: {x: 0.89, y: 0}
        });
        this.treeTest();
    }

    createGround() {
        initTerrainDraw(this.scene);

        const groundMaterial = new BABYLON.StandardMaterial('groundMaterial', this.scene);

        groundMaterial.alpha = 1.0;
        groundMaterial.diffuseColor = new BABYLON.Color3(1.0, 1.0, 1.0);
        groundMaterial.backFaceCulling = false;
        groundMaterial.specularColor = BABYLON.Color3.Black();

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
            const parentSPS = self.scene.getMeshByName('roadVegetation');
            const positions = parentSPS.createSurfacePoints(0.06);

            const myBuilder = function (particle, i, s, y = 0) {
                if (positions.length < 3) {
                    return;
                    // throw 'OUT OF INDICES!';
                }

                let randomPosition = Math.round(Math.random() * positions.length) - 1;
                randomPosition -= (randomPosition % 3);

                try {
                    particle.position = new BABYLON.Vector3(
                        positions[randomPosition].x,
                        positions[randomPosition].y + y,
                        positions[randomPosition].z
                    );
                } catch (e) {
                    console.log(positions);
                    console.log(positions[randomPosition]);
                }

                const scale = Math.random() + 0.2;
                particle.scaling.x = scale;
                particle.scaling.y = scale;
                particle.scaling.z = scale;

                // positions.splice(randomPosition - 9, 12);

                const position = {...particle.position};
                position.y = -2;
                const direction = new BABYLON.Vector3(0, 1, 0);
                const ray = new BABYLON.Ray(position, direction, 100);

                const hit = self.scene.pickWithRay(ray);

                if (hit.pickedMesh && hit.pickedMesh.name !== 'roadVegetation') {
                    myBuilder(particle, i, s, y);
                }

                particle.position.y = 2;
            };

            const shapeCount = {
                tree1: Math.floor(positions.length * 0.1 * 0.08),
                tree2: Math.floor(positions.length * 0.1 * 0.15),
                grass1: Math.floor(positions.length * 0.1 * 0.42),
                bush1: Math.floor(positions.length * 0.1 * 0.35)
            };

            // tree 1
            let t = self.scene.getMeshByName('tree-1');

            const SPSTree1 = new BABYLON.SolidParticleSystem('SPSTree1', self.scene, {updatable: false});
            SPSTree1.addShape(t, shapeCount.tree1, {positionFunction: myBuilder});
            const SPSMeshTree = SPSTree1.buildMesh();
            SPSMeshTree.material = t.material;
            SPSMeshTree.material.specularColor = BABYLON.Color3.Black();
            SPSMeshTree.parent = parentSPS;
            SPSMeshTree.isPickable = false;

            t.dispose();

            // tree 2
            let t2 = self.scene.getMeshByName('tree-2');

            const SPSTree2 = new BABYLON.SolidParticleSystem('SPSTree2', self.scene, {updatable: false});
            SPSTree2.addShape(t2, shapeCount.tree2, {positionFunction: myBuilder});
            const SPSMeshTree2 = SPSTree2.buildMesh();
            SPSMeshTree2.material = t2.material;
            SPSMeshTree2.material.specularColor = BABYLON.Color3.Black();
            SPSMeshTree2.parent = parentSPS;
            SPSMeshTree2.isPickable = false;

            t2.dispose();

            // grass 1
            let g = self.scene.getMeshByName('grass-1');

            const SPSGrass1 = new BABYLON.SolidParticleSystem('SPSGrass1', self.scene, {updatable: false});
            SPSGrass1.addShape(g, shapeCount.grass1, {positionFunction: myBuilder});
            const SPSMeshGrass = SPSGrass1.buildMesh();
            SPSMeshGrass.material = t.material;
            SPSMeshGrass.material.specularColor = BABYLON.Color3.Black();
            SPSMeshGrass.parent = parentSPS;
            SPSMeshGrass.isPickable = false;

            g.dispose();

            // bush 1
            let b = self.scene.getMeshByName('bush-1');

            const SPSBush1 = new BABYLON.SolidParticleSystem('SPSBush1', self.scene, {updatable: false});
            SPSBush1.addShape(b, shapeCount.bush1, {positionFunction: myBuilder});
            const SPSMeshBush = SPSBush1.buildMesh();
            SPSMeshBush.material = b.material;
            SPSMeshBush.material.specularColor = BABYLON.Color3.Black();
            SPSMeshBush.parent = parentSPS;
            SPSMeshBush.isPickable = false;

            b.dispose();
        });
    }

    createCamera() {
        const CAMERA_ALPHA = 6.49;
        const CAMERA_BETA = 1.28;
        const CAMERA_RADIUS = 60;

        const camera = new BABYLON.ArcRotateCamera('Camera', CAMERA_ALPHA, CAMERA_BETA, CAMERA_RADIUS, new BABYLON.Vector3(2, 1, -12), this.scene);
        camera.attachControl(this.canvas, true);

        camera.upperRadiusLimit = variables.cameraSettings.upperLimit;
        camera.lowerRadiusLimit = variables.cameraSettings.lowerLimit;
        camera.allowUpsideDown = false;
        // camera.maxZ = 150;

        this.camera = camera;
    }

    createSkySphere() {
        const skySphere = BABYLON.Mesh.CreateSphere('skySphere', 1, 300, this.scene);
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
                    $('#' + obj.meshID + 'SpeedDown').click(() => {
                        vehicle.changeSpeed(0.85);
                    });

                    $controls.append('<button id="' + obj.meshID + '">' + obj.meshID + '</button>');
                    $('#' + obj.meshID).click(() => {
                        vehicle.focusCar(cam);
                    });

                    $controls.append('<button id="' + obj.meshID + 'Cam">cam</button>');
                    $('#' + obj.meshID + 'Cam').click(() => {
                        vehicle.focusCar(cam, true);
                    });

                    $controls.append('<button id="' + obj.meshID + 'SpeedUp"> + </button><span> | </span>');
                    $('#' + obj.meshID + 'SpeedUp').click(() => {
                        vehicle.changeSpeed(1.15);
                    });
                }, time += 3000);
            }).catch(e => console.error(e));
        });
    }
}
