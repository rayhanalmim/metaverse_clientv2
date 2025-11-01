import AvatarScene from './scenes/AvatarsScene';
import Env from './Init3d';
import MainScene from './scenes/MainScene';
import { ITEM_TYPE, LAND_TYPE, SCENE_NAME, SOCKET_EVENTS } from '../constant/constant';
import SamuraiScene from './scenes/SamuraiScene';
import StoreScene from './scenes/StoreScene';
import * as THREE from 'three';
import Avatar from './avatars/MainAvatar';
import CharacterCamera from './controls/CharacterCamera';
import CharacterController from './controls/CharacterController';
import Settings3D from 'src/utils/Settings3D';
import general from '../api/general';
import HumanScene from './scenes/HumanScene';
import SceneInside from './scenes/SceneInside';
import NftBuildings from './items/Buildings';
import { IOnMovement, IOverView } from 'src/interfaces/socket';
import CanmoveScene from './scenes/OnlineScene';
import IArrowSocketData from './avatars/IArrowSocketData';

export default class App3D {
  private static _instance?: App3D;
  public mainScene: MainScene;
  public samuraiScene: SamuraiScene;
  public storeScene: StoreScene;
  public humanScene: HumanScene;

  public globalAvatar: Avatar;
  public globalCharacterCam: CharacterCamera;
  public globalController: CharacterController;
  public socket;
  public prevPos;
  public listUser = [];
  public type = SCENE_NAME.MAIN;
  public listUserChangeItem = [];

  public userID = -1;

  constructor() {
    if (App3D._instance) throw new Error('Use Singleton.instance instead of new.');
    App3D._instance = this;

    Settings3D.Ins.Benchmark(() => {
      // bench
    });
    this.mainScene = Env.Ins.scenesManager.GetScene(SCENE_NAME.MAIN) as MainScene;
    this.ActiveAvatarScene();
  }

  public static get Ins() {
    return App3D._instance ?? (App3D._instance = new App3D());
  }

  public async getListUser() {
    const { data } = await general.listUser();
    this.listUser = [...data.data];
  }

  public initSocket(socket) {
    this.socket = socket;
  }

  public ActiveAvatarScene() {
    if (Env.Ins.scenesManager.GetScene(SCENE_NAME.AVATARS)) {
      Env.Ins.scenesManager.SetActiveScene(SCENE_NAME.AVATARS);
    } else {
      const avatarScene = new AvatarScene();
      Env.Ins.scenesManager.AddScene(avatarScene, true);
    }
  }

  public getAvatarScene() {
    return Env.Ins.scenesManager.GetScene(SCENE_NAME.AVATARS);
  }

  public OtherAvatarScene(overview: IOnMovement) {
    const user = this.listUserChangeItem.find((item) => item.id === overview.id);
    const formatOverview = overview;
    if (user) {
      formatOverview.itemsID = user.itemsID;
    }
    if (this.mainScene) this.mainScene.SetOtherAvatar(formatOverview);
    if (this.samuraiScene)
      this.samuraiScene.SetOtherAvatar({
        ...formatOverview,
        itemsID: formatOverview.itemsID.filter((c) =>
          this.mainScene.listAllItem.some((x) => x.id === c && x.type !== ITEM_TYPE.HORSE),
        ),
      });
    if (this.storeScene)
      this.storeScene.SetOtherAvatar({
        ...formatOverview,
        itemsID: formatOverview.itemsID.filter((c) =>
          this.mainScene.listAllItem.some((x) => x.id === c && x.type !== ITEM_TYPE.HORSE),
        ),
      });
    if (this.humanScene)
      this.humanScene.SetOtherAvatar({
        ...formatOverview,
        itemsID: formatOverview.itemsID.filter((c) =>
          this.mainScene.listAllItem.some((x) => x.id === c && x.type !== ITEM_TYPE.HORSE),
        ),
      });
  }

  public UpdateItemAvatar(itemsId, id) {
    const user = this.listUserChangeItem.find((item) => item.id === id);
    if (user) {
      this.listUserChangeItem.find((item) => item.id === id).itemsID = itemsId;
    } else {
      this.listUserChangeItem.push({ id: id, itemsID: itemsId });
    }
    if (this.mainScene) {
      const avt = this.mainScene.avatarOther.find((item) => item.id === id);
      if (avt) this.mainScene.ChangeItemOtherAvatar(avt, itemsId, avt.itemsID);
    }

    if (this.samuraiScene) {
      const avt = this.samuraiScene.avatarOther.find((item) => item.id === id);
      if (avt)
        this.samuraiScene.ChangeItemOtherAvatar(
          avt,
          itemsId.filter((c) =>
            this.mainScene.listAllItem.some((x) => x.id === c && x.type !== ITEM_TYPE.HORSE),
          ),
          avt.itemsID,
        );
    }

    if (this.storeScene) {
      const avt = this.storeScene.avatarOther.find((item) => item.id === id);
      if (avt)
        this.storeScene.ChangeItemOtherAvatar(
          avt,
          itemsId.filter((c) =>
            this.mainScene.listAllItem.some((x) => x.id === c && x.type !== ITEM_TYPE.HORSE),
          ),
          avt.itemsID,
        );
    }

    if (this.humanScene) {
      const avt = this.humanScene.avatarOther.find((item) => item.id === id);
      if (avt)
        this.humanScene.ChangeItemOtherAvatar(
          avt,
          itemsId.filter((c) =>
            this.mainScene.listAllItem.some((x) => x.id === c && x.type !== ITEM_TYPE.HORSE),
          ),
          avt.itemsID,
        );
    }
  }

  public MoveAvatarScene(overview: IOnMovement) {
    if (!overview.id) return;
    const scene = Env.Ins.scenesManager.GetActiveScene() as CanmoveScene;
    const avt = scene.getListAvatar().find((item) => item.id === overview.id);
    if (avt && avt.isLoad) avt.avatar.UpdateAvatar(overview);
    // if (!avt) {
    //   this.OtherAvatarScene(overview);
    // } else {
    //   if (avt.isLoad) avt.avatar.UpdateAvatar(overview);
    // }
  }

  public JumpAvatarScene(data: any) {
    if (!data) return;
    const scene = Env.Ins.scenesManager.GetActiveScene() as CanmoveScene;
    const avt = scene.getListAvatar().find((item) => item.id === data.id);
    if (!avt) {
      console.error('Cant find user in room:', data.id);
    } else {
      if (avt.isLoad) avt.avatar.OnlineJump(data.type);
    }
  }

  public ShootAvatarScene(data: any) {
    if (!data) return;
    const scene = Env.Ins.scenesManager.GetActiveScene() as CanmoveScene;
    const avt = scene.getListAvatar().find((item) => item.id === data.id);
    if (!avt) {
      console.error('Cant find user in room:', data.id);
    } else {
      if (avt.isLoad) avt.avatar.OnlineShoot(data);
    }
  }

  public ArrowAvatarScene(data: IArrowSocketData) {
    if (!data) return;
    const scene = Env.Ins.scenesManager.GetActiveScene() as CanmoveScene;
    scene.arrows.UpdateOnlineArrow(data);
  }

  public RemoveAvatar(id) {
    if (this.mainScene) {
      const item = this.mainScene.getListAvatar().find((c) => c.id === id);
      if (item) {
        item.avatar.Remove();
        this.mainScene.ClearAvatarWithId(id);
      }
    }

    if (this.samuraiScene) {
      const item = this.samuraiScene.getListAvatar().find((c) => c.id === id);
      if (item) {
        item.avatar.Remove();
        this.samuraiScene.ClearAvatarWithId(id);
      }
    }

    if (this.humanScene) {
      const item = this.humanScene.getListAvatar().find((c) => c.id === id);
      if (item) {
        item.avatar.Remove();
        this.humanScene.ClearAvatarWithId(id);
      }
    }

    if (this.storeScene) {
      const item = this.storeScene.getListAvatar().find((c) => c.id === id);
      if (item) {
        item.avatar.Remove();
        this.storeScene.ClearAvatarWithId(id);
      }
    }
  }

  public GetSceneName() {
    return Env.Ins.scenesManager.GetActiveScene().name;
  }

  public ActiveMainScene(pos, prevPos, room, quaternion = null) {
    if (prevPos == null) this.prevPos = new THREE.Vector3();
    this.mainScene = Env.Ins.scenesManager.GetScene(SCENE_NAME.MAIN) as MainScene;
    if (this.mainScene) {
      this.mainScene.ActiveScene(this.globalAvatar, this.globalCharacterCam, this.globalController);
      Env.Ins.scenesManager.SetActiveScene(SCENE_NAME.MAIN);
    } else {
      this.mainScene = new MainScene();
      const avatar = (Env.Ins.scenesManager.GetScene(SCENE_NAME.AVATARS) as AvatarScene)
        .activeAvatar;
      this.globalAvatar = avatar;
      this.globalCharacterCam = this.mainScene.characterCam;
      this.globalController = this.mainScene.controller;
      Env.Ins.scenesManager.AddScene(this.mainScene, true);
      this.mainScene.SetAvatar(this.globalAvatar, prevPos, quaternion);
      this.type = room;
      const activeRoom = () => {
        if (!this.globalAvatar || !this.globalCharacterCam || !this.mainScene.controller) {
          setTimeout(() => {
            activeRoom();
          }, 10);
          return;
        }
        if (room.includes(SCENE_NAME.SAMURAI)) {
          NftBuildings.Ins.GetData().finally(() => {
            const landId = this.type.replace(/^\D+/g, '');
            if (!landId) return;
            const land = this.mainScene.NFTBuilding.GetLandHasHouse().find(
              (item) => item.token_id === +landId,
            );
            const category = NftBuildings.Ins.GetSamuraiBuildingByCategory(
              land.home.metadata.attributes,
            );
            if (NftBuildings.Ins.samuraiSceneData.length > 0) {
              this.ActiveSamuraiScene(
                null,
                NftBuildings.Ins.samuraiSceneData[category === -1 ? 1 : category],
              );
            } else {
              NftBuildings.Ins.loadBuildingFinishCallback = () => {
                this.ActiveSamuraiScene(
                  null,
                  NftBuildings.Ins.samuraiSceneData[category === -1 ? 1 : category],
                );
              };
            }
          });
        }
        if (room.includes(SCENE_NAME.STORE)) {
          this.ActiveStoreScene(null);
        }
        if (room.includes(SCENE_NAME.HUMAN)) {
          this.ActiveHumanScene(null);
        }
      };
      activeRoom();
    }
  }

  public joinRoom(type, category = -1) {
    this.type = type;
    if (type.includes(SCENE_NAME.SAMURAI) || type.includes(SCENE_NAME.STORE)) {
      this.prevPos = { ...this.mainScene.currentUserAvatar.GetPosition() };
      if (type.includes(SCENE_NAME.SAMURAI)) {
        if (category != -1) {
          this.ActiveSamuraiScene(null, NftBuildings.Ins.samuraiSceneData[category]);
        } else {
          this.ActiveSamuraiScene(null, NftBuildings.Ins.samuraiSceneData[1]);
          console.error('Can load inside scene:', category);
        }
      } else this.ActiveStoreScene(null);
      this.socket.emit('room.join', {
        position: this.mainScene.currentUserAvatar.GetPosition(),
        quaternion: this.mainScene.currentUserAvatar.GetQuaternion(),
        action: this.mainScene.currentUserAvatar.GetCurrentActionName(),
        room: type,
      });
    } else if (type.includes(SCENE_NAME.HUMAN)) {
      this.prevPos = { ...this.mainScene.currentUserAvatar.GetPosition() };
      this.ActiveHumanScene(null);
      this.socket.emit('room.join', {
        position: this.mainScene.currentUserAvatar.GetPosition(),
        quaternion: this.mainScene.currentUserAvatar.GetQuaternion(),
        action: this.mainScene.currentUserAvatar.GetCurrentActionName(),
        room: type,
      });
      // start human scene
    } else if (type.includes(SCENE_NAME.MAIN)) {
      this.ActiveMainScene(null, this.prevPos, '0');
      this.mainScene.SetAvatar(this.globalAvatar, this.prevPos);
      this.socket.emit('room.out');
    }
  }

  public ActiveSamuraiScene(pos, sceneInside: SceneInside) {
    this.samuraiScene = Env.Ins.scenesManager.GetScene(SCENE_NAME.SAMURAI) as SamuraiScene;
    if (this.samuraiScene) {
      this.samuraiScene.ActiveSceneWithNewModel(
        sceneInside,
        this.globalAvatar,
        this.globalCharacterCam,
        this.globalController,
      );
      Env.Ins.scenesManager.SetActiveScene(SCENE_NAME.SAMURAI);
    } else {
      if (!this.globalController) this.globalController = this.mainScene.controller;
      this.samuraiScene = new SamuraiScene(
        sceneInside,
        this.globalAvatar,
        this.globalCharacterCam,
        this.globalController || this.mainScene.controller,
      );
      Env.Ins.scenesManager.AddScene(this.samuraiScene, true);
    }
  }

  public ActiveHumanScene(pos) {
    this.humanScene = Env.Ins.scenesManager.GetScene(SCENE_NAME.HUMAN) as HumanScene;
    if (this.humanScene) {
      this.humanScene.ActiveScene(
        this.globalAvatar,
        this.globalCharacterCam,
        this.globalController,
      );
      Env.Ins.scenesManager.SetActiveScene(SCENE_NAME.HUMAN);
    } else {
      if (!this.globalController) this.globalController = this.mainScene.controller;
      this.humanScene = new HumanScene(
        this.globalAvatar,
        this.globalCharacterCam,
        this.globalController || this.mainScene.controller,
      );
      Env.Ins.scenesManager.AddScene(this.humanScene, true);
    }
  }

  public ActiveStoreScene(pos) {
    this.storeScene = Env.Ins.scenesManager.GetScene(SCENE_NAME.STORE) as StoreScene;
    if (this.storeScene) {
      this.storeScene.ActiveScene(
        this.globalAvatar,
        this.globalCharacterCam,
        this.globalController,
      );
      Env.Ins.scenesManager.SetActiveScene(SCENE_NAME.STORE);
    } else {
      if (!this.globalController) this.globalController = this.mainScene.controller;
      this.storeScene = new StoreScene(
        this.globalAvatar,
        this.globalCharacterCam,
        this.globalController || this.mainScene.controller,
      );
      Env.Ins.scenesManager.AddScene(this.storeScene, true);
    }
  }

  public SceneLoader() {
    return Env.Ins.resourcesManager.loadingManager;
  }

  public EmitJump(jumpType: number) {
    this.socket.emit(SOCKET_EVENTS.JUMP, { type: jumpType });
  }

  public EmitShoot(data: any) {
    this.socket.emit(SOCKET_EVENTS.SHOOT, data);
  }

  public EmitArrow(data: any) {
    this.socket.emit(SOCKET_EVENTS.ARROW, data);
  }
}
