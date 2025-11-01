import { BODY_PART, UPDATE_TIME } from 'src/constant/constant';
import TWEEN, { Tween } from '@tweenjs/tween.js';
import * as THREE from 'three';
import AvatarMesh from './AvatarMesh';

export default class MainAvatarMesh extends AvatarMesh {
  public skeleton: THREE.Skeleton;

  private worldDir: THREE.Vector3 = new THREE.Vector3();
  private worldQuaternion: THREE.Quaternion = new THREE.Quaternion();

  SetMesh(mesh: THREE.Object3D) {
    super.SetMesh(mesh);
    mesh.traverse((child) => {
      if (child.type == 'SkinnedMesh') {
        const skinned = child as THREE.SkinnedMesh;
        this.skeleton = skinned.skeleton;
      }
    });
  }

  LookAt(target: THREE.Vector3) {
    this.avatarMesh.lookAt(target);
  }

  Rotate(newQuat: THREE.Quaternion, time: number) {
    new TWEEN.Tween({ x: 0 })
      .to({ x: 1 }, time || UPDATE_TIME)
      .onUpdate((value) => {
        this.avatarMesh.quaternion.slerp(newQuat, value.x);
      })
      .start();
  }

  SmoothRotate(newQuat: THREE.Quaternion, deltaTime: number) {
    newQuat.x = 0;
    newQuat.z = 0;
    this.avatarMesh.quaternion.slerp(newQuat, 10 * deltaTime);
  }

  public SetQuaternionQ(quat: THREE.Quaternion) {
    this.avatarMesh.applyQuaternion(quat);
  }

  public SetQuaternion(x: number, y: number, z: number, w: number) {
    this.avatarMesh.quaternion.set(x, y, z, w);
  }

  public SetQuatFromAxisAngle(axis: THREE.Vector3, angle: number) {
    this.avatarMesh.quaternion.setFromAxisAngle(axis, angle);
  }

  public getQuaternion(world = false) {
    if (world) {
      this.avatarMesh.getWorldQuaternion(this.worldQuaternion);
      return this.worldQuaternion;
    } else return this.avatarMesh.quaternion;
  }

  public GetQuaternion(): THREE.Vector4 {
    const qua = new THREE.Vector4(
      this.avatarMesh.quaternion.x,
      this.avatarMesh.quaternion.y,
      this.avatarMesh.quaternion.z,
      this.avatarMesh.quaternion.w,
    );
    return qua;
  }

  public GetWorldDirection(): THREE.Vector3 {
    this.avatarMesh.getWorldDirection(this.worldDir);
    return this.worldDir;
  }

  public GetPosition(): THREE.Vector3 {
    return this.avatarMesh.position;
  }

  public add(object: THREE.Object3D) {
    this.avatarMesh.add(object);
  }

  ShowHidePart(part: string, isVisible = false) {
    switch (part) {
      case BODY_PART.ARM:
        if (this.arm) this.arm.visible = isVisible;
        break;
      case BODY_PART.BODY:
        if (this.body) this.body.visible = isVisible;
        break;
      case BODY_PART.HAND:
        if (this.hand) this.hand.visible = isVisible;
        break;
      case BODY_PART.HEAD:
        if (this.head) this.head.visible = isVisible;
        break;
      case BODY_PART.LEG:
        if (this.leg) this.leg.visible = isVisible;
        break;
      case BODY_PART.FOOT:
        if (this.foot) this.foot.visible = isVisible;
        break;
      default:
        break;
    }
  }

  getObjectByName(name: string) {
    return this.avatarMesh.getObjectByName(name);
  }

  ShowMesh(visible = true) {
    this.avatarMesh.visible = visible;
  }

  AssignNewMesh(avatarMesh: AvatarMesh) {
    if (this.head) {
      avatarMesh.head.visible = this.head.visible;
      this.head.parent.remove(this.head);
    }
    if (this.body) {
      avatarMesh.body.visible = this.body.visible;
      this.body.parent?.remove(this.body);
    }
    if (this.arm) {
      avatarMesh.arm.visible = this.arm.visible;
      this.arm.parent?.remove(this.arm);
    }
    if (this.hand) {
      avatarMesh.hand.visible = this.hand.visible;
      this.hand.parent?.remove(this.hand);
    }
    if (this.leg) {
      avatarMesh.leg.visible = this.leg.visible;
      this.leg.parent?.remove(this.leg);
    }
    if (this.foot) {
      avatarMesh.foot.visible = this.foot.visible;
      this.foot.parent?.remove(this.foot);
    }
    this.head = avatarMesh.head;
    this.body = avatarMesh.body;
    this.arm = avatarMesh.arm;
    this.hand = avatarMesh.hand;
    this.leg = avatarMesh.leg;
    this.foot = avatarMesh.foot;
  }

  BindMeshesToAvatar(avatarMesh: AvatarMesh) {
    this.AssignNewMesh(avatarMesh);
    this.BindMeshToAvatar(this.head);
    this.BindMeshToAvatar(this.body);
    this.BindMeshToAvatar(this.arm);
    this.BindMeshToAvatar(this.hand);
    this.BindMeshToAvatar(this.leg);
    this.BindMeshToAvatar(this.foot);
  }

  BindMeshToAvatar(newObject: THREE.SkinnedMesh) {
    this.add(newObject);
    if (newObject.type == 'SkinnedMesh') {
      newObject.bind(this.skeleton, newObject.bindMatrix);
    } else {
      const meshes = [];
      newObject.traverse((child) => {
        if (child.type == 'SkinnedMesh') {
          meshes.push(child);
        }
      });
      meshes.forEach((child) => {
        child.bind(this.skeleton, child.bindMatrix);
      });
    }
  }
}
