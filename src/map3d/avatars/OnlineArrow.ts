import * as THREE from 'three';
import BaseAvatar from './BaseAvatar';
import BaseArrow from './BaseArrow';
import IArrowSocketData from './IArrowSocketData';
import { ARROW_TYPE } from 'src/constant/constant';

export default class OnlineArrow extends BaseArrow {
  targetPos: THREE.Vector3 = new THREE.Vector3();
  constructor(
    id: string,
    mesh: THREE.Mesh,
    dir: THREE.Vector3 = null,
    quat: THREE.Quaternion = null,
    avatar: BaseAvatar = null,
  ) {
    super(id, mesh, dir, quat, avatar);
  }
  UpdateSocket(data) {
    if (data.type == ARROW_TYPE.FORCE_UPDATE) {
      this.targetPos.x = data.pos.x;
      this.targetPos.y = data.pos.y;
      this.targetPos.z = data.pos.z;
      this.mesh.position.x = this.targetPos.x;
      this.mesh.position.y = this.targetPos.y;
      this.mesh.position.z = this.targetPos.z;
    } else {
      this.targetPos.x = data.pos.x;
      this.targetPos.y = data.pos.y;
      this.targetPos.z = data.pos.z;
    }

    this.mesh.quaternion.x = data.quat._x;
    this.mesh.quaternion.y = data.quat._y;
    this.mesh.quaternion.z = data.quat._z;
    this.mesh.quaternion.w = data.quat._w;
    this.mesh.children[0].quaternion.x = data.subMeshQuat._x;
    this.mesh.children[0].quaternion.y = data.subMeshQuat._y;
    this.mesh.children[0].quaternion.z = data.subMeshQuat._z;
    this.mesh.children[0].quaternion.w = data.subMeshQuat._w;
  }

  Update(deltaTime: number) {
    this.mesh.position.lerp(this.targetPos, THREE.MathUtils.clamp(0.2 * deltaTime, 0.1, 1));
    // this.mesh.position.x = this.targetPos.x;
    // this.mesh.position.y = this.targetPos.y;
    // this.mesh.position.z = this.targetPos.z;
  }
}
