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

export default class StoreScene extends OnlineScene {
  public portalBody: any;
  public protal: THREE.Object3D;
  public npc: THREE.Object3D;
  public portalPos = new THREE.Vector3(0, 0, 0);
  public npcCam;
  public npcRay;
  public isFinalLoadStore = false;

  private pointRaycast: THREE.Vector2 = new THREE.Vector2();

  constructor(avatar: Avatar, characterCam: CharacterCamera, controller: CharacterController) {
    super();
    this.allowBow = false;
    this.allowHorse = false;
    this.name = SCENE_NAME.STORE;
    this.characterCam = characterCam;
    this.camera = this.characterCam.camera;
    this.controller = controller;
    this.raycaster = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, -1, 0), 0, 4000);
    this.InitScene();
    this.CreateNpc();
    this.SetupControl(avatar);
    this.controller.RemoveHorse();
  }

  public InitScene() {
    this.container = Env.Ins.container3d;

    this.scene = new THREE.Scene();
    this.scene.name = SCENE_NAME.STORE;

    this.physicWorld = new PhysicWorld('models/map/store_physicmesh.glb', this.scene);
    this.SetupRender('models/map/store/');
    this.SetupLights();
  }

  private SetupControl(avatar: Avatar) {
    Env.Ins.resourcesManager.LoadGLB(ASSETS.STORE_NAV, (gltf) => {
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
      this.isFinalLoadStore = true;
    });
  }

  CreateNpc() {
    Env.Ins.resourcesManager.LoadGLB('models/npc/NPC.glb', (gltf) => {
      this.npc = gltf.scene;
      this.scene.add(gltf.scene);
      this.npc.rotateY(30);
      const mixer = new THREE.AnimationMixer(gltf.scene);
      mixer.clipAction(gltf.animations[0]).play();

      Env.Ins.animationsManager.addAnimation(mixer);
      this.npc.position.set(7.75, 0, -1.05);
      this.npc.traverse((child) => {
        if (child.type == 'SkinnedMesh') {
          child.frustumCulled = false;
        }
        if (child.type == 'Mesh') {
          this.physicWorld.AddInteractableCollider(child, RAYLAYER.NPC);
        }
      });
    });
  }
}
