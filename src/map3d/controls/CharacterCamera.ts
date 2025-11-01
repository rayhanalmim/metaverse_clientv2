import * as THREE from 'three';
import CharacterController from './CharacterController';
import PhysicWorld from '../physic/PhysicWorld';

export default class CharacterCamera {
  camera: THREE.PerspectiveCamera;
  public cameraPointBack: THREE.Object3D;
  public cameraPointLeft: THREE.Object3D;
  public cameraPointRight: THREE.Object3D;

  public stopUpdate = true;

  controller: CharacterController;

  constructor(camera: THREE.PerspectiveCamera) {
    this.camera = camera;
  }

}
