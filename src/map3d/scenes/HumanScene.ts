import * as THREE from 'three';
import Env from '../Init3d';
import { SCENE_NAME, ASSETS, RAYLAYER } from '../../constant/constant';
import Avatar from '../avatars/MainAvatar';
import CharacterController from '../controls/CharacterController';
import PhysicWorld from '../physic/PhysicWorld';
import CharacterCamera from '../controls/CharacterCamera';
import OnlineScene from './OnlineScene';

export default class HumanScene extends OnlineScene {
  public portalBody: any;
  public protal: THREE.Object3D;
  public portalPos = new THREE.Vector3(-3.0, 0.2, -2.0);
  public isFinalLoadHuman = false;

  constructor(avatar: Avatar, characterCam: CharacterCamera, controller: CharacterController) {
    super();
    this.allowBow = false;
    this.allowHorse = false;
    this.name = SCENE_NAME.HUMAN;
    this.characterCam = characterCam;
    this.camera = this.characterCam.camera;
    this.controller = controller;
    this.InitScene();
    this.SetupControl(avatar);
    this.controller.RemoveHorse();
  }

  public InitScene() {
    this.container = Env.Ins.container3d;

    this.scene = new THREE.Scene();
    this.scene.name = SCENE_NAME.HUMAN;

    this.physicWorld = new PhysicWorld('models/map/human_physicmesh.glb', this.scene);
    this.SetupRender('models/map/human/');
    this.SetupLights();
  }

  private SetupControl(avatar: Avatar) {
    Env.Ins.resourcesManager.LoadGLB(ASSETS.HUMAN_NAV, (gltf) => {
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
      this.protal.position.set(this.portalPos.x, this.portalPos.y, this.portalPos.z);
      const physic = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.0, 1.5));
      physic.userData.targetScene = SCENE_NAME.MAIN;
      this.protal.add(physic);
      this.physicWorld.AddInteractableCollider(physic, RAYLAYER.PORTAL);
      this.isFinalLoadHuman = true;
    });
  }
}
