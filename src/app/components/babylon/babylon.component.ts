import {Component, OnInit} from '@angular/core';

import * as BABYLON from 'babylonjs';
import 'babylonjs-loaders';

@Component({
    selector: 'app-babylon',
    templateUrl: './babylon.component.html',
    styleUrls: ['./babylon.component.scss']
})
export class BabylonComponent implements OnInit {
    scene: BABYLON.Scene;
    engine: BABYLON.Engine;
    camera: BABYLON.Camera;

    constructor() {
    }

    ngOnInit() {
        this.createScene();
        this.loadObject();
        console.log(this);
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
            new BABYLON.Vector3(0, 0, 0),
            this.scene
        );

        // this.camera.setTarget(BABYLON.Vector3.Zero());
        this.camera.attachControl(canvas, false);

        const light = new BABYLON.HemisphericLight(
            'light1',
            new BABYLON.Vector3(0, 1, 0),
            this.scene
        );

        BABYLON.SceneLoader.Append('assets/', 'kamion.babylon', this.scene, (newScene: BABYLON.Scene) => {
            const scene = newScene;
            console.log(scene.materials);
            scene.materials.map((material) => {
                if (!material.id.includes('kamion')) {
                    return;
                }
                if (material.id.includes('naklad')) {
                    material.diffuseTexture = new BABYLON.Texture('assets/naklad.png', scene);
                } else {
                    material.diffuseTexture = new BABYLON.Texture('assets/kamion.png', scene);
                }
            });
        }, (e) => {
            // console.log(e);
        }, (e) => {
            console.log(e);
        });

        this.engine.runRenderLoop(() => this.scene.render());
    }

    loadObject() {
    }
}
