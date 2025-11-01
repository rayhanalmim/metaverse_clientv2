import * as THREE from 'three';
import Env from '../Init3d';
import { ASSETS, ITEM_TYPE, POPUP, SCENE_NAME } from '../../constant/constant';

import MScene from './Scene';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { Tween } from '@tweenjs/tween.js';
import PopupManager from '../managers/PopupManagers';
import AvatarManager from '../avatars/AvatarManager';
import ItemsManager from '../items/ItemsManager';
import MainAvatar from '../avatars/MainAvatar';

export default class AvatarScene extends MScene {
  constructor(name?) {
    super();
    this.name = name || SCENE_NAME.AVATARS;
    this.isReady = false;
    this.SCENE_WIDTH = 500;
    this.SCENE_HEIGHT = 500;
    this.InitScene();
  }

  public container: HTMLElement;
  public control: OrbitControls;
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public name: string;
  public renderer: THREE.WebGLRenderer;
  public renderPass: RenderPass;
  public bloomComposer: EffectComposer;
  public effectComposer: EffectComposer;
  public isReady: boolean;

  private avatarsParent: THREE.Object3D;

  public SCENE_WIDTH: number;
  public SCENE_HEIGHT: number;
  public isHasAvatar = false;

  public morphAni: THREE.MorphTarget[] = [];
  public activeAvatar: MainAvatar;
  public activeAvatarIndex = 0;
  public avatarId: number;

  private roomMesh: THREE.Mesh;

  public InitScene() {
    this.container = Env.Ins.containerAvatar;

    // camera
    this.camera = new THREE.PerspectiveCamera(45, this.SCENE_WIDTH / this.SCENE_HEIGHT, 0.1, 1000);
    this.camera.position.set(0, 1.3, 4);

    // Scene
    this.scene = new THREE.Scene();
    this.scene.add(this.camera);
    this.scene.name = SCENE_NAME.AVATARS;

    this.avatarsParent = new THREE.Object3D();
    this.avatarsParent.name = 'Avatars Parent';
    this.scene.add(this.avatarsParent);

    this.LoadScene();
    this.SetupRender();
    this.SetupLights();
    this.SetupControl();
  }

  InitStore() {
    const inventory = PopupManager.Ins.ShowPopup(POPUP.INVENTORY);
    inventory.AddEventChangeItem((item) => {
      ItemsManager.Ins.GetItemMesh(item, () => {
        this.activeAvatar.ChangeItem(item);
      });
    });
  }

  getGender() {
    return this.activeAvatar.GetAvatarMesh().sex;
  }

  onChangeItem(i) {
    ItemsManager.Ins.GetItemMesh(ItemsManager.Ins.GetItemByType(i.link, i.type), (item) => {
      this.activeAvatar.ChangeItem(item);
    });
  }

  onRemoveItem(i) {
    ItemsManager.Ins.GetItemMesh(ItemsManager.Ins.GetItemByType(i.link, i.type), (item) => {
      this.activeAvatar.RemoveItem(item);
    });
  }

  onWindowResize() {
    // Do not resize scene
  }

  LoadScene() {
    Env.Ins.resourcesManager.LoadGLB('models/avatars/AvatarRoom.glb', (gltf) => {
      this.roomMesh = gltf.scene.children[0];
      this.scene.add(gltf.scene);
      gltf.scene.traverse((child) => {
        if (child.isMesh) {
          if (child.morphTargetInfluences?.length > 0) {
            new Tween({ x: 0 })
              .to({ x: 1 }, 5000)
              .onUpdate((value) => {
                child.morphTargetInfluences[0] = value.x;
              })
              .start()
              .repeat(10000)
              .yoyo(true);
          }
        }
      });
    });

    Env.Ins.LoadAnimation(() => {
      this.activeAvatar = new MainAvatar(
        'models/avatars/Skeleton.glb',
        (avatarRoot) => {
          this.avatarsParent.add(avatarRoot);
          this.activeAvatarIndex = 0;
          this.isReady = true;
          AvatarManager.Ins.InitAvatarMeshes().then(() => {
            if (this.avatarId)
              this.ChangeAvatarById(this.avatarId).then(() => {
                setTimeout(() => {
                  this.isHasAvatar = true;
                }, 1000);
              });
            else
              this.ChangeAvatarMesh().then(() => {
                this.activeAvatar.LoadDefaultItems();
                setTimeout(() => {
                  this.isHasAvatar = true;
                }, 5000);
              });
          });
        },
        'Default Avatar',
        true,
      );
    });
  }

  SetupEventChangeAvatar() {
    document.getElementById('previous-avatar').addEventListener('click', (event) => {
      this.activeAvatarIndex -= 1;
      if (this.activeAvatarIndex < 0)
        this.activeAvatarIndex = AvatarManager.Ins.avatarMeshes.length - 1;
      this.ChangeAvatarMesh();
    });
    document.getElementById('next-avatar').addEventListener('click', (event) => {
      this.activeAvatarIndex += 1;
      if (this.activeAvatarIndex > AvatarManager.Ins.avatarMeshes.length - 1)
        this.activeAvatarIndex = 0;
      this.ChangeAvatarMesh();
    });
    document.addEventListener('keyup', (event) => {
      // this.activeAvatar.
    });
  }

  async onNextAvatar() {
    this.activeAvatarIndex += 1;
    if (this.activeAvatarIndex > AvatarManager.Ins.avatarMeshes.length - 1)
      this.activeAvatarIndex = 0;
    await this.ChangeAvatarMesh();
  }

  async onPrevAvatar() {
    this.activeAvatarIndex -= 1;
    if (this.activeAvatarIndex < 0)
      this.activeAvatarIndex = AvatarManager.Ins.avatarMeshes.length - 1;
    await this.ChangeAvatarMesh();
  }

  ChangeAvatarMesh() {
    return new Promise((resolve) => {
      AvatarManager.Ins.GetAvatarMesh(this.activeAvatarIndex, (avatarMesh) => {
        this.activeAvatar
          .ChangeBodyMesh(avatarMesh, true, this.roomMesh)
          .then(() => resolve(this.activeAvatar));
        this.activeAvatar.SetText(avatarMesh.name);
      });
    });
  }

  delay(ms){
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async ChangeAvatarById(id: number) {
    await this.delay(3000);
    return await new Promise((resolve) => {
      AvatarManager.Ins.GetAvatarMeshFromId(id, (avatarMesh) => {
        this.activeAvatar.ChangeBodyMesh(avatarMesh).then(() => {
          resolve(this.activeAvatar)
        });
        this.activeAvatar.SetText(avatarMesh.name);
      });
    });
  }

  GetActiveAvatarId() {
    return this.activeAvatar.GetAvatarId();
  }

  SetAvatarId(id) {
    this.avatarId = id;
    if (this.avatarId)
      this.ChangeAvatarById(this.avatarId).then(() => {
        setTimeout(() => {
          this.isHasAvatar = true;
        }, 1000);
      });
    else
      this.ChangeAvatarMesh().then(() => {
        this.activeAvatar.LoadDefaultItems();
        setTimeout(() => {
          this.isHasAvatar = true;
        }, 5000);
      });
  }

  SetupLights() {
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444);
    hemiLight.position.set(0, 20, 0);
    this.scene.add(hemiLight);

    const light = new THREE.AmbientLight(0x404040); // soft white light
    this.scene.add(light);
  }

  SetupRender() {
    // load environment texture
    Env.Ins.resourcesManager.LoadRGBETexture(ASSETS.ENVIRONMENT, (texture) => {
      console.log('load tex finish');
      texture.mapping = THREE.EquirectangularReflectionMapping;
      // texture.encoding = THREE.sRGBEncoding;
      this.scene.background = new THREE.Color(0x050505);
      this.scene.environment = texture;
      // this.envMap = texture;
    });
    // Create render
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.toneMapping = THREE.CineonToneMapping;
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.shadowMap.enabled = true;
    this.renderer.toneMappingExposure = 1.0;
    this.container?.appendChild(this.renderer.domElement);
    this.renderer.domElement.style.width = '100%';
    this.renderer.domElement.style.height = '100%';

    // create renderpass
    const renderScene = new RenderPass(this.scene, this.camera);
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      1.5,
      0.4,
      0.85,
    );
    bloomPass.threshold = 0.75;
    bloomPass.strength = 1.0;
    bloomPass.radius = 0.0;

    this.effectComposer = new EffectComposer(this.renderer);
    // this.effectComposer.renderToScreen = false;
    this.effectComposer.addPass(renderScene);
    this.effectComposer.addPass(bloomPass);
  }

  SetupControl() {
    this.control = new OrbitControls(this.camera, this.renderer.domElement);
    this.control.target = new THREE.Vector3(0, 1.2, 0);
    this.control.enableZoom = true;
    this.control.minDistance = 3.5;
    this.control.maxDistance = 5;
    this.control.maxPolarAngle = Math.PI / 2;
    this.control.minPolarAngle = Math.PI / 2;
    this.control.enablePan = false;
    this.control.enableDamping = true;
    this.control.dampingFactor = 0.03;
    this.control.rotateSpeed = 0.5;
  }

  public Update(deltaTime: number) {
    if (this.isReady == false) return;
    this.activeAvatar.Update(deltaTime, this.camera.position);
    this.control.update();
    this.effectComposer.render();
  }
}
