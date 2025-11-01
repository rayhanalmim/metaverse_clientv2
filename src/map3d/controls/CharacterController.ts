import * as THREE from 'three';
import MainAvatar from '../avatars/MainAvatar';
import { Pathfinding } from 'three-pathfinding';
import Env from '../Init3d';
import { Vector3 } from 'three';
import PopupManager from '../managers/PopupManagers';
import {
  ACTIONS_DEFINE,
  ITEM_TYPE,
  JUMP_TYPE,
  POPUP,
  RAYLAYER,
  SCENE_NAME,
  SHOOT_TYPE,
  VEC3_DIR,
} from 'src/constant/constant';
import TWEEN from '@tweenjs/tween.js';
import Settings3D from 'src/utils/Settings3D';
import PhysicWorld from '../physic/PhysicWorld';
import { JoyStick } from './joy';
import ItemsManager from '../items/ItemsManager';
import Arrow from '../avatars/Arrow';
import NormalItem from '../items/normalItem';
import App3D from '../App3D';
import jumpIcon from 'src/assets/images/icons/jump-icon.svg';

export default class CharacterController {
  isActive: boolean;
  camera: THREE.PerspectiveCamera;
  element: HTMLElement;
  avatar: MainAvatar;
  avatarDummy: THREE.AxesHelper;
  velocity: THREE.Vector3;
  direction: THREE.Vector3;
  cameraDirection: THREE.Vector3;
  cameraDirectionRight: THREE.Vector3;

  raycaster: THREE.Raycaster;
  raycasterLENGTH = 4000;

  groundRaycaster: THREE.Raycaster;
  groundraycasterLENGTH = 100;

  colliderMidRaycaster: THREE.Raycaster;
  colliderMidRaycasterLENGTH = 0.3;

  colliderTopRaycaster: THREE.Raycaster;
  colliderTopRaycasterLENGTH = 0.7;

  colliderAboveRaycaster: THREE.Raycaster;
  colliderAboveRaycasterLENGTH = 0.4;

  cameraRaycaster: THREE.Raycaster;
  cameraRaycasterLenght = 1.0;

  objects: THREE.Object3D[];
  navMesh: THREE.Mesh;
  navWireframe: THREE.Mesh;
  prevTime: number;
  cameraRoot: THREE.Object3D;
  lookTarget: THREE.Vector3;
  cameraUp: THREE.Vector3;
  physicWorld: PhysicWorld;

  playerPosition: THREE.Vector3;
  targetPosition: THREE.Vector3;
  pathfinder: Pathfinding;
  zone: any;
  // helper: PathfindingHelper;
  mouse: THREE.Vector2;
  mouseDown: THREE.Vector2;
  tempMouseDown: THREE.Vector2;
  previousTouch: any;
  tempEuler: THREE.Euler;

  CAMERA_HEIGHT: number;
  CAMERA_HORSE_HEIGHT: number;
  CAMERA_FAR: number;
  MOVEMENT_SPEED: number;
  MOVEMENT_SHIFT_SPEED: number;
  SHIFT_SPEED = 3.5;
  MOVEMENT_TEST_SPEED: number;
  HORSE_SPEED = 1.5;
  MOVEMENT_HORSE_SPEED: number;
  ROTATION_SPEED: number;
  minPolarAngle: number;
  maxPolarAngle: number;
  JUMP_HEIGHT = 7;

  moveForward: boolean;
  moveBackward: boolean;
  moveLeft: boolean;
  moveRight: boolean;
  canJump: boolean;
  canShoot: boolean;
  moving: boolean;

  mousedowned: boolean;

  cameraDummy: THREE.AxesHelper;
  cameraDummyWorldPos: THREE.Vector3;
  cameraDummyWorldQuat: THREE.Quaternion;

  ZONE: string;
  groupID: any;
  path: any;
  clamped: THREE.Vector3;

  stopLeft = false;
  stopRight = false;
  stopBack = false;
  colliderIntersects: any[] = [];
  groundIntersects: any[] = [];
  aboveIntersects: any[] = [];
  intersects: any[] = [];

  joyStickMove: any;
  // debug
  // clampeObjectDebug: THREE.AxesHelper;
  // snapObjectDebug: THREE.AxesHelper;
  // debugRayOri = new THREE.AxesHelper(3);

  // debugPriPos: THREE.Mesh;
  // debugNextPos: THREE.Mesh;
  // debugRayPos: THREE.Mesh;
  // debugclamdPos: THREE.Mesh;

  // debugMoveRayTop: THREE.ArrowHelper;
  // debugMoveRayAbove: THREE.ArrowHelper;
  // debugMoveRayMid: THREE.ArrowHelper;
  // debugMoveRayGround: THREE.ArrowHelper;

  // debugCameraRaycast: THREE.ArrowHelper;
  // debugVelocity: THREE.ArrowHelper;

  constructor(
    camera: THREE.PerspectiveCamera,
    avatar: MainAvatar,
    navMesh: THREE.Mesh,
    element: HTMLElement,
    physicWorld: PhysicWorld,
  ) {
    this.isActive = true;
    this.mousedowned = false;
    this.CAMERA_HORSE_HEIGHT = 0.4;
    if (Settings3D.Ins.IsMobile) {
      this.CAMERA_FAR = -3.5;
      this.CAMERA_HEIGHT = 2.5;

      // joystick for move
      this.joyStickMove = JoyStick('joyDivMove', {}, (stickData) => {
        // move left right
        if (stickData.x > 30) {
          this.moveRight = true;
          this.moveLeft = false;
        } else if (stickData.x < -30) {
          this.moveLeft = true;
          this.moveRight = false;
        } else {
          this.moveLeft = false;
          this.moveRight = false;
        }
        // move back forward
        if (stickData.y > 30) {
          this.moveForward = true;
          this.moveBackward = false;
        } else if (stickData.y < -30) {
          this.moveBackward = true;
          this.moveForward = false;
        } else {
          this.moveBackward = false;
          this.moveForward = false;
        }
        if (stickData.y > 70 || stickData.y < -70 || stickData.x > 70 || stickData.x < -70) {
          this.MOVEMENT_SHIFT_SPEED = this.SHIFT_SPEED;
        } else {
          this.MOVEMENT_SHIFT_SPEED = 1;
        }
      });

      const jumpButton = document.createElement('button');
      const img = `<img src='${jumpIcon}' alt="jump img">`;
      document.body.appendChild(jumpButton);
      jumpButton.innerHTML = img;
      jumpButton.className = 'btn-jump';
      jumpButton.addEventListener('click', () => {
        this.Jump();
      });
    } else {
      this.CAMERA_FAR = -2;
      this.CAMERA_HEIGHT = 1.8;
    }
    this.MOVEMENT_SPEED = 20;
    this.MOVEMENT_SHIFT_SPEED = 1;
    this.MOVEMENT_HORSE_SPEED = 1;
    this.MOVEMENT_TEST_SPEED = 1;
    this.ROTATION_SPEED = 0.01;
    this.maxPolarAngle = Math.PI - Math.PI / 2.5;
    this.minPolarAngle = Math.PI / 4;
    this.camera = camera;
    this.physicWorld = physicWorld;
    this.element = element;
    this.avatar = avatar;
    this.avatar.Idle();
    this.avatarDummy = new THREE.AxesHelper(2);
    this.avatarDummy.name = 'Avatar Dummy';
    this.avatarDummy.visible = false;
    this.navMesh = navMesh;

    this.cameraRoot = new THREE.Object3D();
    this.cameraRoot.name = 'Camera Root';
    this.cameraRoot.position.y = this.CAMERA_HEIGHT;

    this.cameraDummy = new THREE.AxesHelper();
    this.cameraDummy.name = 'Camera Dummy';
    this.cameraDummy.visible = false;

    this.lookTarget = new THREE.Vector3();
    this.tempEuler = new THREE.Euler(0, 0, 0, 'YXZ');
    this.cameraUp = new THREE.Vector3(0, 1, 0);

    this.pathfinder = new Pathfinding();

    // debug
    // this.helper = new PathfindingHelper();
    // this.helper.name = 'Path Helper';
    // this.scene.add(this.helper);
    // this.scene.add(this.navMesh);

    // this.debugMoveRayTop = new THREE.ArrowHelper();
    // this.debugMoveRayTop.name = 'debugMoveRayTop';
    // this.debugMoveRayTop.setLength(this.colliderTopRaycasterLENGTH);
    // this.debugMoveRayTop.setColor(0xffffff);
    // this.debugMoveRayMid = new THREE.ArrowHelper();
    // this.debugMoveRayMid.name = 'debugMoveRayMide';
    // this.debugMoveRayMid.setLength(this.colliderMidRaycasterLENGTH);

    // this.debugMoveRayAbove = new THREE.ArrowHelper();
    // this.debugMoveRayAbove.name = 'debugMoveRayTop';
    // this.debugMoveRayAbove.setLength(this.colliderAboveRaycasterLENGTH);
    // this.debugMoveRayAbove.setColor(0xffffff);

    // this.debugMoveRayGround = new THREE.ArrowHelper();
    // this.debugMoveRayGround.name = 'debugMoveRayGround';
    // this.debugMoveRayGround.setLength(this.raycasterLENGTH);

    // this.debugMoveRayAbove = new THREE.ArrowHelper();
    // this.debugMoveRayAbove.name = 'debugMoveRayAbove';
    // this.debugMoveRayAbove.setLength(this.colliderAboveRaycasterLENGTH);

    // this.debugCameraRaycast = new THREE.ArrowHelper();
    // this.debugCameraRaycast.name = 'debugCameraRay';
    // this.debugCameraRaycast.setLength(this.cameraRaycasterLenght);

    // this.debugVelocity = new THREE.ArrowHelper();
    // this.debugVelocity.name = 'debugCameraRay';
    // this.debugVelocity.setLength(5);

    // Env.Ins.scenesManager.GetActiveScene().scene.add(this.debugMoveRayTop);
    // Env.Ins.scenesManager.GetActiveScene().scene.add(this.debugMoveRayAbove);
    // Env.Ins.scenesManager.GetActiveScene().scene.add(this.debugMoveRayMid);
    // Env.Ins.scenesManager.GetActiveScene().scene.add(this.debugMoveRayGround);
    // Env.Ins.scenesManager.GetActiveScene().scene.add(this.debugCameraRaycast);
    // Env.Ins.scenesManager.GetActiveScene().scene.add(this.debugVelocity);

    this.playerPosition = new THREE.Vector3();
    this.targetPosition = new THREE.Vector3();
    this.mouse = new THREE.Vector2();
    this.mouseDown = new THREE.Vector2();
    this.tempMouseDown = new THREE.Vector2();

    this.moveForward = false;
    this.moveBackward = false;
    this.moveLeft = false;
    this.moveRight = false;
    this.canJump = true;
    this.canShoot = true;
    this.velocity = new THREE.Vector3(1, 0, 1);
    this.direction = new THREE.Vector3();
    this.cameraDirection = new THREE.Vector3();
    this.cameraDirectionRight = new THREE.Vector3();
    this.cameraDummyWorldPos = new THREE.Vector3();
    this.cameraDummyWorldQuat = new THREE.Quaternion();
    this.moving = false;

    this.ZONE = 'Main';
    this.clamped = new THREE.Vector3();

    this.raycaster = new THREE.Raycaster(
      new THREE.Vector3(),
      new THREE.Vector3(0, -1, 0),
      0,
      this.raycasterLENGTH,
    );
    this.groundRaycaster = new THREE.Raycaster(
      new THREE.Vector3(),
      new THREE.Vector3(0, -1, 0),
      0,
      this.groundraycasterLENGTH,
    );
    this.colliderMidRaycaster = new THREE.Raycaster(
      new THREE.Vector3(),
      new THREE.Vector3(0, -1, 0),
      0,
      this.colliderMidRaycasterLENGTH,
    );
    this.colliderTopRaycaster = new THREE.Raycaster(
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, -1, 0),
      0,
      this.colliderTopRaycasterLENGTH,
    );
    // this.colliderTopRaycaster.layers.set(RAYLAYER.BUILDING);

    this.colliderAboveRaycaster = new THREE.Raycaster(
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, -1, 0),
      0,
      this.colliderAboveRaycasterLENGTH,
    );
    // this.colliderAboveRaycaster.layers.set(RAYLAYER.BUILDING);

    this.cameraRaycaster = new THREE.Raycaster();
    this.cameraRaycaster.far = Math.abs(this.CAMERA_FAR);

    // this.clampeObjectDebug = new THREE.AxesHelper();
    // this.snapObjectDebug = new THREE.AxesHelper();
    // this.snapObjectDebug.setColors(
    //   new THREE.Color(0xffffff),
    //   new THREE.Color(0xffffff),
    //   new THREE.Color(0xffffff),
    // );
    // Env.Ins.scenesManager.GetActiveScene().scene.add(this.clampeObjectDebug);
    // Env.Ins.scenesManager.GetActiveScene().scene.add(this.snapObjectDebug);

    // this.debugPriPos = new THREE.Mesh(
    //   new THREE.BoxGeometry(0.1, 0.1, 0.1),
    //   new THREE.MeshBasicMaterial({ color: 0xff0000 }),
    // );
    // this.debugNextPos = new THREE.Mesh(
    //   new THREE.BoxGeometry(0.1, 0.1, 0.1),
    //   new THREE.MeshBasicMaterial({ color: 0x00ff00 }),
    // );
    // this.debugRayPos = new THREE.Mesh(
    //   new THREE.BoxGeometry(0.1, 0.1, 0.1),
    //   new THREE.MeshBasicMaterial({ color: 0x0000ff }),
    // );
    // this.debugclamdPos = new THREE.Mesh(
    //   new THREE.ConeGeometry(0.1),
    //   new THREE.MeshBasicMaterial({ color: 0x00ffff }),
    // );
    // this.physicWorld.colliderParent.add(this.debugPriPos);
    // this.physicWorld.colliderParent.add(this.debugNextPos);
    // Env.Ins.scenesManager.GetActiveScene().scene.add(this.debugRayPos);
    // this.physicWorld.colliderParent.add(this.debugclamdPos);

    this.InitControl();
  }

  InitControl() {
    this.SetupMode();
    this.zone = Pathfinding.createZone(this.navMesh.geometry);
    this.pathfinder.setZoneData(this.ZONE, this.zone);

    // Set the player's navigation mesh group
    this.groupID = this.pathfinder.getGroup(this.ZONE, this.playerPosition);

    // this.helper
    //   .setPlayerPosition(new THREE.Vector3(-3.5, 0.5, 5.5))
    //   .setTargetPosition(new THREE.Vector3(-3.5, 0.5, 5.5));

    this.InitMouseEvent();
    this.InitKeyboardEvent();
    this.UpdateMoveControl(0.001);
  }

  SetupMode(isTPS = true) {
    this.cameraRoot.attach(this.cameraDummy);
    this.avatar.Add(this.cameraRoot);
    this.avatar.Add(this.avatarDummy);
    this.cameraDummy.rotation.y = Math.PI;
    this.cameraDummy.rotation.x = 0;
    this.cameraDummy.rotation.z = 0;

    if (isTPS) {
      new TWEEN.Tween(this.cameraDummy.position)
        .to({ x: 0, y: 0, z: this.CAMERA_FAR }, 500)
        .start()
        .easing(TWEEN.Easing.Cubic.InOut);
      this.maxPolarAngle = Math.PI - Math.PI / 2.5;
      this.minPolarAngle = Math.PI / 4;
      this.avatar.ShowMesh();
    } else {
      new TWEEN.Tween(this.cameraDummy.position)
        .to({ x: 0, y: 0.6, z: 0 }, 500)
        .start()
        .easing(TWEEN.Easing.Cubic.InOut);
      this.minPolarAngle = 0;
      this.maxPolarAngle = Math.PI;
      this.avatar.Hide();
    }
  }

  ChangePhysicWorld(physicWorld: PhysicWorld) {
    this.physicWorld = physicWorld;
    this.navMesh = physicWorld.navMesh;
    this.zone = Pathfinding.createZone(this.navMesh.geometry);
    this.pathfinder.setZoneData(this.ZONE, this.zone);
  }

  InitMouseEvent() {
    document.addEventListener(
      Settings3D.Ins.IsMobile ? 'touchstart' : 'pointerdown',
      (event) => {
        if (
          (event.target as HTMLElement).id !=
          Env.Ins.scenesManager.GetActiveScene().renderer.domElement.id
        )
          return;
        if (this.isActive == false) return;
        this.onDocumentPointerDown(event);
      },
      false,
    );
    document.addEventListener(
      Settings3D.Ins.IsMobile ? 'touchend' : 'pointerup',
      (event) => {
        if (document.pointerLockElement === document.body && this.hasShoot()) {
          this.onDocumentPointerUp(event);
        }
        if (
          (event.target as HTMLElement).id !=
          Env.Ins.scenesManager.GetActiveScene().renderer.domElement.id
        )
          return;
        if (this.isActive == false) return;
        this.onDocumentPointerUp(event);
      },
      false,
    );
    document.addEventListener(
      Settings3D.Ins.IsMobile ? 'touchmove' : 'pointermove',
      (event) => {
        if (
          (event.target as HTMLElement).id !=
          Env.Ins.scenesManager.GetActiveScene().renderer.domElement.id &&
          document.pointerLockElement !== document.body
        )
          return;
        if (this.isActive == false) return;
        this.onDocumentPointerMove(event);
      },
      false,
    );
  }

  hasShoot() {
    return (
      this.canShoot &&
      this.avatar.HasBow() &&
      Env.Ins.scenesManager.GetActiveScene().name == SCENE_NAME.MAIN
    );
  }

  getAxisAndAngelFromQuaternion(q: THREE.Quaternion) {
    const angle = 2 * Math.acos(q.w);
    let s: number;
    if (1 - q.w * q.w < 0.000001) {
      s = 1;
    } else {
      s = Math.sqrt(1 - q.w * q.w);
    }
    return { axis: new Vector3(q.x / s, q.y / s, q.z / s), angle };
  }

  trueAxisAngle(axis: string, quaternion: THREE.Quaternion) {
    const direction = new THREE.Vector3(0, 0, 1);
    const origin = new THREE.Vector3(0, 0, 1);
    if (axis == 'z') {
      direction.set(1, 0, 0);
      origin.set(1, 0, 0);
    }
    direction.applyQuaternion(quaternion);

    direction.x = axis == 'x' ? 0 : direction.x;
    direction.y = axis == 'y' ? 0 : direction.y;
    direction.z = axis == 'z' ? 0 : direction.z;

    direction.normalize();

    let angle = origin.angleTo(direction);

    if (axis == 'x' && direction.y > 0) angle = THREE.MathUtils.degToRad(360) - angle;
    if (axis == 'y' && direction.x < 0) angle = THREE.MathUtils.degToRad(360) - angle;
    if (axis == 'z' && direction.y < 0) angle = THREE.MathUtils.degToRad(360) - angle;

    return (angle * 180) / Math.PI;
  }

  onDocumentPointerMove(event) {
    if (this.mousedowned || document.pointerLockElement === document.body) {
      if (document.pointerLockElement === document.body) this.mousedowned = false;

      let touch, movementX, movementY;

      if (event.type == 'touchmove') {
        touch = event.touches[0];
        if (this.previousTouch) {
          movementX = touch.pageX - this.previousTouch.pageX;
          movementY = touch.pageY - this.previousTouch.pageY;
        }
        this.previousTouch = touch;
      } else {
        movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
        movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;
      }
      if (movementX != null && movementY != null) {
        this.tempEuler.setFromQuaternion(this.cameraRoot.quaternion);

        let changeX = movementX * 0.002 * 1;
        if (this.stopRight && changeX < 0) {
          changeX = 0;
        }
        if (this.stopLeft && changeX > 0) {
          changeX = 0;
        }
        this.tempEuler.y -= changeX;
        this.tempEuler.x += movementY * 0.002 * 1;
        this.tempEuler.x = Math.max(
          Math.PI / 2 - this.maxPolarAngle,
          Math.min(Math.PI / 2 - this.minPolarAngle, this.tempEuler.x),
        );
        this.cameraRoot.quaternion.setFromEuler(this.tempEuler);
      }
    }
  }

  onDocumentPointerDown(event) {
    this.mouseDown.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouseDown.y = -(event.clientY / window.innerHeight) * 2 + 1;
    this.mousedowned = true;
  }

  onDocumentPointerUp(event) {
    this.mousedowned = false;
    this.previousTouch = null;
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    if (document.pointerLockElement === document.body) {
      this.Shoot();
      return;
    }
    if (
      Math.abs(this.mouseDown.x - this.mouse.x) > 0 ||
      Math.abs(this.mouseDown.y - this.mouse.y) > 0
    ) {
      return;
    }
    // if (Settings3D.Ins.IsMobile) {
    //   this.CreatePath(event);
    // }
    this.Shoot();
  }

  // CheckAngle(): number {
  //   let avatarDir = new THREE.Vector3();
  //   const cameraDir = new THREE.Vector3();
  //   this.camera.getWorldDirection(cameraDir);
  //   avatarDir = this.avatar.GetWorldDirection();
  //   return cameraDir.angleTo(avatarDir);
  // }

  Shoot() {
    if (
      this.canShoot &&
      this.avatar.HasBow() &&
      Env.Ins.scenesManager.GetActiveScene().name == SCENE_NAME.MAIN
    ) {
      let arrow: Arrow;
      this.canShoot = false;
      this.avatar.Shoot(
        () => {
          arrow = Env.Ins.scenesManager
            .GetActiveScene()
            .arrows.CreateNewArrow(this.avatar, this.camera);
        },
        () => {
          if (Env.Ins.scenesManager.GetActiveScene().arrows) {
            Env.Ins.scenesManager.GetActiveScene().arrows.ForceArrow(arrow);
          }
        },
        () => {
          this.canShoot = true;
          while (this.avatar.bowItem.meshes[0].children.length > 0) {
            this.avatar.bowItem.meshes[0].remove(this.avatar.bowItem.meshes[0].children[0]);
          }
          console.log('can shoot!!!');
        },
      );
    }
  }

  public GetVelocity(): THREE.Vector3 {
    return this.velocity;
  }

  private RaycastFromCamera(event, target: THREE.Object3D) {
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    this.camera.updateMatrixWorld();
    this.raycaster.setFromCamera(this.mouse, this.camera);
    this.intersects = this.raycaster.intersectObject(target, true);
  }

  private RaycastFromCameraArray(event, target: any[]) {
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    this.camera.updateMatrixWorld();
    this.raycaster.setFromCamera(this.mouse, this.camera);
    this.intersects = this.raycaster.intersectObjects(target, true);
  }

  // ray with all collider
  public GetIntersects(event: any) {
    this.RaycastFromCamera(event, this.physicWorld.colliderParent);
    return this.intersects;
  }

  // ray with only NAV Mesh
  public GetIntersectsNav(event: any) {
    this.RaycastFromCamera(event, this.physicWorld.navMesh);
    return this.intersects;
  }

  // ray with only NAV Mesh and props
  public GetIntersectsNavAEnv(event: any) {
    this.RaycastFromCameraArray(event, [
      this.physicWorld.navMesh,
      this.physicWorld.envColliderParent,
    ]);
    return this.intersects;
  }

  // ray with only environment props
  public GetIntersectsEnv(event: any) {
    this.RaycastFromCamera(event, this.physicWorld.envColliderParent);
    return this.intersects;
  }

  // ray with only interactive suff
  public GetIntersectsInteractableObjects(event: any) {
    this.RaycastFromCamera(event, this.physicWorld.interactableColliderParent);
    if (this.intersects.length > 0) {
      return this.intersects[0];
    } else return null;
  }

  // ray with only interactive suff
  public GetIntersectsAllInteractableObjects(event: any) {
    this.RaycastFromCameraArray(event, [
      this.physicWorld.interactableColliderParent,
      this.physicWorld.envColliderParent,
    ]);
    if (this.intersects.length > 0) {
      for (let i = 0; i < this.intersects.length; i++) {
        if (this.intersects[i].object.userData.active !=null && this.intersects[i].object.userData.active == false) {
          continue;
        }
        return this.intersects[i];
      };
    } else return null;
  }

  InitKeyboardEvent() {
    const onKeyDown = (event) => {
      if (this.isActive == false) return;
      switch (event.code) {
        case 'ArrowUp':
        case 'KeyW':
          this.moveForward = true;
          break;

        case 'ArrowLeft':
        case 'KeyA':
          this.moveLeft = true;
          break;

        case 'ArrowDown':
        case 'KeyS':
          this.moveBackward = true;
          break;

        case 'ArrowRight':
        case 'KeyD':
          this.moveRight = true;
          break;

        case 'Space':
          this.Jump();
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          this.MOVEMENT_SHIFT_SPEED = this.SHIFT_SPEED;
          break;
        // case 'Space':
        //   this.MOVEMENT_TEST_SPEED = 15;
        //   break;
      }
    };
    const onKeyUp = (event) => {
      if (this.isActive == false) return;
      switch (event.code) {
        case 'ArrowUp':
        case 'KeyW':
          this.moveForward = false;
          break;

        case 'ArrowLeft':
        case 'KeyA':
          this.moveLeft = false;
          break;

        case 'ArrowDown':
        case 'KeyS':
          this.moveBackward = false;
          break;

        case 'ArrowRight':
        case 'KeyD':
          this.moveRight = false;
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          this.MOVEMENT_SHIFT_SPEED = 1;
          break;
        case 'Space':
          this.MOVEMENT_TEST_SPEED = 1;
          break;
        case 'KeyI':
          PopupManager.Ins.ShowHidePopup(POPUP.INVENTORY);
          break;
        case 'KeyF':
          Env.Ins.scenesManager.FullScreenMode();
          break;
        // case 'KeyC':
        //   if (this.canJump && Env.Ins.scenesManager.GetActiveScene().name == SCENE_NAME.MAIN) {
        //     this.AddHorse();
        //   }
        //   break;
        // case 'KeyR':
        //   if (this.avatar.HasBow()) {
        //     this.avatar.RemoveItem(this.avatar.bowItem);
        //   } else {
        //     ItemsManager.Ins.GetItemMesh(ItemsManager.Ins.GetItemById(20), (item) => {
        //       this.avatar.ChangeItem(item);
        //     });
        //   }
        //   break;
      }
    };
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
  }

  AddHorse() {
    if (this.avatar.IsRide()) {
      this.RemoveHorse();
    } else {
      ItemsManager.Ins.GetItemMesh(ItemsManager.Ins.GetItemById(18), (item) => {
        this.avatar.ChangeItem(item);
        this.cameraRoot.position.y += this.CAMERA_HORSE_HEIGHT;
      });
    }
  }

  RemoveHorse() {
    if (this.avatar.IsRide()) {
      this.avatar.RemoveItem(this.avatar.horseItem as unknown as NormalItem);
      this.cameraRoot.position.y -= this.CAMERA_HORSE_HEIGHT;
    }
  }

  Jump() {
    if (this.canJump === true) {
      App3D.Ins.EmitJump(JUMP_TYPE.START);
      this.velocity.y += this.JUMP_HEIGHT + this.avatar.jumpHeight;
      this.avatar.Jump();
    }
    this.canJump = false;
  }

  UpdateControl(deltaTime: number) {
    if (this.isActive == false) return;
    this.UpdateMoveControl(deltaTime);
  }

  SetAvatarDir(dir: THREE.Vector3) {
    if (dir.y > 0.99999) {
      this.avatar.SetQuaternion(0, 0, 0, 1);
    } else if (dir.y < -0.99999) {
      this.avatar.SetQuaternion(1, 0, 0, 0);
    } else {
      const _axis = new THREE.Vector3();
      _axis.set(dir.z, 0, -dir.x).normalize();

      const radians = Math.acos(dir.y);

      this.avatar.SetQuatFromAxisAngle(_axis, radians);
    }
  }

  CheckCollider() {
    this.avatar.head.getWorldPosition(this.colliderTopRaycaster.ray.origin);
    if (Settings3D.Ins.IsMobile) {
      this.avatarDummy.getWorldDirection(this.colliderTopRaycaster.ray.direction);
    } else {
      this.colliderTopRaycaster.ray.direction = this.avatar.GetWorldDirection();
    }
    // this.debugMoveRayTop.position.copy(this.colliderTopRaycaster.ray.origin);
    // this.debugMoveRayTop.setDirection(this.colliderTopRaycaster.ray.direction);

    this.colliderIntersects = this.colliderTopRaycaster.intersectObjects(
      [this.physicWorld.envColliderParent, this.physicWorld.interactableColliderParent],
      true,
    );
    if (this.colliderIntersects.length <= 0) {
      this.colliderMidRaycaster.ray.origin = this.avatar.GetRealPosition().clone();
      this.colliderMidRaycaster.ray.origin.y += 0.4;
      this.colliderMidRaycaster.ray.direction = this.colliderTopRaycaster.ray.direction;
      // this.debugMoveRayMid.position.copy(this.colliderMidRaycaster.ray.origin);
      // this.debugMoveRayMid.setDirection(this.colliderMidRaycaster.ray.direction);
      this.colliderIntersects = this.colliderMidRaycaster.intersectObject(
        this.physicWorld.envColliderParent,
        true,
      );
    }
  }

  CheckAboveCollider() {
    this.avatar.head.getWorldPosition(this.colliderAboveRaycaster.ray.origin);
    this.colliderAboveRaycaster.ray.direction = VEC3_DIR.UP;

    // this.debugMoveRayAbove.position.copy(this.colliderAboveRaycaster.ray.origin);
    // this.debugMoveRayAbove.setDirection(this.colliderAboveRaycaster.ray.direction);

    this.aboveIntersects = this.colliderAboveRaycaster.intersectObject(
      this.physicWorld.envColliderParent,
      true,
    );
  }

  CheckGround(nexPos: THREE.Vector3) {
    this.groundRaycaster.ray.origin.x = nexPos.x;
    this.groundRaycaster.ray.origin.y = nexPos.y + 0.3;
    this.groundRaycaster.ray.origin.z = nexPos.z;
    this.groundRaycaster.ray.direction = VEC3_DIR.DOWN;
    this.groundIntersects = this.groundRaycaster.intersectObjects(
      [this.physicWorld.navMesh, this.physicWorld.envColliderParent],
      true,
    );

    // if (this.groundIntersects.length > 0)
    // this.debugRayPos.position.set(
    //   this.groundIntersects[0].point.x,
    //   this.groundIntersects[0].point.y,
    //   this.groundIntersects[0].point.z,
    // );
    // this.debugMoveRayGround.position.copy(this.groundRaycaster.ray.origin);
    // this.debugMoveRayGround.setDirection(this.groundRaycaster.ray.direction);

    if (this.groundIntersects.length > 0) {
      return { finalPos: this.groundIntersects[0].point, grounded: true };
    } else {
      return { finalPos: nexPos, grounded: false };
    }
  }

  MoveForward(distance: number) {
    this.cameraDirection.setFromMatrixColumn(this.cameraDummy.matrixWorld, 0);
    this.cameraDirection.crossVectors(this.cameraDummy.up, this.cameraDirection);
    this.cameraDirection.y = 0;
    if (this.moveBackward && this.stopBack) {
      this.cameraDirection.x = 0;
    }
    if (this.colliderIntersects.length == 0) {
      this.avatar.GetPosition().addScaledVector(this.cameraDirection, distance);
    }
  }

  MoveRight(distance: number, blocked = false) {
    this.cameraDirectionRight.setFromMatrixColumn(this.cameraDummy.matrixWorld, 0);
    this.cameraDirectionRight.y = 0;
    if (this.colliderIntersects.length == 0) {
      this.avatar.GetPosition().addScaledVector(this.cameraDirectionRight, distance);
    }
  }

  UpdateCamera(deltaTime: number) {
    this.cameraDummy.getWorldPosition(this.cameraDummyWorldPos);
    this.cameraDummy.getWorldQuaternion(this.cameraDummyWorldQuat);
    this.camera.position.lerp(this.cameraDummyWorldPos, 0.5);
    this.camera.quaternion.slerp(this.cameraDummyWorldQuat, 0.5);
    this.cameraRaycaster.ray.origin = this.cameraDummyWorldPos;
    this.cameraDummy.getWorldDirection(this.cameraRaycaster.ray.direction);
    this.cameraRaycaster.ray.origin.addScaledVector(
      this.cameraRaycaster.ray.direction,
      this.CAMERA_FAR,
    );
    // this.camera.getWorldPosition(this.debugCameraRaycast.position);
    // this.debugCameraRaycast.setDirection(this.cameraRaycaster.ray.direction);
    const co = this.cameraRaycaster.intersectObject(this.physicWorld.colliderParent, true);
    if (co.length > 0) {
      this.camera.position.set(co[0].point.x, this.camera.position.y, co[0].point.z);
      this.camera.position.addScaledVector(this.cameraRaycaster.ray.direction, -0.7);
    }
  }

  UpdateMoveControl(deltaTime: number) {
    if (this.avatar.IsRide()) this.MOVEMENT_HORSE_SPEED = this.HORSE_SPEED;
    else this.MOVEMENT_HORSE_SPEED = 1;

    this.velocity.x -= this.velocity.x * 10.0 * deltaTime;
    this.velocity.z -= this.velocity.z * 10.0 * deltaTime;

    this.velocity.y -= 20 * deltaTime; // 100.0 = mass
    this.CheckAboveCollider();
    if (this.aboveIntersects.length > 0 && this.velocity.y > 0) {
      this.velocity.y = 0;
    }
    this.direction.z = Number(this.moveForward) - Number(this.moveBackward);
    this.direction.x = Number(this.moveRight) - Number(this.moveLeft);
    this.direction.normalize();

    if (this.moveForward || this.moveBackward) {
      this.velocity.z -=
        this.direction.z *
        this.MOVEMENT_SPEED *
        this.MOVEMENT_SHIFT_SPEED *
        this.MOVEMENT_TEST_SPEED *
        this.MOVEMENT_HORSE_SPEED *
        this.avatar.moveSpeed *
        deltaTime;
    } else {
      this.velocity.z = 0;
    }

    if (this.moveLeft || this.moveRight) {
      this.velocity.x -=
        this.direction.x *
        this.MOVEMENT_SPEED *
        this.MOVEMENT_SHIFT_SPEED *
        this.MOVEMENT_TEST_SPEED *
        this.MOVEMENT_HORSE_SPEED *
        this.avatar.moveSpeed *
        deltaTime;
    } else {
      this.velocity.x = 0;
    }
    const priviousPos = this.avatar.GetPosition().clone();
    this.CheckCollider();

    if (this.colliderIntersects.length > 0) {
      this.avatar
        .GetPosition()
        .addScaledVector(this.colliderTopRaycaster.ray.direction.negate(), 0.01);
    }

    this.MoveForward(THREE.MathUtils.clamp(-this.velocity.z * deltaTime, -1, 1));
    this.MoveRight(THREE.MathUtils.clamp(-this.velocity.x * deltaTime, -1, 1));

    // avatar rotation
    if (this.moveForward || this.moveBackward || this.moveLeft || this.moveRight) {
      this.lookTarget.copy(this.avatar.GetPosition());
      if (this.moveForward || this.moveBackward) {
        this.lookTarget.addScaledVector(
          this.cameraDirection.normalize(),
          -this.velocity.z * deltaTime,
        );
      }
      if (this.moveRight || this.moveLeft) {
        this.lookTarget.addScaledVector(
          this.cameraDirectionRight.normalize(),
          -this.velocity.x * deltaTime,
        );
      }
      this.lookTarget.y = this.avatar.GetPosition().y;
      this.avatar.LookAt(this.lookTarget);
    }

    this.ClampNavPos(priviousPos, this.avatar.GetPosition(), deltaTime);

    // animations
    if (this.canJump) {
      if (
        Math.abs(this.velocity.z) > ACTIONS_DEFINE.RUN * this.MOVEMENT_HORSE_SPEED ||
        Math.abs(this.velocity.x) > ACTIONS_DEFINE.RUN * this.MOVEMENT_HORSE_SPEED
      ) {
        this.avatar.Run();
      } else if (
        Math.abs(this.velocity.z) < ACTIONS_DEFINE.IDLE &&
        Math.abs(this.velocity.x) < ACTIONS_DEFINE.IDLE
      ) {
        this.avatar.Idle();
      } else {
        this.avatar.Walk();
      }
    }
    this.UpdateCamera(deltaTime);
  }

  ClampNavPos(priviousPos: THREE.Vector3, nexPos: THREE.Vector3, delta: number) {
    const { finalPos, grounded } = this.CheckGround(nexPos);
    this.clamped.x = 0;
    this.clamped.y = 0;
    this.clamped.z = 0;
    const closestPlayerNode = this.pathfinder.getClosestNode(finalPos, this.ZONE, 0);
    if (closestPlayerNode == null) {
      console.error('closestPlayerNode is nullllllllll');
    }
    if (closestPlayerNode) {
      this.pathfinder.clampStep(
        priviousPos,
        finalPos,
        closestPlayerNode,
        this.ZONE,
        0,
        this.clamped,
      );
      // this.debugPriPos.position.set(
      //   closestPlayerNode.centroid.x,
      //   closestPlayerNode.centroid.y,
      //   closestPlayerNode.centroid.z,
      // );
      // this.debugNextPos.position.set(nexPos.x, nexPos.y, nexPos.z);
      // this.debugclamdPos.position.set(this.clamped.x, this.clamped.y, this.clamped.z);

      if (
        Math.abs(Math.abs(nexPos.x) - Math.abs(priviousPos.x)) < 0.01 &&
        Math.abs(Math.abs(nexPos.z) - Math.abs(priviousPos.z)) < 0.01
      ) {
        this.clamped.x = nexPos.x;
        this.clamped.z = nexPos.z;
      }
      this.avatar.SetPosition(
        this.clamped.x,
        this.avatar.GetAvatarRoot().position.y + this.velocity.y * delta,
        this.clamped.z,
      );
    } else {
      console.error('cant find closestPlayerNode');
    }
    if (grounded) {
      this.clamped.y = finalPos.y;
    }

    if (this.avatar.GetAvatarRoot().position.y < this.clamped.y) {
      this.velocity.y = 0;
      this.avatar.GetAvatarRoot().position.y = this.clamped.y;
      if (this.canJump == false) {
        App3D.Ins.EmitJump(JUMP_TYPE.END);
      }
      this.canJump = true;
    }
  }

  public Addground(mesh: THREE.Mesh) {
    this.objects.push(mesh);
  }
}
