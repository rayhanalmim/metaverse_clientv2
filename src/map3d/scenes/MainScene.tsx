import * as THREE from 'three';
import Env from '../Init3d';
import {
  DEBUG_TAG,
  SCENE_NAME,
  ASSETS,
  ITEM_TYPE,
  COLLISION_GROUP,
  CONTROL_MODE,
  HARDWARE_LEVEL,
  RAYLAYER,
} from '../../constant/constant';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { CSS3DRenderer, CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer';
import Avatar from '../avatars/MainAvatar';
import { Vector3 } from 'three';
import CharacterController from '../controls/CharacterController';
import TWEEN from '@tweenjs/tween.js';
import Landscape from '../environments/Landscape';
import NftBuildings from '../items/Buildings';
import PhysicWorld from '../physic/PhysicWorld';
import CharacterCamera from '../controls/CharacterCamera';
import OnlineScene from './OnlineScene';

import Settings3D from 'src/utils/Settings3D';
import Arrows from '../avatars/Arrows';
import App3D from '../App3D';

const parameters = {
  elevation: 14.7,
  azimuth: 92.5,
};

const CHANGE_CAMERA_TIME = 3000;
const MAP_CONTROL_TARGET = new THREE.Vector3(300, 0, 0);
const CAMERA_FOV = 70;

export default class MainScene extends OnlineScene {
  public characterCam: CharacterCamera;

  public pointerDowned = false;
  public pointerDrag = false;

  public fog: THREE.Fog;
  public sunPos: Vector3;
  public renderTarget: any;
  public NFTBuilding;

  // CSS3D Renderer for HTML elements (YouTube iframes)
  public css3dRenderer: CSS3DRenderer;
  public css3dScene: THREE.Scene;
  public characterRenderer: any;
  public characterScene: any;

  private cursor: THREE.Object3D;

  private tweenMoveup: any;
  private tweenMoveCenter: any;

  private water: any;
  public isFinalLoad = false;

  constructor() {
    super();
    this.allowBow = true;
    this.allowHorse = true;
    this.name = SCENE_NAME.MAIN;
    this.START_POS = new THREE.Vector3(565.9462984890118, 36.849649147493224, -176.71096338884365);
    this.sunPos = new THREE.Vector3();
    this.InitScene();
  }

  public InitScene() {
    this.container = Env.Ins.container3d;

    this.camera = new THREE.PerspectiveCamera(
      CAMERA_FOV,
      window.innerWidth / window.innerHeight,
      0.1,
      3500,
    );
    this.camera.name = 'Main Camera';
    this.scene = new THREE.Scene();

    if (Settings3D.Ins.GetHardwareLevel() == HARDWARE_LEVEL.HIGH) {
      this.fog = new THREE.Fog(0xbbbbff, 500, 1200);
      this.scene.fog = this.fog;
    }

    this.physicWorld = new PhysicWorld('models/map/mainmap_physicmesh.glb', this.scene);
    this.characterCam = new CharacterCamera(this.camera);
    this.arrows = new Arrows(this.scene, this.physicWorld);

    this.scene.name = SCENE_NAME.MAIN;
    this.scene.add(this.camera);

    this.SetupRender();
    this.CreateCursor();
    this.SetupLights();
    this.SetupControl();
    this.SetupWindowResize();

    Env.Ins.resourcesManager.loadingManager.onLoad = () => {
      this.isFinalLoad = true;
    };
  }

  public ActiveScene(
    avatar: Avatar,
    characterCam: CharacterCamera,
    controller: CharacterController,
  ) {
    this.SetAvatar(avatar, null);
    this.characterCam = characterCam;
    this.controller = controller;
    this.controller.ChangePhysicWorld(this.physicWorld);
  }

  CreateCursor() {
    Env.Ins.resourcesManager.LoadGLB('models/things/Cursor.glb', (gltf) => {
      this.cursor = gltf.scene;
      this.cursor.name = 'Cursor';
      this.cursor.visible = false;
      this.scene.add(this.cursor);
    });
  }

  public SetAvatar(avatar: Avatar, pos, quat = null) {
    this.currentUserAvatar = avatar;
    this.currentUserAvatar.randomAnimations = false;
    // if (quat) this.currentUserAvatar.SetQuaternionQ(quat);
    this.currentUserAvatar.SetPositionV(
      pos ? new THREE.Vector3(pos.x, pos.y, pos.z) : this.START_POS,
    );
    if (this.currentUserAvatar.IsRide()) {
      this.currentUserAvatar.MakeSideHorse(false);
    }
    this.currentUserAvatar.Idle();
    this.scene.add(this.currentUserAvatar.GetAvatarRoot());
    // this.currentUserAvatar.avatarRoot.visible = false;
    this.currentUserAvatar.HideText(false);
    // this.currentUserAvatar.CreateCollider(this.physicWorld);
  }

  SetupRender() {
    // Create render
    this.renderer = new THREE.WebGLRenderer({ antialias: Settings3D.Ins.antialias });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    // this.renderer.outputEncoding = THREE.sRGBEncoding;
    // this.renderer.shadowMap.enabled = true;
    this.renderer.toneMappingExposure = 1.5;
    this.renderer.domElement.style.zIndex = '10';
    this.container?.appendChild(this.renderer.domElement);
    this.renderer.domElement.id = SCENE_NAME.MAIN;
    this.pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    console.log('renderer', this.renderer);

    this.renderer.debug.checkShaderErrors = false;

    // Create CSS3D Renderer for HTML elements (YouTube iframes)
    this.css3dRenderer = new CSS3DRenderer();
    this.css3dRenderer.setSize(window.innerWidth, window.innerHeight);
    this.css3dRenderer.domElement.className = 'css3d-container'; // CSS handles z-index and pointer-events
    this.container?.appendChild(this.css3dRenderer.domElement);

    // Character renderer layer (renders player on top)
    this.characterRenderer = new THREE.WebGLRenderer({
      antialias: Settings3D.Ins.antialias,
      alpha: true
    });
    this.characterRenderer.setPixelRatio(window.devicePixelRatio);
    this.characterRenderer.setSize(window.innerWidth, window.innerHeight);
    this.characterRenderer.setClearColor(0x000000, 0);
    this.characterRenderer.toneMapping = this.renderer.toneMapping;
    this.characterRenderer.toneMappingExposure = this.renderer.toneMappingExposure;
    this.characterRenderer.domElement.className = 'character-layer'; // CSS handles z-index
    this.container?.appendChild(this.characterRenderer.domElement);

    // Create CSS3D Scene
    this.css3dScene = new THREE.Scene();

    // Create character scene
    this.characterScene = new THREE.Scene();

    console.log('✅ 3-Layer rendering (CSS-controlled)');

    // load environment texture
    Env.Ins.resourcesManager.LoadRGBETexture(ASSETS.ENVIRONMENT, (texture) => {
      console.log('load env map tex finish');
      texture.mapping = THREE.EquirectangularReflectionMapping;
      this.envMap = texture;
      this.scene.background = texture;
      this.scene.environment = texture;
      this.characterScene.environment = texture; // Ensure player layer reuses scene lighting
      this.SetupScene();
    });
  }

  private CreateWater() {
    // Create water
    Env.Ins.resourcesManager.LoadGLB('models/map/mainmap_things.glb', (gltf) => {
      this.water = gltf.scene;
      gltf.scene.children[0].material.map = gltf.scene.children[0].material.map.clone();
      gltf.scene.children[0].material.normalMap = gltf.scene.children[0].material.normalMap.clone();
      this.scene.add(gltf.scene);
      gltf.scene.name = 'River';
    });
  }

  private LoadNobunaga() {
    Env.Ins.resourcesManager.LoadGLB('models/map/mainmap_nobunaga.glb', (gltf) => {
      this.scene.add(gltf.scene);
      // this.isFinalLoad = true;
      console.log('nobu', gltf);
      gltf.scene.name = 'Nobunaga';
    });
  }

  protected SetupLights() {
    const addLights = (targetScene: THREE.Scene | undefined) => {
      if (!targetScene) return;
      const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1.5);
      hemiLight.position.set(0, 20, 0);
      targetScene.add(hemiLight);
      const ambientLight = new THREE.AmbientLight(0x404040, 1.5);
      targetScene.add(ambientLight);
    };

    addLights(this.scene);
    addLights(this.characterScene);
  }

  protected SetupScene() {
    super.SetupScene('models/map/mainmap/');
    // this.isFinalLoad = true;
    NftBuildings.Ins.Init(
      this.scene,
      'models/map/mainmap_nft_building.glb',
      this.camera,
      this.physicWorld,
    );
    this.NFTBuilding = NftBuildings.Ins;

    this.CreateWater();
    this.LoadNobunaga();
    new Landscape(this.scene, 'models/map/mainmap_landscape.glb', this.envMap);
  }

  public isFinalLoader() {
    return this.isFinalLoad;
  }

  private SetupControl() {
    // orbitcontrol for test
    this.control = new OrbitControls(this.camera, this.renderer.domElement);
    this.control.minDistance = 1600;
    this.control.enableZoom = false;
    this.control.enablePan = false;
    this.control.maxPolarAngle = 1.2;
    this.control.minPolarAngle = 0.7;
    this.control.enableDamping = true;
    this.control.dampingFactor = 0.03;
    this.control.target = MAP_CONTROL_TARGET;
    this.control.enabled = false;
    console.log(this.control);
    document.addEventListener(
      'pointerdown',
      (event) => {
        if (this.control.enabled == false) return;
        this.pointerDowned = true;
      },
      false,
    );
    document.addEventListener(
      'pointerup',
      (event) => {
        if (this.control.enabled == false) return;
        if (!this.pointerDrag && event.button == 0) {
          this.MapControlHandle(event);
        }
        this.pointerDrag = false;
        this.pointerDowned = false;
      },
      false,
    );
    document.addEventListener(
      'pointermove',
      (event) => {
        if (this.pointerDowned) {
          if (event.movementX != 0 || event.movementY != 0) {
            this.pointerDrag = true;
          }
        }
        if (this.control.enabled == false) return;
        this.MapControlMoveHandle(event);
      },
      false,
    );

    Env.Ins.resourcesManager.LoadGLB(ASSETS.MAIN_NAV, (gltf) => {
      this.navMesh = gltf.scene.children[0];
      this.navMesh.userData.isNAV = true;
      this.physicWorld.AddNAV(this.navMesh);
      this.controller = new CharacterController(
        this.camera,
        this.currentUserAvatar,
        this.navMesh,
        document.body,
        this.physicWorld,
      );
      App3D.Ins.globalController = this.controller;
    });
  }

  private SetupWindowResize() {
    window.addEventListener('resize', () => {
      // Update camera
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();

      // Update WebGL renderer
      this.renderer.setSize(window.innerWidth, window.innerHeight);

      // Update CSS3D renderer
      if (this.css3dRenderer) {
        this.css3dRenderer.setSize(window.innerWidth, window.innerHeight);
      }
    });
  }

  public GetCurrentLand(ev) {
    if (this.control.enabled == false) {
      const object = this.controller.GetIntersectsInteractableObjects(ev);
      if (object) {
        if (object.object.userData.RAYLAYER == RAYLAYER.LAND) {
          return object;
        }
      }
    }
    return null;
  }

  public GetCurrentPortal(ev) {
    if (this.control.enabled == false) {
      const object = this.controller.GetIntersectsInteractableObjects(ev);
      if (object) {
        if (object.object.userData.RAYLAYER == RAYLAYER.PORTAL) {
          return object.object;
        }
      }
    }
    return null;
  }

  public GetAllLand() {
    return NftBuildings.Ins.GetAllLand();
  }

  public ChangeControlMode(mode: string) {
    this.priviousControlMode = this.currentControlMode;
    const navigateElm: HTMLElement = document.querySelector('.navigate-modal');
    const bagElm: HTMLElement = document.querySelector('.ReactModalPortal .bag-icon');
    const mapBtn: HTMLElement = document.querySelector('.ReactModalPortal .open-map-modal');
    switch (mode) {
      case CONTROL_MODE.FPS:
        if (navigateElm) {
          navigateElm.style.display = 'block';
          navigateElm.style.width = '300px';
          navigateElm.style.height = '200px';
        }
        if (bagElm) {
          bagElm.style.display = 'block';
        }
        if (mapBtn) {
          mapBtn.style.display = 'block';
        }
        this.KillTween();
        this.control.enabled = false;
        this.controller.isActive = true;
        this.cursor.visible = false;
        this.camera.near = 0.1;
        this.controller.SetupMode(false);
        if (this.fog) {
          this.fog.near = 500;
          this.fog.far = 1200;
        }
        break;
      case CONTROL_MODE.TPS:
        if (navigateElm) {
          navigateElm.style.display = 'block';
          navigateElm.style.width = '300px';
          navigateElm.style.height = '200px';
        }
        if (bagElm) {
          bagElm.style.display = 'block';
        }
        if (mapBtn) {
          mapBtn.style.display = 'block';
        }
        this.KillTween();
        this.control.enabled = false;
        this.controller.isActive = true;
        this.cursor.visible = false;
        this.camera.near = 0.1;
        this.controller.SetupMode(true);
        if (this.fog) {
          this.fog.near = 500;
          this.fog.far = 1200;
        }
        break;
      case CONTROL_MODE.MAP:
        if (navigateElm) {
          navigateElm.style.display = 'none';
          navigateElm.style.width = '0';
          navigateElm.style.height = '0';
        }
        if (bagElm) {
          bagElm.style.display = 'none';
        }
        if (mapBtn) {
          mapBtn.style.display = 'none';
        }
        this.control.enabled = true;
        this.controller.isActive = false;
        this.scene.attach(this.camera);
        this.control.target = this.currentUserAvatar.GetPosition().clone();
        this.camera.near = 10;
        if (this.fog) {
          this.fog.near = 2000;
          this.fog.far = 5000;
        }
        this.tweenMoveup = new TWEEN.Tween(this.camera.position)
          .to({ x: this.camera.position.x, y: 1000, z: this.camera.position.z }, CHANGE_CAMERA_TIME)
          .start()
          .easing(TWEEN.Easing.Cubic.InOut);
        this.tweenMoveCenter = new TWEEN.Tween(this.control.target)
          .to(MAP_CONTROL_TARGET, CHANGE_CAMERA_TIME)
          .start()
          .easing(TWEEN.Easing.Cubic.InOut);
        break;

      default:
        break;
    }
    this.camera.updateProjectionMatrix();
    this.currentControlMode = mode;
  }

  KillTween() {
    console.log(this.tweenMoveup);
    this.tweenMoveup?.stop();
    this.tweenMoveCenter?.stop();
  }

  MapControlHandle(event) {
    const intersects = this.controller.GetIntersectsNavAEnv(event);
    if (intersects.length > 0) {
      if (intersects[0].object.userData.isNAV == true) {
        this.AvatarTeleport(intersects[0].point);
      }
    }
  }

  AvatarTeleport(pos: THREE.Vector3, changeMode = true) {
    if (pos) {
      this.currentUserAvatar.SetPositionV(pos);
      if (changeMode)
        this.ChangeControlMode(
          this.priviousControlMode === CONTROL_MODE.MAP
            ? CONTROL_MODE.TPS
            : this.priviousControlMode,
        );
    }
  }

  MoveAvatarToLand(id: string) {
    const landPos = NftBuildings.Ins.GetLandPosition(id);
    this.AvatarTeleport(landPos);
  }

  MapControlMoveHandle(event) {
    const intersects = this.controller.GetIntersectsNavAEnv(event);
    if (intersects.length > 0 && intersects[0].object.userData.isNAV == true) {
      this.cursor.visible = true;
      this.cursor.position.copy(intersects[0].point);
    } else {
      this.cursor.visible = false;
    }
  }

  public Update(deltaTime: number): void {
    if (this.water) {
      this.water.children[0].material.normalMap.offset.y -= 0.005;
      this.water.children[0].material.map.offset.y -= 0.005;
      this.water.children[1].material.normalMap.offset.y -= 0.001;
      this.water.children[1].material.map.offset.y -= 0.001;
    }
    NftBuildings.Ins.Update();
    if (this.control.enabled) {
      this.control.update();
    }

    // Hide player temporarily to render world without it
    const playerVisible = this.currentUserAvatar?.GetAvatarRoot()?.visible;
    if (this.currentUserAvatar?.GetAvatarRoot()) {
      this.currentUserAvatar.GetAvatarRoot().visible = false;
    }

    // Render Layer 1: World (without player)
    super.Update(deltaTime);

    // Render Layer 2: CSS3D YouTube videos
    if (this.css3dRenderer && this.css3dScene) {
      this.css3dRenderer.render(this.css3dScene, this.camera);
    }

    // Render Layer 3: Player character on top layer
    if (this.currentUserAvatar?.GetAvatarRoot() && playerVisible) {
      this.currentUserAvatar.GetAvatarRoot().visible = true;

      if (this.characterRenderer && this.characterScene) {
        // Add the player to isolated scene while preserving shared lighting
        this.characterScene.add(this.currentUserAvatar.GetAvatarRoot());

        // Render only the player on top layer (z-index: 100)
        this.characterRenderer.render(this.characterScene, this.camera);

        // Move player back to main scene
        this.scene.add(this.currentUserAvatar.GetAvatarRoot());
      }
    }
  }
}
