import {Component, OnInit} from '@angular/core';

declare var THREE;

@Component({
  selector: 'app-three',
  templateUrl: './three.component.html',
  styleUrls: ['./three.component.scss']
})
export class ThreeComponent implements OnInit {

  constructor() {
  }

  ngOnInit() {
    this.createScene();
  }

  createScene() {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    const renderer = new THREE.WebGLRenderer({
      canvas: document.getElementById('three')
    });
  }

}
