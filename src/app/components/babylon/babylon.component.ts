import {Component, OnInit} from '@angular/core';

import * as BABYLON from 'babylonjs';
import 'babylonjs-loaders';
import Stats from 'three/examples/js/libs/stats.min.js';

@Component({
    selector: 'app-babylon',
    templateUrl: './babylon.component.html',
    styleUrls: ['./babylon.component.scss']
})
export class BabylonComponent implements OnInit {
    scene: BABYLON.Scene;
    engine: BABYLON.Engine;
    camera: BABYLON.Camera;
    materials: BABYLON.Material[];
    meshes: BABYLON.AbstractMesh[];
    stats: Stats;
    speed = 0;
    edges = false;

    constructor() {
    }

    ngOnInit() {
        this.createScene();
        this.loadObject();
        console.log(this);
        this.createSkybox();
    }

    createScene() {
        const canvas = <HTMLCanvasElement>document.getElementById('babylon');
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

        this.stats = new Stats();
        document.getElementById('stats').appendChild(this.stats.dom);
    }

    createSkybox() {
        let skybox = BABYLON.MeshBuilder.CreateBox('skyBox', {size: 1000.0}, this.scene);
        let skyboxMaterial = new BABYLON.StandardMaterial('skyBox', this.scene);
        skyboxMaterial.backFaceCulling = false;
        skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture('assets/skybox/skybox', this.scene);
        skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
        skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
        skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
        skybox.material = skyboxMaterial;
    }

    loadObject() {
        BABYLON.SceneLoader.Append('assets/', 'kamion.babylon', this.scene, (newScene: BABYLON.Scene) => {
            const scene = newScene;
            console.log(scene);
            this.materials = scene.materials.map((material) => {
                console.log(material.id);

                if (!material.id.includes('kamion')) {
                    return null;
                }
                if (material.id.includes('naklad')) {
                    this.setTexture(material, 'assets/naklad.png', scene);
                    this.changeColor(material, 0.8, 0.6, 0.3);
                } else if (material.id.includes('cesta')) {
                    this.setTexture(material, 'assets/cesta.png', scene);
                } else {
                    this.setTexture(material, 'assets/kamion.png', scene);
                }

                return material;
            }).filter((item: any) => item !== null);

            this.meshes = scene.meshes.map((mesh: BABYLON.Mesh) => {
                const box = mesh;

                box.edgesWidth = 1.0;
                box.edgesColor = new BABYLON.Color4(0, 0, 1, 1);

                return mesh;
            });
            this.engine.runRenderLoop(() => this.animate());
        }, (e) => {
            // console.log(e);
        }, (e) => {
            console.log(e);
        });

    }

    animate() {
        this.scene.render();
        this.find(this.meshes, 'id', 'kamion').map((item: BABYLON.Mesh) => {
            item.position.x += this.speed / 100;
        });
        this.find(this.meshes, 'id', 'kolesa').map((item: BABYLON.Mesh) => {
            item.rotation.z -= this.speed / 100;
        });

        this.stats.update();
    }

    find(array: any, key: string, search: string): any[] {
        return array.filter((item: any) => {
            return item[key].includes(search);
        });
    }

    changeColor(object: BABYLON.Material, r: number, g: number, b: number) {
        // @ts-ignore
        object.diffuseColor = new BABYLON.Color3(r, g, b);
    }

    setTexture(object: BABYLON.Material, url: string, scene: BABYLON.Scene) {
        // @ts-ignore
        object.diffuseTexture = new BABYLON.Texture(url, scene);
    }

    changeMatCol() {
        this.find(this.materials, 'id', 'naklad').map((item => {
            this.changeColor(item, Math.random(), Math.random(), Math.random());
        }));
    }

    drawEdges() {
        this.edges = !this.edges;

        this.find(this.meshes, 'id', 'kamion').map((item: BABYLON.Mesh) => {
            if (this.edges) {
                item.enableEdgesRendering();
            } else {
                item.disableEdgesRendering();
            }
        });
    }
}

