import * as THREE from 'three';
import BaseAvatar from './BaseAvatar';
import PhysicWorld from '../physic/PhysicWorld';
import BaseArrow from './BaseArrow';

export default class Arrow extends BaseArrow {
  public veloc: THREE.Vector3 = new THREE.Vector3();
  public collided = false;
  public timeToDestroy = 5;
  public force = false;
  constructor(
    id: string,
    mesh: THREE.Mesh,
    dir: THREE.Vector3 = null,
    quat: THREE.Quaternion = null,
    avatar: BaseAvatar = null,
  ) {
    super(id, mesh, dir, quat, avatar);
    this.rayCast = new THREE.Raycaster();
    this.rayCast.far = 1.7;
  }

  Update(deltaTime: number, physicWorld: PhysicWorld) {
    if (this.collided == false) {
      this.veloc.y -= 4 * deltaTime;
      this.mesh.lookAt(
        this.mesh.position.x + this.veloc.x * deltaTime,
        this.mesh.position.y + this.veloc.y * deltaTime,
        this.mesh.position.z + this.veloc.z * deltaTime,
      );
      this.mesh.position.x += this.veloc.x * deltaTime;
      this.mesh.position.y += this.veloc.y * deltaTime;
      this.mesh.position.z += this.veloc.z * deltaTime;

      this.rayCast.ray.origin = this.mesh.position
        .clone()
        .addScaledVector(this.rayCast.ray.direction, -1.5);
      this.mesh.getWorldDirection(this.rayCast.ray.direction);
      // this.arrorDebug.position.set(this.rayCast.ray.origin.x, this.rayCast.ray.origin.y,this.rayCast.ray.origin.z);
      // this.arrorDebug.setDirection(this.rayCast.ray.direction);
      if (this.rayCast.intersectObject(physicWorld.colliderParent, true).length > 0) {
        this.collided = true;
      }
    } else {
      this.timeToDestroy -= deltaTime;
    }
  }
}
