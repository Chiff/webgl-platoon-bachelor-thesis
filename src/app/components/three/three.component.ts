import {Component, OnInit} from '@angular/core';

import * as THREE from 'three';
import {OrbitControls} from 'three/examples/js/controls/OrbitControls';
import GLTFLoader from 'three-gltf-loader';


@Component({
  selector: 'app-three',
  templateUrl: './three.component.html',
  styleUrls: ['./three.component.scss']
})
export class ThreeComponent implements OnInit {
  dae: any;
  loader: GLTFLoader;
  scene: THREE.Scene;
  camera: THREE.Camera;
  controls: OrbitControls;
  renderer: THREE.Renderer;

  constructor() {
  }

  ngOnInit() {
    this.createScene();
    this.loadObject();
    this.animate();
  }

  createScene() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.controls = new OrbitControls(this.camera);

    this.renderer = new THREE.WebGLRenderer(<THREE.WebGLRendererParameters>{
      canvas: document.getElementById('three')
    });
  }

  /** https://threejs.org/docs/#examples/loaders/GLTFLoader */
  loadObject() {
    this.loader = new GLTFLoader();
    this.loader.load(
      'assets/kamion.glb',
      (gltf) => {
        console.log(gltf);
        this.scene.add(gltf.scene);
      }
    );
  }

  animate() {
    const anim = this.animate;
    requestAnimationFrame(anim);
    this.renderer.render(this.scene, this.camera);
  }
}
