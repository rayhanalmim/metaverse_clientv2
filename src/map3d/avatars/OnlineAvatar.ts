import * as THREE from 'three';
import BaseAvatar from './BaseAvatar';
import AvatarManager from './AvatarManager';
import ItemsManager from '../items/ItemsManager';
import { IOnMovement } from 'src/interfaces/socket';
import { ACTIONS_DEFINE, JUMP_TYPE, SHOOT_TYPE } from 'src/constant/constant';
import Arrow from './Arrow';
import Env from '../Init3d';

const VECTOR3_ZERO = new THREE.Vector3(0, 0, 0);
export default class OnlineAvatar extends BaseAvatar {
  protected targetPos: THREE.Vector3;
  public distanceFromCamera: number;
  private canJump = true;
  private canShoot = true;

  constructor(overview: any, callback: any, userName = 'Sengoku', isCreateText = false) {
    super(null, callback, userName, isCreateText);
    this.targetPos = new THREE.Vector3();
  }

  public UpdateAvatar(overview: IOnMovement) {
    if (!this.avatarRoot) return;
    const { x, y, z, w } = overview.quaternion;

    this.targetPos.x = overview.position.x;
    this.targetPos.y = overview.position.y;
    this.targetPos.z = overview.position.z;
    if (!this.avatarRoot.position.x || !this.avatarRoot.position.z) {
      this.SetPositionV(this.targetPos);
    }
    this.SetQuaternion(x, y, z, w);
    if (this.canJump && overview.velocity) {
      if (
        Math.abs(overview.velocity.z) > ACTIONS_DEFINE.RUN ||
        Math.abs(overview.velocity.x) > ACTIONS_DEFINE.RUN
      ) {
        this.Run();
      } else if (
        Math.abs(overview.velocity.z) < ACTIONS_DEFINE.IDLE &&
        Math.abs(overview.velocity.x) < ACTIONS_DEFINE.IDLE
      ) {
        this.Idle();
      } else {
        this.Walk();
      }
    }
  }
  public OnlineJump(type: number) {
    if (type == JUMP_TYPE.START) {
      if (this.canJump) {
        super.Jump();
      }
      this.canJump = false;
    } else {
      this.canJump = true;
    }
  }

  public OnlineShoot(data: any) {
    let arrow: Arrow;
    if (data.type == SHOOT_TYPE.START) {
      super.Shoot(
        () => {
          // no
        },
        () => {
          // no
        },
        () => {
          this.canShoot = true;
        },
      );
    } else if (data.type == SHOOT_TYPE.UPDATE) {
      this.spine.quaternion.set(
        data.spineQuat._x,
        data.spineQuat._y,
        data.spineQuat._z,
        data.spineQuat._w,
      );
      this.bowItem.meshes.forEach((mesh) => {
        mesh.morphTargetInfluences[0] = data.morph;
      });
    } else {
      super.StopShoot();
    }
  }

  public Update(deltaTime: number, target = null) {
    super.Update(deltaTime, target);
    if (target && this.avatarRoot) {
      if (this.targetPos) {
        this.avatarRoot?.position.lerp(this.targetPos, 0.1);
      }
      this.distanceFromCamera = target.distanceTo(this.GetPosition());
      if (this.distanceFromCamera > 50) {
        this.avatarRoot.visible = false;
        return;
      } else {
        this.avatarRoot.visible = true;
      }
      this.avatarText?.lookAt(target);
    }
  }
}
