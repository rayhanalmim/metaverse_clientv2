import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import CharacterCamera from '../controls/CharacterCamera';
import MScene from './Scene';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import CharacterController from '../controls/CharacterController';
import MapBuilder from 'src/utils/MapBuilder';
import Avatar from '../avatars/MainAvatar';
import { OtherAvatar } from 'src/constant/constantClass';
import { ASSETS, CONTROL_MODE, ITEM_TYPE, SCENE_NAME } from 'src/constant/constant';
import PhysicWorld from '../physic/PhysicWorld';
import * as THREE from 'three';
import Env from '../Init3d';
import AvatarManager from '../avatars/AvatarManager';
import ItemsManager from '../items/ItemsManager';
import OnlineAvatar from '../avatars/OnlineAvatar';
import general from 'src/api/general';
import { IMasterItem } from 'src/interfaces/general';

export default class CanmoveScene extends MScene {
  public characterCam: CharacterCamera;
  // public renderPass: RenderPass;
  // public bloomComposer: EffectComposer;
  // public effectComposer: EffectComposer;
  public pmremGenerator: THREE.PMREMGenerator;
  public envMap: any;

  public allowHorse = false;
  public allowBow = false;

  public controller: CharacterController;
  public mapBuilder: MapBuilder;

  public currentUserAvatar: Avatar;
  public avatarOther: OtherAvatar[] = [];
  public START_POS: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
  public cameraWorldPos: THREE.Vector3 = new THREE.Vector3();

  public currentControlMode = CONTROL_MODE.TPS;
  public priviousControlMode = CONTROL_MODE.TPS;

  public navMesh: any;
  public physicWorld: PhysicWorld;
  public raycaster: THREE.Raycaster;
  public listAllItem: IMasterItem[] = [];

  public listUser = [];

  constructor() {
    super();
    this.raycaster = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, -1, 0), 0, 4000);
    this.GetListAllItem();
  }

  public async GetListAllItem() {
    const { data } = await general.listAllItem();
    this.listAllItem = [...data.data];
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

  public async getListUser() {
    const { data } = await general.listUser();
    this.listUser = [...data.data];
  }

  public SetAvatar(avatar: Avatar, pos) {
    this.currentUserAvatar = avatar;
    this.currentUserAvatar.randomAnimations = false;
    this.currentUserAvatar.SetPositionV(
      pos ? new THREE.Vector3(pos.x, pos.y, pos.z) : this.START_POS,
    );
    this.currentUserAvatar.Idle();
    this.currentUserAvatar.ChangePhysicWorld(this.physicWorld);

    this.scene.add(this.currentUserAvatar.GetAvatarRoot());
    this.currentUserAvatar.HideText(false);
  }

  public async ChangeItemOtherAvatar(avt, items, prevItems) {
    if (this.listAllItem.length === 0) {
      await this.GetListAllItem();
    }

    const listItem = this.listAllItem.filter((item) => avt.itemsID.some((id) => id === item.id));

    const listNewItem = this.listAllItem.filter((item) => items.some((id) => id === item.id));

    const listItemsRemove = listItem.filter(
      (item) =>
        !listNewItem.some((c) => item.id === c.id) &&
        !listNewItem.some((c) => item.type === c.type),
    );
    for (const it of listItemsRemove) {
      ItemsManager.Ins.GetItemMesh(ItemsManager.Ins.GetItemByType(it.link, it.type), (item) => {
        avt.avatar.RemoveItem(item);
      });
    }
    for (const it of listNewItem) {
      const prevHasHorse = listItem.some((c) => c.type === ITEM_TYPE.HORSE && c.link === it.link);
      if (!prevHasHorse) {
        ItemsManager.Ins.GetItemMesh(ItemsManager.Ins.GetItemByType(it.link, it.type), (item) => {
          avt.avatar.ChangeItem(item);
        });
      }
    }
    const otherAvt = this.avatarOther.find((item) => item.id === avt.id);
    if (otherAvt) otherAvt.itemsID = [...items];
  }

  delay(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
  }

  public ClearAvatar(index) {
    if (!this.avatarOther[index]) return;
    this.avatarOther.splice(index, 1);
  }

  public ClearAvatarWithId(id) {
    this.avatarOther = this.avatarOther.filter((c) => c.id !== id);
  }

  public RemoveAvatar(id) {
    const avt = this.avatarOther.find((c) => c.id == id);
    if (!avt) return;
    avt.avatar.Remove();
    this.ClearAvatar(id);
  }

  public getListAvatar() {
    return this.avatarOther;
  }

  public async SetOtherAvatar(overview) {
    if (!overview.avatarID) return;
    const hasAvatar = this.avatarOther.some((item) => item.id == overview.id);
    if (hasAvatar) return;
    const other = new OnlineAvatar(
      overview,
      (avt) => {
        this.scene.add(avt);
      },
      overview.username,
      true,
    );

    this.avatarOther = [
      ...this.avatarOther,
      { id: overview.id, avatar: other, itemsID: overview.itemsID, isLoad: false },
    ];

    AvatarManager.Ins.LoadAvatarMeshFormId(overview.avatarID, (avatarMesh) => {
      other.ChangeBodyMesh(avatarMesh);
    });

    if (this.listAllItem.length === 0) {
      await this.GetListAllItem();
    }

    const listItem = this.listAllItem.filter((item) =>
      overview.itemsID.some((id) => id === item.id),
    );

    const hasBody = listItem.some((item) => item.type === ITEM_TYPE.BODY);
    if (!hasBody) {
      ItemsManager.Ins.GetItemMesh(
        ItemsManager.Ins.GetItemByType('models/items/Set1_Body.glb', ITEM_TYPE.BODY),
        (item) => {
          other.ChangeItem(item);
        },
      );
    }
    let i = 0;
    const timer = setInterval(() => {
      if (i > listItem.length - 1) {
        clearInterval(timer);
        return;
      }
      ItemsManager.Ins.GetItemMesh(
        ItemsManager.Ins.GetItemByType(listItem[i].link, listItem[i].type),
        (item) => {
          other.ChangeItem(item);
        },
      );
      i += 1;
    }, 700);

    const setAvatar = () => {
      if (!other.GetAvatarRoot()) {
        setTimeout(() => {
          setAvatar();
        }, 10);
      } else {
        if (!overview.position.x || !overview.position.z) {
          other.SetPositionV(new THREE.Vector3(0, 0, 0));
        } else {
          other.SetPositionV(overview.position);
        }
        other.Idle();
        if (this.avatarOther.find((item) => item.id == overview.id))
          this.avatarOther.find((item) => item.id == overview.id).isLoad = true;
      }
    };
    setAvatar();
  }

  protected SetupLights() {
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1.5);
    hemiLight.position.set(0, 20, 0);
    this.scene.add(hemiLight);
    const light = new THREE.AmbientLight(0x404040, 1.5); // soft white light
    this.scene.add(light);
  }

  protected SetupRender(linkmap: string) {
    // Create render
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    // this.renderer.outputEncoding = THREE.sRGBEncoding;
    // this.renderer.shadowMap.enabled = true;
    this.renderer.toneMappingExposure = 1.5;
    this.renderer.domElement.style.zIndex = '10';
    this.container?.appendChild(this.renderer.domElement);
    this.renderer.domElement.id = SCENE_NAME.STORE;
    this.pmremGenerator = new THREE.PMREMGenerator(this.renderer);

    // remove possprocessing
    // // create renderpass
    // const renderScene = new RenderPass(this.scene, this.camera);
    // const bloomPass = new UnrealBloomPass(
    //   new THREE.Vector2(window.innerWidth, window.innerHeight),
    //   1.5,
    //   0.4,
    //   0.85,
    // );
    // bloomPass.threshold = 0.1;
    // bloomPass.strength = 0.2;
    // bloomPass.radius = 0.05;

    // this.effectComposer = new EffectComposer(this.renderer);
    // this.effectComposer.addPass(renderScene);
    // this.effectComposer.addPass(bloomPass);

    // load environment texture
    Env.Ins.resourcesManager.LoadRGBETexture(ASSETS.ENVIRONMENT, (texture) => {
      texture.mapping = THREE.EquirectangularReflectionMapping;
      this.envMap = texture;
      this.scene.background = texture;
      this.scene.environment = texture;
      this.SetupScene(linkmap);
    });
  }

  protected SetupScene(linkmap: string) {
    this.mapBuilder = new MapBuilder(
      this.scene,
      linkmap,
      this.camera,
      Env.Ins.resourcesManager.GetGLTFLoader(),
      () => {
        this.isReady = true;
      },
    );
  }

  public ChangeControlMode(mode: string) {
    this.priviousControlMode = this.currentControlMode;
    switch (mode) {
      case CONTROL_MODE.FPS:
        this.controller.isActive = true;
        this.controller.SetupMode(false);
        break;
      case CONTROL_MODE.TPS:
        this.controller.isActive = true;
        this.controller.SetupMode(true);
        break;

      default:
        break;
    }
    this.currentControlMode = mode;
  }

  public Update(deltaTime: number): void {
    this.characterCam?.camera.getWorldPosition(this.cameraWorldPos);
    this.avatarOther.forEach((avatar) => {
      avatar.avatar.Update(deltaTime, this.cameraWorldPos);
    });
    if (this.mapBuilder) {
      this.mapBuilder.UpdateMap(this.cameraWorldPos);
    }
    this.currentUserAvatar?.Update(deltaTime);
    this.arrows?.Update(deltaTime);
    this.controller?.UpdateControl(deltaTime);
    // this.effectComposer?.render();
    this.renderer.render(this.scene, this.camera);
    // console.log(this.renderer.info.render.calls, this.renderer.info.render.triangles);
  }
}
