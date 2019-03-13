import {Road} from './road.js';
import {CarPathAnim} from './carPathAnim.js';

export default class Scene {
    constructor() {
        this.canvas = document.getElementById("renderCanvas");
        this.engine = new BABYLON.Engine(this.canvas, true);

        this.createScene();

        this.engine.runRenderLoop(() => {
            this.scene.render();
        });
    }

    createScene() {
        this.scene = new BABYLON.Scene(this.engine);

        const camera = new BABYLON.ArcRotateCamera("Camera", 3 * Math.PI / 2, Math.PI / 2, 30, BABYLON.Vector3.Zero(), this.scene);
        camera.upperRadiusLimit = 0.1;
        camera.lowerRadiusLimit = 0.1;
        camera.attachControl(this.canvas, true);

        const light = new BABYLON.HemisphericLight("hemi", new BABYLON.Vector3(0, 50, 0), this.scene);

        const mySinus = [];
        const carPath = [];
        const radius = 120;
        const center = {x: 0, y: 0};
        const step = 300;
        for (let i = 0; i <= 2 * Math.PI; i += (Math.PI / 2) / step) {
            const x = (center.x + radius * Math.cos(i)) + (Math.sin(i) * 30);
            const y = 10 + (Math.sin(i * 5) * 5);
            const z = (center.y + radius * Math.sin(i)) + (Math.sin(i) * 50);
            mySinus.push(new BABYLON.Vector3(x, y, z));

            const xCar = x + 13 * Math.cos(i);
            const yCar = y + y*y*0.01 + 2;
            const zCar = z + 13 * Math.sin(i);
            carPath.push(new BABYLON.Vector3(xCar, yCar, zCar));
        }

        new Road({
            path: mySinus,
            scene: this.scene,
            textureUrl: 'assets/cesta.png',
            textureScale: {x: 1, y: 6},
            textureOffset: {x: 0.89, y: 0},
        });

        const mat3 = new BABYLON.StandardMaterial("mat3", this.scene);
        mat3.alpha = 1.0;
        mat3.diffuseColor = new BABYLON.Color3(0.5, 0.5, 1.0);
        mat3.backFaceCulling = false;
        mat3.diffuseTexture = new BABYLON.Texture("assets/grass.jpg", this.scene);

        const myGround = BABYLON.MeshBuilder.CreatePlane("plnae", {
            width: 1200,
            height: 1200,
            subdivsions: 4
        }, this.scene);
        myGround.rotation = new BABYLON.Vector3(Math.PI / 2, 0, 0);
        myGround.position.y = -1.5;
        myGround.diffuseColor = BABYLON.Color3.Black();
        myGround.material = mat3;

        this.loadObject(carPath, camera);
    }

    createFollowCar(carPath, cam) {
        // const box = BABYLON.MeshBuilder.CreateBox("box", {height: 9, width: 9, depth: 18}, this.scene);
        const box = this.scene.getMeshByID('lambo_telo');
        const driver_cam = this.scene.getMeshByID('lambo_driver');

        const kfl = this.scene.getMeshByID('lambo_koleso_fl');
        const kfr = this.scene.getMeshByID('lambo_koleso_fr');
        const krl = this.scene.getMeshByID('lambo_koleso_rl');
        const krr = this.scene.getMeshByID('lambo_koleso_rr');

        box.position.x = carPath[0].x;
        box.position.y = carPath[0].y;
        box.position.z = carPath[0].z;

        window.anim = new CarPathAnim(carPath, box, 2, this.scene);

        const skySphere = BABYLON.Mesh.CreateSphere("skySphere", 160, 750 / 3, this.scene);
        skySphere.isPickable = false;

        const skySphereMaterial = new BABYLON.StandardMaterial("skySphereMaterial", this.scene);
        skySphereMaterial.backFaceCulling = false;
        skySphereMaterial.reflectionTexture = new BABYLON.Texture("assets/sky.jpg", this.scene);
        skySphereMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.PROJECTION_MODE;
        skySphereMaterial.diffuseColor = BABYLON.Color3.Black();
        skySphereMaterial.specularColor = BABYLON.Color3.Black();
        skySphere.material = skySphereMaterial;
        skySphere.parent = box;

        cam.lockedTarget = driver_cam;

        window.sceneCamera = cam;
        window.sceneCar = box;
        window.sceneDriver = driver_cam;
    }

    loadObject(carPath, cam) {
        BABYLON.SceneLoader.Append('assets/lambo/', 'lamob_test_2.babylon', this.scene, (newScene) => {
            const scene = newScene;
            console.log(scene);
            this.materials = scene.materials;
            this.meshes = scene.meshes.map((m) => {
                // console.log(m.id);

                if (m.id.includes('lambo_telo'))
                    m.scaling = new BABYLON.Vector3(3, 3, 3);

                return m
            });
            this.createFollowCar(carPath, cam);
        }, (e) => {
            // console.log(e);
        }, (e) => {
            console.log(e);
        });
    }
}

