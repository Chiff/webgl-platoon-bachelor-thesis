import { Road } from './road.js';
import { onVehicleLoad, Vehicle } from './vehicle.js';
import { variables, vehicleObjects } from './utils.js';
import { initTerrainDraw } from './height.js';
import { createCarPath, getPath } from './path.js';
import { createCamera, resetCameraPositon } from './camera.js';
import { loadData } from './data.js';

export default class Scene {
    constructor(params) {
        console.log('[Scene] - init');

        this.params = this.setParams(params);
        this.setCanvas();

        this.init();
        this.setEvents();

        if (variables.debug) {
            $('#fpsLabel').show();
        }

        this.engine.runRenderLoop(() => {
            this.scene.render();

            if (variables.debug) {
                const fpsLabel = document.getElementById('fpsLabel');
                fpsLabel.innerHTML = this.engine.getFps().toFixed() + ' fps';
            }
        });
    }

    init() {
        this.engine = new BABYLON.Engine(this.canvas, true);

        this.path = getPath();
        this.carPath = createCarPath(this.path);

        this.createScene();
        createCamera(this);

        this.createSkyBox();


        this.scene.executeWhenReady(e => {
            setTimeout(() => {
                this.engine.resize();
                resetCameraPositon();
                this.loadObject();
            }, 1000);
        });
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
            textureScale: {x: 1, y: 12},
            textureOffset: {x: 0.89, y: 0},
            showCurve: variables.debug
        });
        this.treeTest();
    }

    createGround() {
        initTerrainDraw(this.scene, this.path);

        const groundMaterial = new BABYLON.StandardMaterial('groundMaterial', this.scene);

        groundMaterial.alpha = 1.0;
        groundMaterial.diffuseColor = new BABYLON.Color3(1.0, 1.0, 1.0);
        groundMaterial.backFaceCulling = false;
        groundMaterial.specularColor = new BABYLON.Color3(0.035, 0.047, 0.020);

        groundMaterial.ambientTexture = new BABYLON.Texture('assets/grass.png', this.scene);
        groundMaterial.ambientTexture.uScale = 50;
        groundMaterial.ambientTexture.vScale = 50;

        // TODO - 19.4.2019 - create ground with smaller `mapDimension`
        const ground = BABYLON.Mesh.CreateGroundFromHeightMap(
            'ground',
            document.getElementById('imgSave').src,
            variables.mapDimension, variables.mapDimension, 200, 0, 5,
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
        const camera = new BABYLON.ArcRotateCamera('Camera', CAMERA_ALPHA, CAMERA_BETA, CAMERA_RADIUS, new BABYLON.Vector3(2, 1, -12), this.scene);
        camera.attachControl(this.canvas, true);

        camera.upperRadiusLimit = variables.cameraSettings.upperLimit;
        camera.lowerRadiusLimit = variables.cameraSettings.lowerLimit;
        camera.allowUpsideDown = false;
        // camera.maxZ = 150;

        this.camera = camera;
    }

    createSkyBox() {
        var skybox = BABYLON.MeshBuilder.CreateBox('skyBox', {size: 1000.0}, this.scene);
        var skyboxMaterial = new BABYLON.StandardMaterial('skyBox', this.scene);
        skyboxMaterial.backFaceCulling = false;
        skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture('assets/skybox/skybox', this.scene);
        skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
        skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
        skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
        skybox.material = skyboxMaterial;
    }

    loadObject() {
        loadData(this.params.dist).then(() => {
            const promises = [];
            vehicleObjects.map((obj, i) => {
                const vehicle = new Vehicle(this.scene, this.camera);

                const p = vehicle.load(obj.meshID, obj.folder, obj.file, obj.editMesh);
                p.then(() => {
                    onVehicleLoad(vehicle, obj, i, this.carPath, this.params.debug);
                }).catch(e => console.error(e));
                promises.push(p);
            });


            Promise.all(promises).then(d => {
                d.forEach(vehicle => vehicle.start(d));


                $(document).on('animationStart', function (e, vehicle) {
                    $('#loading').hide();
                    vehicle.focusCar();
                });
                $(document).on('animationEnd', function (e, vehicle) {
                    d.forEach(vehicle => vehicle.start(d));
                });
            });
        });


    }

    setEvents() {
        window.addEventListener('resize', () => {
            this.engine.resize();
        });

        $('#renderCanvas').on('touchmove', function (e) {
            e.preventDefault();
            return false;
        });

        $('body').on('contextmenu', '#renderCanvas', function (e) {
            return false;
        });

        gsap.defaults({
            ease: 'none'
        });
    }

    setParams(params) {
        // noinspection EqualityComparisonWithCoercionJS
        variables.pathInfo.url = params.url;
        variables.pathInfo.name = params.pathSettings.name;
        variables.pathInfo.points = params.pathSettings.points;
        variables.pathInfo.scale = params.pathSettings.scale || {x: 1, y: 1};
        variables.pathInfo.timeScale = params.pathSettings.timeScale || 1;
        variables.debug = params.debug == 'true';

        // TODO - 29/04/2020 - distance
        return {
            pathSettings: params.pathSettings,
            dist: parseInt(params.dist)
        };
    }

    setCanvas() {
        this.canvas = document.getElementById('renderCanvas');

        const w = window.innerWidth;
        this.canvas.style.height = ((w / 2) - 50) + 'px';
        this.canvas.style.width = w + 'px';
    }
}
