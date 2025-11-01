import Env from '../Init3d';
import AvatarMesh from './AvatarMesh';
import avatarData from 'src/data/avatars.json';
import GeneralRepo from 'src/api/general';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';

export default class AvatarManager {
  private static _instance?: AvatarManager;
  public avatarMeshes: AvatarMesh[] = [];

  public skeleton: THREE.Object3D;

  constructor() {
    if (AvatarManager._instance) throw new Error('Use Singleton.instance instead of new.');
    AvatarManager._instance = this;
    // this.InitAvatarMeshes();
  }

  GetAvatarSeketon(callback: any) {
    if (this.skeleton) {
      callback(SkeletonUtils.clone(this.skeleton));
    } else {
      Env.Ins.resourcesManager.LoadGLB('models/avatars/Skeleton.glb', (gltf) => {
        this.skeleton = gltf.scene;
        console.log('skeleton', this.skeleton);
        callback(SkeletonUtils.clone(this.skeleton));
      });
    }
  }

  public static get Ins() {
    return AvatarManager._instance ?? (AvatarManager._instance = new AvatarManager());
  }

  public async InitAvatarMeshes() {
    try {
      const { data } = await GeneralRepo.listAvatar();
      for (let i = 0; i < data.data.length; i++) {
        this.avatarMeshes.push(new AvatarMesh(data.data[i]));
      }
      const resolveData = () => {
        if (this.avatarMeshes.length === data.data.length) {
          return Promise.resolve();
        } else {
          setTimeout(() => {
            resolveData();
          }, 1000);
        }
      };
    } catch (e) {
      console.error(e);
    }
  }

  LoadAvatarMesh(index, callback: any) {
    Env.Ins.resourcesManager.LoadGLB(this.avatarMeshes[index].avatarlink, (gltf) => {
      gltf.scene.traverse((child) => {
        if (child.type == 'SkinnedMesh') {
          child.frustumCulled = false;
          child.material.envMapIntensity = 0; // Don't effect envMap to body
        }
      });
      console.log('avatarmesh', gltf.scene);
      this.avatarMeshes[index].SetMesh(gltf.scene);
      callback(this.avatarMeshes[index]);
    });
  }

  GetAvatarMesh(index: number, callback: any) {
    if (this.avatarMeshes[index].avatarMesh) {
      callback(this.avatarMeshes[index].Clone());
    } else {
      this.LoadAvatarMesh(index, (avatarMesh: AvatarMesh) => {
        callback(avatarMesh.Clone());
      });
    }
  }

  LoadAvatarMeshFormId(id, callback: any) {
    const avatar = this.avatarMeshes.find((avt) => avt.id === id);
    if (!avatar) return;
    Env.Ins.resourcesManager.LoadGLB(avatar.avatarlink, (gltf) => {
      gltf.scene.traverse((child) => {
        if (child.type == 'SkinnedMesh') {
          child.material.envMapIntensity = 0.5; // Don't effect envMap to body
        }
      });
      avatar.SetMesh(gltf.scene);
      callback(avatar);
    });
  }

  GetAvatarMeshFromId(id: number, callback: any) {
    const avatar = this.avatarMeshes.find((avt) => avt.id === id);
    if (!avatar) return;
    if (avatar.avatarMesh) {
      callback(avatar.Clone());
    } else {
      this.LoadAvatarMeshFormId(id, (avatarMesh: AvatarMesh) => {
        callback(avatarMesh.Clone());
      });
    }
  }
}
