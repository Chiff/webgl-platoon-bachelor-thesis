import {Component, OnInit} from '@angular/core';

import * as THREE from 'three-full';
import Stats from 'three/examples/js/libs/stats.min.js';
import {Mesh} from 'three';

@Component({
  selector: 'app-three',
  templateUrl: './three.component.html',
  styleUrls: ['./three.component.scss']
})
export class ThreeComponent implements OnInit {
  loader: THREE.GLTFLoader;
  scene: THREE.Scene;
  camera: THREE.Camera;
  controls: THREE.OrbitControls;
  renderer: THREE.Renderer;
  stats: Stats;
  envMap: any;
  meshes: Mesh[] = [];

  // ovladanie
  colorChange = false;
  speed = 0;

  constructor() {
  }

  ngOnInit() {
    this.createScene();
    this.loadObject();
    this.animate();

    console.log(this);
  }

  createScene() {
    const path = 'assets/skybox/';
    const format = '.jpg';
    this.envMap = new THREE.CubeTextureLoader().load([
      path + 'px' + format, path + 'nx' + format,
      path + 'py' + format, path + 'ny' + format,
      path + 'pz' + format, path + 'nz' + format
    ]);

    this.scene = new THREE.Scene();
    this.scene.background = this.envMap;

    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.set(-2, 2, 5);

    this.controls = new THREE.OrbitControls(this.camera, document.getElementById('three'));
    this.controls.target.set(0, -0.5, -0.5);
    this.controls.update();

    const light = new THREE.HemisphereLight(0xbbbbff, 0x444422);
    light.position.set(0, 1, 0);
    this.scene.add(light);

    this.renderer = new THREE.WebGLRenderer(<THREE.WebGLRendererParameters>{
      antialias: true,
      canvas: document.getElementById('three')
    });

    this.renderer.setSize(900, 600);
    this.renderer.setPixelRatio(window.devicePixelRatio);

    this.stats = new Stats();
    document.getElementById('stats').appendChild(this.stats.dom);
  }

  /** https://threejs.org/docs/#examples/loaders/GLTFLoader */
  loadObject() {
    this.loader = new THREE.GLTFLoader();
    const scene = this.scene;
    const meshes = this.meshes;
    const envMap = this.envMap;
    const camera = this.camera;

    this.loader.load(
      'assets/kamion.glb',
      (gltf) => {
        gltf.scene.traverse(function (child: Mesh) {
          if (child.isMesh) {
            // @ts-ignore
            child.material.envMap = envMap;
            meshes.push(child);
            child.originalPosition = child.position;

            if (child.name === 'kamion') {
              child.add(camera);
            }
          }
        });

        scene.add(gltf.scene);
      }
    );
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    this.renderer.render(this.scene, this.camera);
    this.stats.update();

    this.meshes.forEach((item: Mesh) => {
      if (item.name !== 'Plane') {
        item.position.x += this.speed / 100;
      }

      if (item.name.includes('kolesa')) {
        item.rotateZ((this.speed / 100) * -1);
      }

      const rndColor = parseInt(Math.floor(Math.random() * 16777215).toString(16), 16);

      if (item.name === 'kamion_naklad' && this.colorChange) {
        // @ts-ignore
        item.material.color = new THREE.Color(rndColor);
        this.colorChange = false;
      }
    });
  }
}
