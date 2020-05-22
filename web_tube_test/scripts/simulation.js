import { Road } from './road.js';
import { carSort, onVehicleLoad, Vehicle } from './vehicle.js';
import { variables, vehicleObjects } from './utils.js';
import { getPath } from './path.js';
import { createCamera, resetCameraPositon } from './camera.js';
import { loadData } from './data.js';
import { createGround, createVegetation } from './stage.js';

const UNIQUE_LIGHT = 'myOnlyLight';

export default class Simulation {
    constructor(params) {

        console.log('[Simulation] - set');
        this.setParams(params);
        this.setCanvas();
        this.setEvents();

        console.log('[Simulation] - init');
        this.init();

        gsap.defaults({
            ease: 'linear'
        });

        const $fpsLabel = $('#fpsLabel');
        if (variables.debug) {
            $fpsLabel.show();
        }


        this.engine.runRenderLoop(() => {
            this.scene.render();

            if (variables.debug) {
                $fpsLabel.html(this.engine.getFps().toFixed() + ' fps');
            }

            if (this.scene.lights.length > 2) {
                this.clearLight();
            }
        });
    }

    init() {
        this.engine = new BABYLON.Engine(this.canvas, true);

        this.path = getPath();

        this.createScene();
        createCamera(this);

        this.scene.executeWhenReady(e => {
            setTimeout(() => {
                console.log('[Simulation] - scene ready');
                this.engine.resize();
                resetCameraPositon();
                this.loadObject();
            }, 1000);
        });
    }

    createScene() {
        this.scene = new BABYLON.Scene(this.engine);

        this.lightHemi = new BABYLON.HemisphericLight(UNIQUE_LIGHT + 1, new BABYLON.Vector3(0, 50, 0), this.scene);
        this.lightHemi.intensity = 0.20;

        this.light = new BABYLON.DirectionalLight(UNIQUE_LIGHT + 1, new BABYLON.Vector3(-0.5, -1, -0.5), this.scene);
        this.light.position = new BABYLON.Vector3(variables.mapDimension, variables.mapDimension, -variables.mapDimension);
        this.light.intensity = 2.5;

        this.createSkyBox();

        createGround(this);

        this.road = new Road({
            path: this.path,
            scene: this.scene,
            textureUrl: 'assets/cesta.png',
            textureScale: {x: 1, y: 12},
            textureOffset: {x: 0.89, y: 0},
            showCurve: variables.debug
        });

        if (!variables.lowPerformance) {
            this.shadowGenerator = new BABYLON.ShadowGenerator(8126, this.light);
            this.shadowGenerator.useExponentialShadowMap = true;
            this.shadowGenerator.filteringQuality = BABYLON.ShadowGenerator.QUALITY_HIGH;

            this.ground.receiveShadows = true;
            this.road.mesh.receiveShadows = true;

            createVegetation(this);
        }
    }

    createSkyBox() {
        const skyboxMaterial = new BABYLON.StandardMaterial('skyBox', this.scene);
        skyboxMaterial.backFaceCulling = false;
        skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture('assets/skybox/skybox', this.scene);
        skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
        skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
        skyboxMaterial.specularColor = new BABYLON.Color3(1, 1, 1);

        const skybox = BABYLON.MeshBuilder.CreateBox('skyBox', {size: variables.mapDimension * 2}, this.scene);
        skybox.material = skyboxMaterial;
    }

    loadObject() {
        loadData().then(() => {
            const promises = [];

            const objs = vehicleObjects;
            objs.sort(carSort);

            objs.forEach((obj, i) => {
                const vehicle = new Vehicle(this.scene, this.camera);

                const p = vehicle.load(obj.meshID, obj.vehicleID, obj.folder, obj.file, obj.editMesh);
                p.then(() => {
                    onVehicleLoad(vehicle, obj, i, this.path, variables.debug);
                }).catch(e => console.error(e));
                promises.push(p);
            });

            Promise.all(promises).then(d => {
                d.forEach((vehicle, i) => {
                    vehicle.start(d, i);

                    if (!variables.lowPerformance) {
                        this.shadowGenerator.addShadowCaster(vehicle.meshes.body, true);
                    }
                });

                console.log('[Simulation] - objects ready');
                $('#loading').hide();
            });
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
        variables.lowPerformance = params.lowPerformance == 'true';

        variables.dist = params.dist || 20;
        variables.simScale = params.simScale || 0;

        variables.offlineMode = params.offlineMode == 'true';

        return {
            pathSettings: params.pathSettings
        };
    }

    setCanvas() {
        this.canvas = document.getElementById('renderCanvas');

        const w = window.innerWidth;
        this.canvas.style.height = Math.min((w / 2) - 50, variables.maxCanvasHeight) + 'px';
        this.canvas.style.width = Math.min(w, variables.maxCanvasWidth) + 'px';
    }

    setEvents() {
        window.addEventListener('resize', () => {
            this.setCanvas();
            this.engine.resize();
        });

        $('#renderCanvas').on('touchmove', function (e) {
            e.preventDefault();
            return false;
        });

        $('body').on('contextmenu', '#renderCanvas', function (e) {
            return false;
        });
    }

    clearLight() {
        this.scene.lights.forEach(light => {
            if (!light.id.includes(UNIQUE_LIGHT))
                light.dispose();
        });

    }
}
