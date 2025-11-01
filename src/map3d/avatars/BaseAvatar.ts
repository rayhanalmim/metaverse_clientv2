import { AnimationObjectGroup, Vector3 } from 'three';
import * as THREE from 'three';
import Env from '../Init3d';
import TWEEN, { Tween } from '@tweenjs/tween.js';
import {
  BODY_PART,
  BONE,
  CLIP_NAMES,
  COLLISION_GROUP,
  ITEM_TYPE,
  UPDATE_TIME,
} from 'src/constant/constant';
import { Text } from 'troika-three-text';
import { AvatarAction } from 'src/constant/constantClass';
import { ResetTransform } from 'src/utils/ObjectUtils';
import NormalItem from '../items/normalItem';
import AvatarMesh from './AvatarMesh';
import MainAvatarMesh from './MainAvatarMesh';
import ItemsManager from '../items/ItemsManager';
import AvatarManager from './AvatarManager';
import HorseItem from '../items/HorseItem';
import App3D from '../App3D';

const VECTOR3_ZERO = new THREE.Vector3(0, 0, 0);

export default class BaseAvatar {
  protected mainAvatarMesh: MainAvatarMesh;
  protected avatarRoot: THREE.Object3D;
  protected avatarText: Text;
  protected avatarLink: string;
  protected mixer: THREE.AnimationMixer;

  protected hatItem: NormalItem;
  protected maskItem: NormalItem;
  protected gloveItem: NormalItem;
  protected shoeItem: NormalItem;
  protected bodyItem: NormalItem;
  public horseItem: HorseItem;
  public bowItem: NormalItem;

  protected idleAction: AvatarAction;
  // private idle1Action: AvatarAction;
  // private idle2Action: AvatarAction;
  // private idle3Action: AvatarAction;
  // private idle4Action: AvatarAction;
  protected walkAction: AvatarAction;
  protected runAction: AvatarAction;
  protected jumpAction: AvatarAction;
  protected TPoseAction: AvatarAction;

  protected shootAction: AvatarAction;

  protected horseIdleAction: AvatarAction;
  protected horseWalkAction: AvatarAction;
  protected horseRunAction: AvatarAction;
  protected horseJumpAction: AvatarAction;
  protected allActions: AvatarAction[];

  public rootBone: THREE.Object3D;
  public rightShoulder: THREE.Object3D;
  public leftShoulder: THREE.Object3D;
  public leftHand: THREE.Object3D;
  public spine1: THREE.Object3D;
  public spine: THREE.Object3D;
  public head: THREE.Object3D;

  public currentAction: AvatarAction;
  public controlAction: Tween<any>;
  public dummyShoot: THREE.Object3D;

  protected moveTween: any;
  public userName: string;
  protected startChangingAinmation = false;
  protected endChangingAinmation = false;
  public changingAvatarMesh = false;
  public shootting = false;
  public shootFinishCallback: any;
  public arrowStartCallback: any;
  public arrowSetupCallback: any;

  public dummyShootHelper: THREE.AxesHelper;

  public jumpHeight = 0;
  public moveSpeed = 1;

  public arrowShootHelper: THREE.ArrowHelper;

  public IsRide() {
    if (this.horseItem) return true;
    else return false;
  }

  public ResetHorse() {
    this.horseItem?.Reset();
  }

  public HasBow() {
    if (this.bowItem) return true;
    else return false;
  }

  constructor(avatarlink: string, callback: any, userName = 'Sengoku', isCreateText = false) {
    this.avatarLink = avatarlink;
    this.userName = userName;
    AvatarManager.Ins.GetAvatarSeketon((avatarRoot) => {
      this.avatarRoot = avatarRoot;
      this.avatarRoot.name = this.userName;
      if (isCreateText) {
        this.InitAvatarText();
      }
      this.mainAvatarMesh = new MainAvatarMesh({ name: 'Default', link: avatarlink, sex: '0' });
      this.mainAvatarMesh.SetMesh(avatarRoot.children[0]);
      this.rootBone = this.mainAvatarMesh.skeleton.getBoneByName(BONE.ROOT);
      this.rightShoulder = this.mainAvatarMesh.skeleton.getBoneByName(BONE.R_SHOULDER);
      this.leftShoulder = this.mainAvatarMesh.skeleton.getBoneByName(BONE.L_SHOULDER);
      this.leftHand = this.mainAvatarMesh.skeleton.getBoneByName(BONE.L_HAND);
      this.spine1 = this.mainAvatarMesh.skeleton.getBoneByName(BONE.SPINE1);
      this.spine = this.mainAvatarMesh.skeleton.getBoneByName(BONE.SPINE);
      this.head = this.mainAvatarMesh.skeleton.getBoneByName(BONE.HEAD);
      this.SetupAnimations(avatarRoot);
      this.dummyShoot = new THREE.AxesHelper();
      this.dummyShoot.name = 'DummyShoot';
      this.dummyShoot.visible = false;
      this.avatarRoot.add(this.dummyShoot);

      this.dummyShootHelper = new THREE.AxesHelper(3);
      this.leftHand.add(this.dummyShootHelper);
      this.dummyShootHelper.scale.x = 10;
      this.dummyShootHelper.scale.y = 10;
      this.dummyShootHelper.scale.z = 10;
      this.dummyShootHelper.rotation.x = -Math.PI / 2;
      this.dummyShootHelper.visible = false;

      this.arrowShootHelper = new THREE.ArrowHelper();
      this.arrowShootHelper.visible = false;
      this.avatarRoot.add(this.arrowShootHelper);
      callback(this.avatarRoot);
    });
  }

  GetAvatarId() {
    return this.mainAvatarMesh.id;
  }

  InitAvatarText() {
    this.avatarText = new Text();
    this.avatarRoot.add(this.avatarText);
    this.avatarText.text = this.userName;
    this.avatarText.fontSize = 0.12;
    this.avatarText.position.y = 2.1;
    this.avatarText.position.z = 0.07;
    this.avatarText.color = 0xffffff;
    this.avatarText.name = 'text';
    this.avatarText.textAlign = 'center';
    this.avatarText.anchorX = 'center';
    this.avatarText.sync();
  }

  SetText(text: string) {
    this.avatarText.text = text;
  }

  // #region Animations
  Run() {
    if (this.horseItem) {
      this.PlayAnimation(this.horseRunAction);
      this.horseItem.horseRunAction.action.time = this.horseRunAction.action.time;
      this.horseItem.Run();
    } else this.PlayAnimation(this.runAction);
  }

  Walk() {
    if (this.horseItem) {
      this.PlayAnimation(this.horseWalkAction);
      this.horseItem.horseWalkAction.action.time = this.horseWalkAction.action.time;
      this.horseItem.Walk();
    } else this.PlayAnimation(this.walkAction);
  }

  Idle() {
    if (this.horseItem) {
      this.PlayAnimation(this.horseIdleAction);
      this.horseItem.horseIdleAction.action.time = this.horseIdleAction.action.time;
      this.horseItem.Idle();
    } else this.PlayAnimation(this.idleAction);
  }

  Jump() {
    if (this.horseItem) {
      this.horseJumpAction.action.time = 0.25;
      this.PlayAnimation(this.horseJumpAction, false);
      this.horseItem.Jump();
    } else {
      this.jumpAction.action.time = 0.35;
      this.PlayAnimation(this.jumpAction, false);
    }
  }

  Shoot(arrowSetupCallback: any, arrowStartCallback: any, shootFinishCallback: any) {
    console.log('avatar shoot');
    for (let i = 0; i < this.allActions.length; i++) {
      if (this.allActions[i].name != CLIP_NAMES.SHOOT) {
        this.allActions[i].BottomFilter();
      }
    }
    this.BowToHand();
    this.shootAction.action.reset();
    this.shootAction.action.play();
    this.shootFinishCallback = shootFinishCallback;
    this.arrowStartCallback = arrowStartCallback;
    this.arrowSetupCallback = arrowSetupCallback;
    this.shootting = true;
    this.arrowSetupCallback();
  }

  StopShoot() {
    for (let i = 0; i < this.allActions.length; i++) {
      this.allActions[i].NoFilter();
    }
    this.BowToHand(true);
  }

  SetupAnimations(avatarRoot) {
    const ani = Env.Ins.animationsManager;
    this.mixer = new THREE.AnimationMixer(avatarRoot);
    Env.Ins.animationsManager.addAnimation(this.mixer);

    this.idleAction = new AvatarAction(this.mixer.clipAction(ani.GetClip(CLIP_NAMES.IDLE)), true);
    // this.idle1Action = new AvatarAction(
    //   this.mixer.clipAction(ani.GetClip(CLIP_NAMES.IDLE_1)),
    //   false,
    // );
    // this.idle2Action = new AvatarAction(
    //   this.mixer.clipAction(ani.GetClip(CLIP_NAMES.IDLE_2)),
    //   false,
    // );
    // this.idle3Action = new AvatarAction(
    //   this.mixer.clipAction(ani.GetClip(CLIP_NAMES.IDLE_3)),
    //   false,
    // );
    // this.idle4Action = new AvatarAction(
    //   this.mixer.clipAction(ani.GetClip(CLIP_NAMES.IDLE_4)),
    //   false,
    // );
    this.jumpAction = new AvatarAction(this.mixer.clipAction(ani.GetClip(CLIP_NAMES.JUMP)), false);
    this.runAction = new AvatarAction(this.mixer.clipAction(ani.GetClip(CLIP_NAMES.RUN)), true);
    this.shootAction = new AvatarAction(
      this.mixer.clipAction(ani.GetClip(CLIP_NAMES.SHOOT)),
      false,
    );
    this.shootAction.action.loop = THREE.LoopOnce;
    // this.shootAction.action.clampWhenFinished = true;

    this.TPoseAction = new AvatarAction(
      this.mixer.clipAction(ani.GetClip(CLIP_NAMES.TPOSE)),
      false,
    );
    this.walkAction = new AvatarAction(this.mixer.clipAction(ani.GetClip(CLIP_NAMES.WALK)), true);

    this.horseWalkAction = new AvatarAction(
      this.mixer.clipAction(ani.GetClip(CLIP_NAMES.H_WALK)),
      true,
    );
    this.horseIdleAction = new AvatarAction(
      this.mixer.clipAction(ani.GetClip(CLIP_NAMES.H_IDLE)),
      true,
    );
    this.horseRunAction = new AvatarAction(
      this.mixer.clipAction(ani.GetClip(CLIP_NAMES.H_RUN)),
      true,
    );
    this.horseJumpAction = new AvatarAction(
      this.mixer.clipAction(ani.GetClip(CLIP_NAMES.H_JUMP)),
      true,
    );

    this.walkAction.action.timeScale = 2.0;
    this.runAction.action.timeScale = 1.5;
    this.horseWalkAction.action.timeScale = 1.3;
    this.horseRunAction.action.timeScale = 1.2;
    this.allActions = [
      this.idleAction,
      // this.idle1Action,
      // this.idle2Action,
      // this.idle3Action,
      // this.idle4Action,
      this.jumpAction,
      this.runAction,
      this.walkAction,
      // this.TPoseAction,
      this.horseRunAction,
      this.horseIdleAction,
      this.horseJumpAction,
      this.horseWalkAction,
    ];

    // this.mixer.addEventListener('finished', (e) => {
    //   console.log('finished', e);
    //   if (this.shootting && e.action.getClip().name == CLIP_NAMES.SHOOT) {
    //   }
    // });

    for (let i = 0; i < this.allActions.length; i++) {
      this.SetupBindingAction(this.allActions[i]);
    }
    this.PlayAllActions();
    this.currentAction = this.TPoseAction;
  }

  SetupBindingAction(action: AvatarAction) {
    if (Env.Ins.animationsManager.upperBodyFilterBones) {
      action.normalBindings = (action.action as any)._propertyBindings || [];
      action.normalInterpolants = (action.action as any)._interpolants || [];

      for (let i = 0; i < action.normalBindings.length; i++) {
        const binding = action.normalBindings[i].binding;
        if (binding && Env.Ins.animationsManager.upperBodyFilterBones.includes(binding.node.name)) {
          action.filteredBindings.push(action.normalBindings[i]);
          action.filteredInterpolants.push(action.normalInterpolants[i]);
        }
      }
    }
  }

  PlayAllActions() {
    this.allActions.forEach(function (action) {
      action.action.setEffectiveWeight(0);
      action.action.play();
    });
  }

  OffAllActions() {
    this.allActions.forEach(function (action) {
      action.action.setEffectiveWeight(0);
    });
  }

  PlayAnimation(toAction: AvatarAction, delay = true) {
    if (toAction != this.currentAction) {
      if (delay) {
        this.currentAction = toAction;
        this.startChangingAinmation = true;
        this.endChangingAinmation = false;
      } else {
        this.OffAllActions();
        this.currentAction = toAction;
        this.currentAction.action.setEffectiveWeight(1);
      }
    }
  }

  GetActionByName(name: string) {
    for (let i = 0; i < this.allActions.length; i++) {
      if (this.allActions[i].action.getClip().name == name) {
        return this.allActions[i];
      }
    }
    return null;
  }

  PlayAnimationByName(actionName: string, time = 2000, callback: any = null) {
    const action = this.GetActionByName(actionName);
    if (action) {
      this.PlayAnimation(action);
      if (this.horseItem) {
        if (action.name == CLIP_NAMES.H_IDLE) {
          this.horseItem.Idle();
        } else if (action.name == CLIP_NAMES.H_RUN) {
          this.horseItem.Run();
        } else if (action.name == CLIP_NAMES.H_WALK) {
          this.horseItem.Walk();
        } else if (action.name == CLIP_NAMES.H_JUMP) {
          this.horseItem.Jump();
        }
      }
    } else {
      // console.error('Action Name not found!!', actionName);
    }
  }

  ChangeAnimations(fromAction: AvatarAction, toAction: AvatarAction, callback: any) {
    new TWEEN.Tween({ x: 0 })
      .to({ x: 1 }, 2000)
      .onUpdate((value) => {
        fromAction.action.setEffectiveWeight(1 - value.x);
        toAction.action.setEffectiveWeight(value.x);
      })
      .start()
      .onComplete(() => {
        this.currentAction = toAction;
        callback();
      });
  }

  // #endregion

  // #region Transform

  public LookAt(target: THREE.Vector3) {
    this.mainAvatarMesh.LookAt(target);
  }

  public Rotate(newQuat: THREE.Quaternion, time: number = null) {
    this.mainAvatarMesh.Rotate(newQuat, time);
  }

  public SmoothRotate(newQuat: THREE.Quaternion, deltaTime: number) {
    this.mainAvatarMesh.SmoothRotate(newQuat, deltaTime);
  }

  public Move(newPos: THREE.Vector3) {
    if (this.moveTween) {
      this.moveTween.stop();
    }
    this.moveTween = new TWEEN.Tween(this.avatarRoot.position)
      .to({ x: newPos.x, y: newPos.y, z: newPos.z }, UPDATE_TIME)
      .start();
  }

  // --------------- Set ---------------
  public SetPositionV(pos: THREE.Vector3) {
    this.avatarRoot.position.x = pos.x;
    this.avatarRoot.position.y = pos.y;
    this.avatarRoot.position.z = pos.z;
  }

  public SetPosition(x: number, y: number, z: number) {
    this.avatarRoot.position.x = x;
    this.avatarRoot.position.y = y;
    this.avatarRoot.position.z = z;
  }

  public SetQuaternionQ(quat: THREE.Quaternion) {
    this.mainAvatarMesh.SetQuaternionQ(quat);
  }

  public SetQuaternion(x: number, y: number, z: number, w: number) {
    this.mainAvatarMesh.SetQuaternion(x, y, z, w);
  }

  public SetQuatFromAxisAngle(axis: THREE.Vector3, angle: number) {
    this.mainAvatarMesh.SetQuatFromAxisAngle(axis, angle);
  }

  // --------------- Get ---------------
  public GetPosition(): THREE.Vector3 {
    if (this.avatarRoot) {
      return this.avatarRoot.position;
    } else {
      console.log('Position of avatar is Null', this.userName);
      return VECTOR3_ZERO;
    }
  }

  public GetRealPosition(): THREE.Vector3 {
    if (this.avatarRoot) {
      const realPos = this.avatarRoot.position.clone();
      realPos.y += this.mainAvatarMesh.GetPosition().y;
      return this.avatarRoot.position;
    } else {
      console.log('Position of avatar is Null', this.userName);
      return VECTOR3_ZERO;
    }
  }

  public GetQuaternionQ(world = false): THREE.Quaternion {
    return this.mainAvatarMesh.getQuaternion(world);
  }

  public GetQuaternion(): THREE.Vector4 {
    return this.mainAvatarMesh.GetQuaternion();
  }

  public GetCurrentAction(): AvatarAction {
    return this.currentAction;
  }

  public GetCurrentActionName(): string {
    return this.currentAction.name;
  }

  public GetAvatarRoot(): THREE.Object3D {
    return this.avatarRoot;
  }

  public GetAvatarMesh(): AvatarMesh {
    return this.mainAvatarMesh;
  }

  public GetWorldDirection(): THREE.Vector3 {
    return this.mainAvatarMesh.GetWorldDirection();
  }

  // #endregion
  LoadDefaultItems() {
    // load default body item
    ItemsManager.Ins.GetItemMesh(
      ItemsManager.Ins.GetItemByType('models/items/Set1_Body.glb', ITEM_TYPE.BODY),
      (item) => {
        this.ChangeItem(item);
      },
    );
  }

  CalculerValueOfItems() {
    this.jumpHeight = 0;
    this.moveSpeed = 1;
    // hight
    if (this.hatItem) {
      this.jumpHeight += this.hatItem.jumpHeight;
    }
    if (this.maskItem) {
      this.jumpHeight += this.maskItem.jumpHeight;
    }
    if (this.bodyItem) {
      this.jumpHeight += this.bodyItem.jumpHeight;
    }
    if (this.gloveItem) {
      this.jumpHeight += this.gloveItem.jumpHeight;
    }
    if (this.shoeItem) {
      this.jumpHeight += this.shoeItem.jumpHeight;
    }
    if (this.horseItem) {
      this.jumpHeight += this.horseItem.jumpHeight;
    }
    // move speed
    if (this.hatItem) {
      this.moveSpeed += this.hatItem.moveSpeed / 10;
    }
    if (this.maskItem) {
      this.moveSpeed += this.maskItem.moveSpeed / 10;
    }
    if (this.bodyItem) {
      this.moveSpeed += this.bodyItem.moveSpeed / 10;
    }
    if (this.gloveItem) {
      this.moveSpeed += this.gloveItem.moveSpeed / 10;
    }
    if (this.shoeItem) {
      this.moveSpeed += this.shoeItem.moveSpeed / 10;
    }
  }

  public RemoveItem(item: NormalItem) {
    switch (item.type) {
      case ITEM_TYPE.BODY:
        this.LoadDefaultItems();
        break;
      case ITEM_TYPE.GLOVE: {
        this.SetupItem(this.gloveItem, item, true);
        this.gloveItem = undefined;
        break;
      }
      case ITEM_TYPE.HAT:
        this.SetupItem(this.hatItem, item, true);
        this.hatItem = undefined;
        break;
      case ITEM_TYPE.MASK:
        this.SetupItem(this.maskItem, item);
        this.maskItem = undefined;
        break;
      case ITEM_TYPE.SHOE:
        this.SetupItem(this.shoeItem, item, true);
        this.shoeItem = undefined;
        break;
      case ITEM_TYPE.BOW:
        this.SetupItem(this.bowItem, item);
        this.bowItem = undefined;
        break;
      case ITEM_TYPE.HORSE:
        this.RemoveHorse();
        break;
    }
    this.CalculerValueOfItems();
  }

  RemoveHorse() {
    if (this.horseItem) {
      this.horseItem.RemoveFromAvatar();
      this.horseItem = undefined;
      this.avatarText.position.y -= 0.8;
    }
  }

  // #region  Items
  public ChangeItem(item: any) {
    if (!this.GetAvatarMesh() || !this.GetAvatarMesh().sex) {
      setTimeout(() => {
        this.ChangeItem(item);
      }, 500);
      return;
    }
    if (item.sex != 0) {
      if (this.GetAvatarMesh().sex != item.sex) {
        console.error('Gender Mismatch!!');
        return;
      }
    }
    switch (item.type) {
      case ITEM_TYPE.BODY:
        this.SetupItem(this.bodyItem, item);
        this.AddSkinnedItem(item);
        this.bodyItem = item;
        break;
      case ITEM_TYPE.GLOVE: {
        this.SetupItem(this.gloveItem, item);
        this.AddSkinnedItem(item);
        this.gloveItem = item;
        break;
      }
      case ITEM_TYPE.HAT:
        this.SetupItem(this.hatItem, item);
        this.AddMeshItem(item, BONE.TOP_END);

        this.hatItem = item;
        break;
      case ITEM_TYPE.MASK:
        this.SetupItem(this.maskItem, item);
        this.AddMeshItem(item, BONE.HEAD);
        this.maskItem = item;
        break;
      case ITEM_TYPE.SHOE:
        this.SetupItem(this.shoeItem, item);
        this.AddSkinnedItem(item);
        this.shoeItem = item;
        break;
      case ITEM_TYPE.HORSE:
        if (!this.horseItem || (this.horseItem && this.horseItem.id !== item.id)) {
          this.SetupHorse(item);
          this.avatarText.position.y += 0.8;
          this.horseItem = item;
        }
        break;
      case ITEM_TYPE.BOW:
        this.SetupItem(this.bowItem, item);
        this.AddMeshItem(item, BONE.SPINE1, true);
        this.bowItem = item;
        this.BowToHand(true);
        break;
    }
    this.CalculerValueOfItems();
  }

  MakeSideHorse(isSide = false) {
    if (this.horseItem) {
      if (isSide) {
        this.horseItem.MakeSide();
      } else {
        this.horseItem.Reset();
      }
    }
  }

  BowToHand(invert = false) {
    if (invert) {
      this.bowItem.meshes.forEach((mesh) => {
        this.spine1.add(mesh);
        mesh.position.z = -16;
        mesh.position.y = 15;
        mesh.position.x = 5;
        mesh.rotation.z = 0.5;
        mesh.rotation.x = 0;
        mesh.scale.set(100, 100, 100);
      });
    } else {
      this.bowItem.meshes.forEach((mesh) => {
        this.leftHand.add(mesh);
        mesh.position.z = 0;
        mesh.position.y = 10;
        mesh.position.x = 0;
        mesh.rotation.z = Math.PI / 2 - 0.15;
        mesh.rotation.x = -0.1;
      });
    }
  }

  private AddSkinnedItem(newItem: NormalItem) {
    newItem.skinnedMeshes.forEach((mesh) => {
      this.mainAvatarMesh.add(mesh);
      mesh.bind(this.mainAvatarMesh.skeleton, mesh.bindMatrix);
    });
  }

  private AddMeshItem(newItem: NormalItem, boneName: string, followTransform = false) {
    newItem.meshes.forEach((mesh) => {
      this.AddItemToBone(boneName, mesh);
    });
  }

  SetupHorse(newItem: HorseItem) {
    if (this.horseItem) {
      this.horseItem.RemoveFromAvatar();
    }
    this.avatarRoot.add(newItem.mesh);
    newItem.ForceIdle();
  }

  private SetupItem(currentItem: NormalItem, newItem: NormalItem, showDefault = false) {
    this.CheckHideOrigin(currentItem, newItem, showDefault);
    if (currentItem) {
      currentItem.RemoveFromAvatar();
    }
  }

  private CheckHideOrigin(currentItem: NormalItem, newItem: NormalItem, showDefault = false) {
    if (currentItem) {
      if (currentItem.partsHided) {
        const parts = currentItem.partsHided.split(' ');
        parts.forEach((part) => {
          this.mainAvatarMesh.ShowHidePart(part, true);
        });
      }
    }
    if (newItem.partsHided) {
      const parts = newItem.partsHided.split(' ');
      parts.forEach((part) => {
        this.mainAvatarMesh.ShowHidePart(part, showDefault);
      });
    }
  }

  private AddItemToBone(boneName: string, mesh: THREE.Object3D) {
    const bone = this.mainAvatarMesh.getObjectByName(boneName);
    bone.add(mesh);
    ResetTransform(mesh);
  }

  public ChangeBodyMesh(avatarMesh: AvatarMesh, animation = false, extraEffect: THREE.Mesh = null) {
    return new Promise((resolve) => {
      if (animation) {
        if (this.changingAvatarMesh == false) {
          this.changingAvatarMesh = true;
          new TWEEN.Tween({ x: 0 })
            .to({ x: 1 }, 500)
            .onUpdate((value) => {
              this.mainAvatarMesh.avatarMesh.position.y = value.x * -2.2;
              if (extraEffect) extraEffect.morphTargetInfluences[1] = value.x;
            })
            .start()
            .easing(TWEEN.Easing.Elastic.InOut)
            .onComplete(() => {
              this.mainAvatarMesh.BindMeshesToAvatar(avatarMesh);
              this.mainAvatarMesh.sex = avatarMesh.sex;
              this.mainAvatarMesh.id = avatarMesh.id;
              resolve(true);

              new TWEEN.Tween({ x: 1 })
                .to({ x: 0 }, 500)
                .onUpdate((value) => {
                  this.mainAvatarMesh.avatarMesh.position.y = value.x * -2.2;
                  if (extraEffect) extraEffect.morphTargetInfluences[1] = value.x;
                })
                .start()
                .easing(TWEEN.Easing.Elastic.InOut)
                .onComplete(() => {
                  this.changingAvatarMesh = false;
                });
            });
        }
      } else {
        this.mainAvatarMesh.BindMeshesToAvatar(avatarMesh);
        this.mainAvatarMesh.sex = avatarMesh.sex;
        this.mainAvatarMesh.id = avatarMesh.id;
        resolve(true);
      }
    });
  }

  // #endregion

  public Hide() {
    this.mainAvatarMesh.ShowMesh(false);
    this.HideText(false);
  }

  public HideText(isShow = true) {
    if (this.avatarText) {
      this.avatarText.visible = isShow;
    }
  }

  public ShowMesh() {
    this.mainAvatarMesh.ShowMesh(true);
  }

  public Add(object: THREE.Object3D) {
    this.avatarRoot.add(object);
  }

  public Remove() {
    const meshes = [];
    const avatarParent = this.avatarRoot.parent;
    this.avatarRoot.traverse((child) => {
      if (child.type == 'Mesh' || child.type == 'SkinnedMesh') {
        meshes.push(child);
      }
    });
    while (meshes.length > 0) {
      meshes[0].geometry.dispose();
      meshes.shift();
    }
    avatarParent.remove(this.avatarRoot);
  }

  protected ActiveAnimation(deltaTime: number) {
    this.currentAction.action.setEffectiveWeight(
      this.currentAction.action.getEffectiveWeight() + 10 * deltaTime,
    );
    if (this.currentAction.action.getEffectiveWeight() > 1) {
      this.currentAction.action.setEffectiveWeight(1);
      this.startChangingAinmation = false;
      this.endChangingAinmation = true;
    }
  }

  protected DeactiveAnimation(deltaTime: number) {
    let count = 0;
    for (let i = 0; i < this.allActions.length; i++) {
      if (this.allActions[i].name != this.currentAction.name) {
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
    if (this.horseItem) this.horseItem.Update(deltaTime);
    if (this.startChangingAinmation) {
      this.ActiveAnimation(deltaTime);
    }
    if (this.endChangingAinmation) {
      this.DeactiveAnimation(deltaTime);
    }
  }

  public Update(deltaTime: number, target = null) {
    const dir = new THREE.Vector3();
    this.dummyShootHelper.getWorldDirection(dir);
    this.arrowShootHelper.setDirection(dir);
    this.dummyShootHelper.getWorldPosition(this.arrowShootHelper.position);
    if (this.horseItem) {
      this.horseItem.mesh.quaternion.copy(this.mainAvatarMesh.getQuaternion());
    }
    this.UpdateAnimation(deltaTime);
  }
}
