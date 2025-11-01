import { LandOwner } from 'src/constant/constantClass';
import * as THREE from 'three';
import { LAND_STATUS, LAND_TYPE, RAYLAYER } from 'src/constant/constant';
import Building from './Building';
import PhysicWorld from '../physic/PhysicWorld';

export default class Land {
  constructor(
    landName: string,
    landID: number,
    landType: string,
    allLandsMesh: THREE.InstancedMesh,
    posObject: THREE.Object3D,
    index: number,
    physicWorld: PhysicWorld,
  ) {
    this.landName = landName;
    this.landID = landID;
    this.index = index;
    this.landType = landType;
    this.landStatus = LAND_STATUS.UN_BUY;
    this.allLandsMesh = allLandsMesh;
    this.username = '';

    posObject.updateMatrixWorld(true);
    this.allLandsMesh.setMatrixAt(this.index, posObject.matrixWorld);

    this.hideMatrix = new THREE.Matrix4();
    this.hideMatrix.makeScale(0, 0, 0);
    this.posObject = posObject;
    physicWorld.AddInteractableCollider(this.allLandsMesh, RAYLAYER.LAND, true);
    this.CreateText();
  }

  landName: string;
  landOwner: LandOwner;
  landID: number;
  landType: string;
  index: number;
  allLandsMesh: THREE.InstancedMesh;
  landCollider: THREE.Mesh;
  landStatus: string;
  building: Building;
  buildStatus = 0;
  hideMatrix: THREE.Matrix4;
  posObject: THREE.Object3D;

  teleportPos: THREE.Vector3;
  username: string;
  landInfo: any;

CreateText() {
    // Create land info text
  }

  ShowLand(isShow = true) {
    this.allLandsMesh.setMatrixAt(this.index, this.posObject.matrixWorld);
  }

  ShowBuilding(isShow = true) {
    this.building.object.SetVisible(isShow);
  }

  AddBuilding(building: Building, isShow = true) {
    this.building = building;
  }

  SetFree(mat: any) {
    this.allLandsMesh.setMatrixAt(this.index, this.hideMatrix);
  }

  GetTeleportPos(): THREE.Vector3 {
    if (this.teleportPos) {
      return this.teleportPos;
    } else {
      this.teleportPos = new THREE.Vector3();
      const help = new THREE.AxesHelper();
      this.posObject.add(help);
      if(this.landType == LAND_TYPE.HUMAN){
        help.position.x -= 4;
      }
      else if(this.landType == LAND_TYPE.SAMURAI){
        help.position.z -= 8;
      }
      else if(this.landType == LAND_TYPE.STORE){
        help.position.z -= 6;
      }
      help.getWorldPosition(this.teleportPos);
      this.posObject.remove(help);
      return this.teleportPos;
    }
  }
  GetWorldPosition() {
    return this.posObject.position;
  }

  UpdateStatus() {
    // update status of land(bought or not, built of not)
  }
}
