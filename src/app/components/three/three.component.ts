import {Component, OnInit} from '@angular/core';
import * as THREE from 'three';

@Component({
  selector: 'app-three',
  templateUrl: './three.component.html',
  styleUrls: ['./three.component.scss']
})
export class ThreeComponent implements OnInit {
  dae: any;
  loader: any;
  scene: THREE.Scene = new THREE.Scene();
  camera: THREE.Camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  renderer: THREE.Renderer;

  constructor() {
  }

  ngOnInit() {
    this.createScene();
  }

  createScene() {
    this.renderer = new THREE.WebGLRenderer(<THREE.WebGLRendererParameters>{
      canvas: document.getElementById('three')
    });

    this.loader = new THREE.Loader();
  }

  loadObject(collada: THREE.ColladaModel) {
    this.dae = collada.scene;

  }

}
