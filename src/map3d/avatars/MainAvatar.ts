import * as THREE from 'three';
import {
  BODY_PART,
  BONE,
  CLIP_NAMES,
  COLLISION_GROUP,
  ITEM_TYPE,
  SHOOT_TYPE,
  UPDATE_TIME,
} from 'src/constant/constant';
import { AvatarAction } from 'src/constant/constantClass';
import PhysicWorld from '../physic/PhysicWorld';
import BaseAvatar from './BaseAvatar';
import App3D from '../App3D';

const VECTOR3_ZERO = new THREE.Vector3(0, 0, 0);
export default class MainAvatar extends BaseAvatar {
  private randomActions: AvatarAction[];
  public randomAnimations = true;
  private animationRandomTime = 10000;

  public changeSceneCallback: any;

  constructor(avatarlink: string, callback: any, userName = 'Sengoku', isCreateText = false) {
    super(
      avatarlink,
      (avatarRoot: THREE.Object3D) => {
        this.randomActions = [this.idleAction, this.TPoseAction];
        this.RandomAnimation();
        callback(avatarRoot);
      },
      userName,
      isCreateText,
    );
  }
  Shoot(arrowSetupCallback: any, arrowStartCallback: any, shootFinishCallback: any): void {
    super.Shoot(arrowSetupCallback, arrowStartCallback, shootFinishCallback);
    App3D.Ins.EmitShoot({ type: SHOOT_TYPE.START, spineQuat: this.spine.quaternion });
  }

  CreateCollider(physicWorld: PhysicWorld = null) {
    if (physicWorld) {
      this.ChangePhysicWorld(physicWorld);
    }
  }

  ChangePhysicWorld(physicWorld: PhysicWorld) {
    // change physicword
  }

  nextRandomAction(min, max, excluded) {
    let n = Math.floor(Math.random() * (max - min) + min);
    if (n >= excluded) n++;
    return n;
  }

  public RandomAnimation() {
    const nextAction =
      this.randomActions[
        this.nextRandomAction(
          0,
          this.randomActions.length - 1,
          this.randomActions.indexOf(this.currentAction),
        )
      ];
    // to do: check animations time and change
    // if (nextAction.canLoop) {
    //   this.animationRandomTime = nextAction.action.time * 5;
    //   console.log(nextAction.action.getClip().name, "loop", this.animationRandomTime);
    // } else {
    //   this.animationRandomTime = nextAction.action.time;
    //   console.log(nextAction.action.getClip().name, "K loop", this.animationRandomTime);
    // }
    this.ChangeAnimations(this.currentAction, nextAction, () => {
      setTimeout(() => {
        if (this.randomAnimations) {
          this.RandomAnimation();
        }
      }, this.animationRandomTime);
    });
  }

  // #endregion

  public Update(deltaTime: number, target = null) {
    // Hide avatar when move far away from camera
    // if this avatar is not main avatar
    super.Update(deltaTime, target);

    if (this.shootting) {
      const timeRate = this.shootAction.action.time / this.shootAction.action.getClip().duration;

      if (timeRate < 0.17 && this.arrowSetupCallback) {
        this.bowItem.meshes.forEach((mesh) => {
          mesh.morphTargetInfluences[0] = 0.5;
        });
      } else if (timeRate > 0.17 && timeRate < 0.3) {
        this.bowItem.meshes.forEach((mesh) => {
          mesh.morphTargetInfluences[0] = 0.5 + timeRate * 0.5;
        });
      }
      if (timeRate >= 0.55 && this.arrowStartCallback) {
        this.spine.quaternion.copy(this.dummyShoot.quaternion);

        this.arrowStartCallback();
        this.bowItem.meshes.forEach((mesh) => {
          mesh.morphTargetInfluences[0] = 0;
        });
        this.arrowStartCallback = null;
      }
      this.spine.quaternion.slerp(this.dummyShoot.quaternion, 0.1);
      App3D.Ins.EmitShoot({
        spineQuat: this.spine.quaternion,
        morph: this.bowItem.meshes[0].morphTargetInfluences[0],
        type: SHOOT_TYPE.UPDATE,
      });
      if (timeRate >= 0.75) {
        this.StopShoot();
        if (this.shootFinishCallback) {
          this.shootFinishCallback();
        }
        this.shootting = false;
        App3D.Ins.EmitShoot({
          spineQuat: this.spine.quaternion,
          morph: this.bowItem.meshes[0].morphTargetInfluences[0],
          type: SHOOT_TYPE.END,
        });
      }

    }
  }
}
