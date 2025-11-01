import * as THREE from 'three';
import Arrows from '../avatars/Arrows';
export default class MScene {
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;
  public name: string;
  public control: any;
  public container: HTMLElement;
  public isReady = false;

  public arrows: Arrows;

  constructor() {
    this.isReady = false;
  }

  public Update(deltaTime: number) {
    this.renderer.render(this.scene, this.camera);
  }
  public onWindowResize(){
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}
