import * as THREE from 'three';
import Item from './Item';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';
import ItemsManager from './ItemsManager';
import Environments from '../Init3d';
import { AvatarAction } from 'src/constant/constantClass';
import { SCENE_NAME } from 'src/constant/constant';

export default class HorseItem extends Item {
  constructor(itemData: any) {
    super(itemData);
  }

  public mesh: THREE.Object3D;
  public currentHorseAction: AvatarAction;
  protected startChangingAinmation = false;
  protected endChangingAinmation = false;

  public rideBone: THREE.Object3D;
  public rideBoneworldPos: THREE.Vector3 = new THREE.Vector3();

  public horseIdleAction: AvatarAction;
  public horseRunAction: AvatarAction;
  public horseJumpAction: AvatarAction;
  public horseWalkAction: AvatarAction;

  public allActions: AvatarAction[] = [];

  public loaded = false;

  public SetMesh(mesh: THREE.Object3D) {
    this.mesh = mesh;
  }
  public RemoveFromAvatar() {
    this.mesh.parent.remove(this.mesh);
  }
  protected CloneProperties(from: HorseItem, to: HorseItem) {
    super.CloneProperties(from, to);
    to.loaded = from.loaded;
    to.rideBone = from.rideBone;
  }
  Reset() {
    this.mesh.position.x = 0;
    this.mesh.position.y = 0;
    this.mesh.position.z = 0;
    this.mesh.children[0].position.z = -50;
  }
  MakeSide(){
    this.mesh.position.x = 0.7;
    this.mesh.position.y = 0;
    this.mesh.position.z = -0.5;
  }
  GetRidePos(): THREE.Vector3 {
    this.rideBone.getWorldPosition(this.rideBoneworldPos);
    return this.rideBoneworldPos;
  }
  Run() {
    this.PlayAnimation(this.horseRunAction);
  }

  Walk() {
    this.PlayAnimation(this.horseWalkAction);
  }

  Idle() {
    this.PlayAnimation(this.horseIdleAction);
  }
  ForceIdle(){
    this.OffAllActions();
    this.currentHorseAction = this.horseIdleAction;
    this.currentHorseAction.action.setEffectiveWeight(1);
  }

  Jump() {
    this.PlayAnimation(this.horseJumpAction, false);
  }
  PlayAnimation(toAction: AvatarAction, delay = true) {
    if (toAction != this.currentHorseAction) {
      if (delay) {
        this.currentHorseAction = toAction;
        this.startChangingAinmation = true;
        this.endChangingAinmation = false;
      } else {
        this.OffAllActions();
        this.currentHorseAction = toAction;
        this.currentHorseAction.action.time = 0.25;
        this.currentHorseAction.action.setEffectiveWeight(1);
      }
    }
  }
  OffAllActions() {
    this.allActions.forEach(function (action) {
      action.action.setEffectiveWeight(0);
    });
  }
  public Clone(): HorseItem {
    const _item = new HorseItem(this.itemData);
    const _mountParent = new THREE.Object3D();
    const skeleton = SkeletonUtils.clone(this.mesh);
    skeleton.rotation.x = Math.PI / 2;

    _mountParent.add(skeleton);
    // skeleton.position.z -= 30;
    _item.mesh = _mountParent;
    _item.mesh.scale.set(0.01, 0.01, 0.01);

    const mixer = new THREE.AnimationMixer(_item.mesh.children[0].children[0]);

    _item.horseIdleAction = new AvatarAction(
      mixer.clipAction(ItemsManager.Ins.horseAnimations[1]),
      true,
    );
    _item.horseRunAction = new AvatarAction(
      mixer.clipAction(ItemsManager.Ins.horseAnimations[0]),
      true,
    );
    _item.horseJumpAction = new AvatarAction(
      mixer.clipAction(ItemsManager.Ins.horseAnimations[2]),
      true,
    );
    _item.horseWalkAction = new AvatarAction(
      mixer.clipAction(ItemsManager.Ins.horseAnimations[3]),
      true,
    );
    _item.horseWalkAction.action.timeScale = 1.3;
    _item.horseRunAction.action.timeScale = 1.2;
    _item.allActions = [
      _item.horseIdleAction,
      _item.horseJumpAction,
      _item.horseRunAction,
      _item.horseWalkAction,
    ];
    _item.mesh.traverse((child) => {
      if (child.type == 'SkinnedMesh') child.frustumCulled = false;
    });
    _item.PlayAllActions();
    _item.Idle();
    if(Environments.Ins.scenesManager.GetActiveScene().name == SCENE_NAME.AVATARS)
    {
      _item.MakeSide();
    }
    else{
      _item.Reset();
    }
    Environments.Ins.animationsManager.addAnimation(mixer);
    this.CloneProperties(this, _item);
    return _item;
  }
  PlayAllActions() {
    this.allActions.forEach(function (action) {
      action.action.setEffectiveWeight(0);
      action.action.play();
    });
  }
  protected ActiveAnimation(deltaTime: number) {
    this.currentHorseAction.action.setEffectiveWeight(
      this.currentHorseAction.action.getEffectiveWeight() + 10 * deltaTime,
    );
    if (this.currentHorseAction.action.getEffectiveWeight() > 1) {
      this.currentHorseAction.action.setEffectiveWeight(1);
      this.startChangingAinmation = false;
      this.endChangingAinmation = true;
    }
  }

  protected DeactiveAnimation(deltaTime: number) {
    let count = 0;
    for (let i = 0; i < this.allActions.length; i++) {
      if (this.allActions[i].name != this.currentHorseAction.name) {
        this.allActions[i].action.setEffectiveWeight(
          this.allActions[i].action.getEffectiveWeight() - 10 * deltaTime,
        );
        if (this.allActions[i].action.getEffectiveWeight() < 0) {
          this.allActions[i].action.setEffectiveWeight(0);
          count++;
        }
      }
    }
    if (count == this.allActions.length - 1) {
      this.endChangingAinmation = false;
    }
  }

  private UpdateAnimation(deltaTime: number) {
    if (this.startChangingAinmation) {
      this.ActiveAnimation(deltaTime);
    }
    if (this.endChangingAinmation) {
      this.DeactiveAnimation(deltaTime);
    }
  }

  public Update(deltaTime: number) {
    this.UpdateAnimation(deltaTime);
  }
}
