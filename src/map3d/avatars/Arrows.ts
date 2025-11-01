import * as THREE from 'three';
import Environments from '../Init3d';
import BaseAvatar from './BaseAvatar';
import PhysicWorld from '../physic/PhysicWorld';
import Arrow from './Arrow';
import App3D from '../App3D';
import { ARROW_TYPE } from 'src/constant/constant';
import OnlineArrow from './OnlineArrow';
import IArrowSocketData from './IArrowSocketData';

export default class Arrows {
  private arrowMesh: THREE.Mesh;
  private arrowParent: THREE.Object3D;

  private physicWorld: PhysicWorld;
  private date: Date = new Date();

  public listArrow: Arrow[] = [];
  public onlineListArrow: OnlineArrow[] = [];
  constructor(scene: THREE.Scene, physicWorld: PhysicWorld) {
    this.physicWorld = physicWorld;
    this.arrowParent = new THREE.Object3D();
    this.arrowParent.name = 'Arrow Parent';
    scene.add(this.arrowParent);
    this.LoadArrowMesh();
  }

  ChangeScene(scene: THREE.Scene) {
    this.listArrow.forEach((arrow) => {
      this.arrowParent.remove(arrow.mesh);
    });
    this.listArrow = [];
    scene.add(this.arrowParent);
  }

  LoadArrowMesh() {
    Environments.Ins.resourcesManager.LoadGLB('models/things/Arrow.glb', (gltf) => {
      console.log(gltf.scene);
      this.arrowMesh = gltf.scene;
    });
  }

  CreateNewArrow(avatar: BaseAvatar, camera: THREE.PerspectiveCamera): Arrow {
    const arrowMesh = this.arrowMesh.clone();
    const dir = new THREE.Vector3();
    const termPos = new THREE.Vector3();

    this.arrowParent.add(arrowMesh);

    // from hand bone
    // avatar.leftHand.getWorldQuaternion(arrowMesh.quaternion);
    // avatar.leftHand.getWorldDirection(dir);

    // from avatar
    // arrowMesh.quaternion.copy(avatar.GetQuaternionQ());
    // arrowMesh.getWorldDirection(dir);

    // from camera
    camera.getWorldQuaternion(arrowMesh.quaternion);
    camera.getWorldDirection(dir);
    const arrow = new Arrow(
      App3D.Ins.userID + ':' + Date.now() + Math.random(),
      arrowMesh,
      dir,
      arrowMesh.quaternion.clone(),
      avatar,
    );

    avatar.spine.getWorldPosition(arrowMesh.position);

    this.arrowParent.add(avatar.dummyShoot);
    avatar.dummyShoot.position.copy(arrowMesh.position);
    avatar.GetAvatarRoot().attach(avatar.dummyShoot);
    camera.getWorldQuaternion(avatar.dummyShoot.quaternion);
    avatar.dummyShoot.translateOnAxis(new THREE.Vector3(0, 0, -1), 3);

    avatar.dummyShoot.getWorldPosition(termPos);

    let avatarDir = new THREE.Vector3();
    avatarDir = avatar.GetWorldDirection();
    if (dir.angleTo(avatarDir) > 1.6) {
      const p = termPos.clone();
      p.y = avatar.GetRealPosition().y;
      avatar.LookAt(p);
    }
    const oldQua = avatar.spine.quaternion.clone();
    avatar.spine.lookAt(termPos);
    avatar.dummyShoot.quaternion.copy(avatar.spine.quaternion);
    avatar.spine.quaternion.copy(oldQua);
    avatar.bowItem.meshes[0].attach(arrowMesh);
    arrowMesh.position.set(0, 0, 0);
    arrowMesh.rotation.set(-Math.PI / 2, 0, 0);
    arrowMesh.updateMatrixWorld();
    App3D.Ins.EmitArrow({
      type: ARROW_TYPE.START,
      id: arrow.id,
      pos: arrow.GetWorldPos(),
      quat: arrow.GetWorldQuaternion(),
      subMeshQuat: arrow.GetSubObjectQuat(),
    });
    this.listArrow.push(arrow);
    return arrow;
  }
  ForceArrow(arrow: Arrow) {
    this.arrowParent.attach(arrow.mesh);

    const dir = new THREE.Vector3();
    arrow.avatar.dummyShootHelper.getWorldDirection(dir);

    // const arrowShootHelper = new THREE.ArrowHelper();
    // arrowShootHelper.setDirection(dir);
    // Environments.Ins.scenesManager.GetActiveScene().scene.add(arrowShootHelper);
    // arrow.avatar.dummyShootHelper.getWorldPosition(arrowShootHelper.position);

    arrow.avatar.dummyShootHelper.getWorldQuaternion(arrow.mesh.quaternion);
    arrow.mesh.rotateY(-Math.PI / 2);

    arrow.veloc.set(dir.x * 20, dir.y * 20, dir.z * 20);
    arrow.mesh.children[0].rotateY(-Math.PI / 2);
    arrow.force = true;
  }
  UpdateOnlineArrow(data: IArrowSocketData) {
    if (data.type == ARROW_TYPE.START) {
      console.log(data.id, 'Start', data);
      const arrow = new OnlineArrow(data.id, this.arrowMesh.clone(), null, data.quat, null);
      this.arrowParent.add(arrow.mesh);
      arrow.targetPos.x = data.pos.x;
      arrow.targetPos.y = data.pos.y;
      arrow.targetPos.z = data.pos.z;

      arrow.mesh.position.x = data.pos.x;
      arrow.mesh.position.y = data.pos.y;
      arrow.mesh.position.z = data.pos.z;
      arrow.mesh.updateMatrix();
      arrow.mesh.updateMatrixWorld();
      arrow.mesh.matrixWorldNeedsUpdate = true;
      this.onlineListArrow.push(arrow);
    } else if (data.type == ARROW_TYPE.UPDATE || data.type == ARROW_TYPE.FORCE_UPDATE) {
      // console.log(data.id, 'Update', data);

      for (let i = 0; i < this.onlineListArrow.length; i++) {
        if (data.id == this.onlineListArrow[i].id) {
          this.onlineListArrow[i].UpdateSocket(data);
        }
      }
    } else {
      for (let i = 0; i < this.onlineListArrow.length; i++) {
        if (data.id == this.onlineListArrow[i].id) {
          console.log(data.id, 'end', data);

          this.arrowParent.remove(this.onlineListArrow[i].mesh);
          this.onlineListArrow.splice(i, 1);
          return;
        }
      }
    }
  }
  Update(deltaTime: number) {
    for (let i = 0; i < this.listArrow.length; i++) {
      if (this.listArrow[i].force){
       this.listArrow[i].Update(deltaTime, this.physicWorld);
      }
      App3D.Ins.EmitArrow({
        type: this.listArrow[i].force ? ARROW_TYPE.UPDATE : ARROW_TYPE.FORCE_UPDATE,
        id: this.listArrow[i].id,
        pos: this.listArrow[i].GetWorldPos(),
        quat: this.listArrow[i].GetWorldQuaternion(),
        subMeshQuat: this.listArrow[i].GetSubObjectQuat(),
      });

      if (this.listArrow[i].mesh.position.y < -100 || this.listArrow[i].timeToDestroy <= 0) {
        App3D.Ins.EmitArrow({
          type: ARROW_TYPE.END,
          id: this.listArrow[i].id,
          pos: this.listArrow[i].GetPosition(),
          quat: this.listArrow[i].GetWorldQuaternion(),
          subMeshQuat: this.listArrow[i].GetSubObjectQuat(),
        });
        this.arrowParent.remove(this.listArrow[i].mesh);
        this.listArrow.splice(i, 1);
        i = i - 1;
      }
    }
    for (let i = 0; i < this.onlineListArrow.length; i++) {
      this.onlineListArrow[i].Update(deltaTime);
    }
  }
}
