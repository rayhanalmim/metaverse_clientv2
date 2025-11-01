import { BODY_PART, UPDATE_TIME } from 'src/constant/constant';
import TWEEN, { Tween } from '@tweenjs/tween.js';
import * as THREE from 'three';

export default class AvatarMesh {
  public avatarlink: any;
  public avatarMesh: THREE.Object3D;

  public id: number;
  public sex: number;
  public name: string;

  public head: THREE.SkinnedMesh;
  public arm: THREE.SkinnedMesh;
  public body: THREE.SkinnedMesh;
  public foot: THREE.SkinnedMesh;
  public hand: THREE.SkinnedMesh;
  public leg: THREE.SkinnedMesh;

  constructor(avatarData: any) {
    this.avatarlink = avatarData.avatar_url;
    this.sex = +avatarData.gender;
    this.name = avatarData.name;
    this.id = avatarData.id;
  }

  SetMesh(mesh: THREE.Object3D) {
    this.avatarMesh = mesh;
    this.avatarMesh.traverse((child) => {
      if (child.type == 'SkinnedMesh') {
        child.frustumCulled = false;
      }
    });
    this.AssignAvatarMesh();
  }

  AssignAvatarMesh() {
    this.head = this.avatarMesh.getObjectByName(BODY_PART.HEAD) as THREE.SkinnedMesh;
    this.body = this.avatarMesh.getObjectByName(BODY_PART.BODY) as THREE.SkinnedMesh;
    this.hand = this.avatarMesh.getObjectByName(BODY_PART.HAND) as THREE.SkinnedMesh;
    this.arm = this.avatarMesh.getObjectByName(BODY_PART.ARM) as THREE.SkinnedMesh;
    this.leg = this.avatarMesh.getObjectByName(BODY_PART.LEG) as THREE.SkinnedMesh;
    this.foot = this.avatarMesh.getObjectByName(BODY_PART.FOOT) as THREE.SkinnedMesh;
  }

  CloneProperties(from: AvatarMesh, to: AvatarMesh) {
    to.id = from.id;
    to.sex = from.sex;
    to.name = from.name;
    to.avatarMesh = from.avatarMesh;
    to.avatarlink = from.avatarlink;
  }

  Clone(): AvatarMesh {
    const _clone = new AvatarMesh(this.avatarlink);
    _clone.SetMesh(this.avatarMesh.clone(true));
    this.CloneProperties(this, _clone);
    return _clone;
  }
}
