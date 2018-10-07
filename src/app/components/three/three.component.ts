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
    this.camera.position.set(-2, 1, 3);

    this.controls = new THREE.OrbitControls(this.camera);
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

    this.loader.load(
      'assets/kamion.glb',
      (gltf) => {
        gltf.scene.traverse(function (child) {
          if (child.isMesh) {
            child.material.envMap = envMap;
            meshes.push(child);
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
      item.rotateY(0.005);
    });
  }
}
