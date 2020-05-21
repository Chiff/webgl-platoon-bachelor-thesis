import { Road } from './road.js';
import { carSort, onVehicleLoad, Vehicle } from './vehicle.js';
import { variables, vehicleObjects } from './utils.js';
import { createCarPath, getPath } from './path.js';
import { createCamera, resetCameraPositon } from './camera.js';
import { loadData } from './data.js';
import { createGround, createVegetation } from './stage.js';

export default class Simulation {
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
        this.createSkyBox();
        createCamera(this);

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
        new BABYLON.HemisphericLight('hemi', new BABYLON.Vector3(0, 50, 0), this.scene);

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
            createVegetation(this.scene);
        }
    }

    createSkyBox() {
        var skybox = BABYLON.MeshBuilder.CreateBox('skyBox', {size: variables.mapDimension * 2}, this.scene);
        var skyboxMaterial = new BABYLON.StandardMaterial('skyBox', this.scene);
        skyboxMaterial.backFaceCulling = false;
        skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture('assets/skybox/skybox', this.scene);
        skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
        skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
        skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
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
                    onVehicleLoad(vehicle, obj, i, this.carPath, this.params.debug);
                }).catch(e => console.error(e));
                promises.push(p);
            });

            Promise.all(promises).then(d => {
                d.forEach((vehicle, i) => vehicle.start(d, i));
                $('#loading').hide();
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
            ease: 'linear'
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
}
