// import * as Stats from '../node_modules/three/examples/js/libs/stats.min.js';

class BabylonComponent {
    constructor() {
        this.scene = null;
        this.engine = null;
        this.camera = null;
        this.materials = [];
        this.meshes = [];
        this.stats = null;

        this.edges = false;
        this.speed = 0;
        this.tileCount = 10;
        this.roadLength = 15.98;

        console.clear();

        this.createScene();
        this.createSkybox();
        this.createTerrain();
        this.createCar();


        console.log(this);
        this.engine.runRenderLoop(() => this.animate());

        const m = this.meshes;
        this.scene.registerBeforeRender(function () {
            m.forEach(function (mesh) {
                if (mesh.name === "s" && mesh.position.y < -10) {
                    mesh.position.y = (Math.random() * 100);
                    mesh.position.x = (Math.random() * 300) * ((Math.random() < 0.5) ? -1 : 1);
                    mesh.position.z = (Math.random() * 300) * ((Math.random() < 0.5) ? -1 : 1);
                    mesh.physicsImpostor.linearVelocity = new CANNON.Vec3(0, 0, 0);
                    mesh.physicsImpostor.angularVelocity = new CANNON.Vec3(0, 0, 0);
                    mesh.physicsImpostor.applyImpulse(new BABYLON.Vector3((Math.random() * 30), (Math.random() * 30), 0), mesh.getAbsolutePosition());
                }
            })
        });
    }

    createScene() {
        const canvas = document.getElementById('babylon');
        this.engine = new BABYLON.Engine(
            canvas,
            true, {
                preserveDrawingBuffer: true,
                stencil: true
            }
        );

        this.scene = new BABYLON.Scene(this.engine);
        const gravityVector = new BABYLON.Vector3(0, -9.81, 0);
        const physicsPlugin = new BABYLON.CannonJSPlugin();
        this.scene.enablePhysics(gravityVector, physicsPlugin);

        this.camera = new BABYLON.ArcRotateCamera(
            'camera1',
            63.35, 1.25, 500,
            new BABYLON.Vector3(1, 2, 2),
            this.scene
        );

        this.camera.wheelPrecision = 5;

        // this.camera.setTarget(BABYLON.Vector3.Zero());
        this.camera.attachControl(canvas, false);

        const light = new BABYLON.HemisphericLight(
            'light1',
            new BABYLON.Vector3(0, 1, 0),
            this.scene
        );


        // this.stats = new Stats();
        // document.getElementById('stats').appendChild(this.stats.dom);
    }

    createSkybox() {
        const skybox = BABYLON.MeshBuilder.CreateBox('skyBox', {size: 2000.0}, this.scene);
        const skyboxMaterial = new BABYLON.StandardMaterial('skyBox', this.scene);
        skyboxMaterial.backFaceCulling = false;
        skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture('assets/skybox/skybox', this.scene);
        skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
        skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
        skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
        skybox.material = skyboxMaterial;
    }

    // todo? https://doc.babylonjs.com/extensions/terrain
    createTerrain() {
        const groundMaterial = new BABYLON.StandardMaterial("ground", this.scene);
        groundMaterial.diffuseTexture = new BABYLON.Texture("assets/terrain/grass.jpg", this.scene);

        const terrainMaterial = new BABYLON.TerrainMaterial("terrainMaterial", this.scene);
        terrainMaterial.mixTexture = new BABYLON.Texture("assets/terrain/map_terrain_new.jpg", this.scene);
        terrainMaterial.diffuseTexture1 = new BABYLON.Texture("assets/terrain/road.jpg", this.scene);
        terrainMaterial.diffuseTexture2 = new BABYLON.Texture("assets/terrain/grass.jpg", this.scene);
        terrainMaterial.diffuseTexture3 = new BABYLON.Texture("assets/terrain/pavement.jpg", this.scene);

        const ground = BABYLON.Mesh.CreateGroundFromHeightMap(
            "ground", "assets/terrain/map_height_new.jpg",
            800, 400, 50, 0, 100, this.scene,
            false, (e) => {
                console.log("terrain heightmap imported successfully", e);

                // ground.physicsImpostor = new BABYLON.PhysicsImpostor(ground, BABYLON.PhysicsImpostor.HeightmapImpostor, {
                //     mass: 0,
                //     restitution: 1
                // }, this.scene);
            });

        ground.material = terrainMaterial;

        this.ground = ground;
    }

    createCar() {
        for (let i = 0; i < 20; i++) {
            var sphere = BABYLON.MeshBuilder.CreateSphere("s", {});
            sphere.scaling.x = 30;
            sphere.scaling.y = 30;
            sphere.scaling.z = 30;

            sphere.physicsImpostor = new BABYLON.PhysicsImpostor(sphere, BABYLON.PhysicsImpostor.SphereImpostor, {
                mass: 100, friction: 0.8
            }, this.scene);
            sphere.physicsImpostor.applyImpulse(new BABYLON.Vector3((Math.random() * 30), (Math.random() * 30), 0), sphere.getAbsolutePosition());

            // todo phys impact
            sphere.physicsImpostor.registerOnPhysicsCollide(this.ground.physicsImpostor, function (main, collided) {
                console.log(arguments);
                main.object.material.diffuseColor = new BABYLON.Color3(Math.random(), Math.random(), Math.random());
            });

            sphere.position.y = (Math.random() * 100);
            sphere.position.x = (Math.random() * 300) * ((Math.random() < 0.5) ? -1 : 1);
            sphere.position.z = (Math.random() * 300) * ((Math.random() < 0.5) ? -1 : 1);
            this.meshes.push(sphere);
        }
    }


    animate() {
        this.scene.render();
    }


    find(array, key, search) {
        return array.filter((item) => {
            return item[key].includes(search);
        });
    }

    changeColor(object, r, g, b) {
        object.diffuseColor = new BABYLON.Color3(r, g, b);
    }

    setTexture(object, url, scene) {
        object.diffuseTexture = new BABYLON.Texture(url, scene);
    }

    changeMatCol() {
        this.find(this.materials, 'id', 'naklad').map((item => {
            this.changeColor(item, Math.random(), Math.random(), Math.random());
        }));
    }
}

(() => {
    window.model = new BabylonComponent();

    const el = document.getElementById('babylon');
    el.addEventListener('contextmenu', function (ev) {
        ev.preventDefault();
        return false;
    }, false);
})();



