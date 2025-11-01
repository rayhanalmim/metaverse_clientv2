import * as THREE from 'three';
import Env from '../Init3d';
import {
  DEBUG_TAG,
  SCENE_NAME,
  ASSETS,
  ITEM_TYPE,
  COLLISION_GROUP,
  CONTROL_MODE,
  RAYLAYER,
} from '../../constant/constant';
import Avatar from '../avatars/MainAvatar';
import CharacterController from '../controls/CharacterController';
import PhysicWorld from '../physic/PhysicWorld';
import CharacterCamera from '../controls/CharacterCamera';
import OnlineScene from './OnlineScene';
import SceneInside from './SceneInside';

export default class SamuraiScene extends OnlineScene {
  public portalBody: any;
  public protal: THREE.Object3D;
  public portalPos = new THREE.Vector3(-3.5, 0, -2.6);

  public sceneInside: SceneInside;

  private pointRaycast: THREE.Vector2 = new THREE.Vector2();

  constructor(
    sceneInside: SceneInside,
    avatar: Avatar,
    characterCam: CharacterCamera,
    controller: CharacterController,
  ) {
    super();
    this.allowBow = false;
    this.allowHorse = false;
    this.name = SCENE_NAME.SAMURAI;
    this.characterCam = characterCam;
    this.camera = this.characterCam.camera;
    this.controller = controller;
    this.sceneInside = sceneInside;
    this.InitScene();
    this.SetupControl(avatar);
    this.controller.RemoveHorse();
  }

  public ActiveSceneWithNewModel(
    sceneInside: SceneInside,
    avatar: Avatar,
    characterCam: CharacterCamera,
    controller: CharacterController,
  ) {
    super.ActiveScene(avatar, characterCam, controller);
    if (sceneInside.linkModel != this.sceneInside.linkModel) {
      this.sceneInside = sceneInside;
      this.InitScene();
      this.SetupControl(avatar);
      this.controller.RemoveHorse();
      console.log(this.sceneInside.linkModel);
    }
  }

  public InitScene() {
    this.container = Env.Ins.container3d;

    this.scene = new THREE.Scene();
    this.scene.name = SCENE_NAME.SAMURAI;
    if (this.mapBuilder) this.scene.remove(this.mapBuilder.root);
    this.physicWorld = new PhysicWorld(this.sceneInside.linkPhysic, this.scene);
    console.log('SetupRender', this.sceneInside);
    this.SetupRender(this.sceneInside.linkModel);
    this.SetupLights();
  }

  private SetupControl(avatar: Avatar) {
    Env.Ins.resourcesManager.LoadGLB(this.sceneInside.linkNav, (gltf) => {
      this.navMesh = gltf.scene.children[0];
      this.navMesh.material.wireframe = true;
      this.physicWorld.AddNAV(this.navMesh);
      this.controller.ChangePhysicWorld(this.physicWorld);
      this.SetAvatar(avatar, null);
      this.CreatePortal();
    });
  }


  CreatePortal() {
    Env.Ins.resourcesManager.LoadGLB('models/things/PortalEffect.glb', (gltf) => {
      this.protal = gltf.scene;
      this.scene.add(this.protal);
      this.protal.position.copy(this.sceneInside.portalPos);
      const physic = new THREE.Mesh(new THREE.BoxGeometry(1.5,1.0,1.5));
      physic.userData.targetScene = SCENE_NAME.MAIN;
      this.protal.add(physic);
      this.physicWorld.AddInteractableCollider(physic, RAYLAYER.PORTAL);
      console.log(this.protal);
    });
  }

}
