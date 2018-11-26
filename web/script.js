// import * as Stats from '../node_modules/three/examples/js/libs/stats.min.js';

class BabylonComponent {
    constructor() {
        this.scene = null;
        this.engine = null;
        this.camera = null;
        this.materials = null;
        this.meshes = null;
        this.stats = null;

        this.edges = false;
        this.speed = 0;
        this.tileCount = 10;
        this.roadLength = 15.98;

        console.clear();

        this.createScene();
        this.loadObject();
        console.log(this);
        this.createSkybox();
    }

    createScene() {
        const canvas = document.getElementById('babylon');
        this.engine = new BABYLON.Engine(
            canvas,
            true,
            {
                preserveDrawingBuffer: true,
                stencil: true
            }
        );

        this.scene = new BABYLON.Scene(this.engine);

        this.camera = new BABYLON.ArcRotateCamera(
            'camera1',
            0, 0, 10,
            new BABYLON.Vector3(1, 2, 2),
            this.scene
        );

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
        const skybox = BABYLON.MeshBuilder.CreateBox('skyBox', {size: 1000.0}, this.scene);
        const skyboxMaterial = new BABYLON.StandardMaterial('skyBox', this.scene);
        skyboxMaterial.backFaceCulling = false;
        skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture('assets/skybox/skybox', this.scene);
        skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
        skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
        skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
        skybox.material = skyboxMaterial;
    }

    loadObject() {
        BABYLON.SceneLoader.Append('assets/', 'kamion.babylon', this.scene, (newScene) => {
            const scene = newScene;
            console.log(scene);
            this.materials = scene.materials.map((material) => {

                if (!material.id.includes('kamion')) {
                    return null;
                }
                if (material.id.includes('naklad')) {
                    this.setTexture(material, 'assets/naklad.png', scene);
                    this.changeColor(material, 0.8, 0.6, 0.3);
                } else if (material.id.includes('cesta')) {
                    this.setTexture(material, 'assets/cesta.png', scene);
                } else if (material.id.includes('terrain')) {
                    this.setTexture(material, 'assets/pod.png', scene);
                } else {
                    this.setTexture(material, 'assets/kamion.png', scene);
                }

                return material;
            }).filter((item) => item !== null);

            this.meshes = scene.meshes.map((mesh) => {
                const box = mesh;

                box.edgesWidth = 1.0;
                box.edgesColor = new BABYLON.Color4(0, 0, 1, 1);

                return mesh;
            });

            this.createTerrain(this.tileCount);

            this.engine.runRenderLoop(() => this.animate());
        }, (e) => {
            // console.log(e);
        }, (e) => {
            console.log(e);
        });
    }

    animate() {
        this.scene.render();

        this.find(this.meshes, 'id', 'kolesa').map((item) => {
            item.rotation.z += this.speed / 100;
        });

        if (this.speed !== 0) this.moveTerrain();

        // this.stats.update();
    }

    createTerrain(count) {
        const length = this.roadLength;
        const t = this.findTerrain();

        this.terrain = [];
        this.terrain.push(t.road);
        this.terrain.push(t.terrain);

        for (let i = 1; i <= count; i++) {
            const newRoad = t.road.clone(`terrain${i + 1}cesta1`);
            const newRoad2 = t.road.clone(`terrain${i + 1}cesta2`);
            const newTerrain = t.terrain.clone(`terrain${i + 1}terrain1`);
            const newTerrain2 = t.terrain.clone(`terrain${i + 1}terrain2`);

            newRoad.position.x += i * length;
            newRoad2.position.x -= i * length;

            newTerrain.position.x += i * length;
            newTerrain2.position.x -= i * length;

            newRoad.edgesColor = new BABYLON.Color4(1, 0, 0, 1);
            newRoad2.edgesColor = new BABYLON.Color4(1, 0, 0, 1);

            this.terrain.push(newRoad);
            this.terrain.push(newRoad2);
            this.terrain.push(newTerrain);
            this.terrain.push(newTerrain2);
        }
    }

    findTerrain() {
        const terrain = {
            road: null,
            terrain: null
        };

        this.find(this.meshes, 'id', 'terrain').map((item) => {
            terrain.terrain = item;
        });

        this.find(this.meshes, 'id', 'cesta').map((item) => {
            terrain.road = item;
        });

        console.log(terrain);

        return terrain;
    }

    moveTerrain() {
        // todo iba jeden krat 'this.find' aby zbytocne nehladal stale to iste
        this.terrain.forEach((item) => {
            item.position.x += this.speed / 100;

            // dlzka jedneho * total
            if (item.position.x >= this.roadLength * this.tileCount + this.roadLength && this.speed > 0)
                item.position.x -= this.roadLength * this.tileCount * 2 + this.roadLength;

            if (item.position.x <= -(this.roadLength * this.tileCount + this.roadLength) && this.speed < 0)
                item.position.x += this.roadLength * this.tileCount * 2 + this.roadLength;
        });
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

    drawEdges() {
        this.edges = !this.edges;

        this.find(this.meshes, 'id', 'kolesa').map((item) => {
            if (this.edges) {
                item.enableEdgesRendering();
            } else {
                item.disableEdgesRendering();
            }
        });

        this.find(this.terrain, 'id', 'cesta').map((item) => {
            if (this.edges) {
                item.enableEdgesRendering();
            } else {
                item.disableEdgesRendering();
            }
        });
    }
}

(() => {
    window.model = new BabylonComponent();

    const el = document.getElementById('babylon')
    el.addEventListener('contextmenu', function (ev) {
        ev.preventDefault();
        return false;
    }, false);
})();



