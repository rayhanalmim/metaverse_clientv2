import PhysicWorld from '../physic/PhysicWorld';
import * as THREE from 'three';
import { COLLISION_GROUP, LAND_TYPE, RAYLAYER, SCENE_NAME } from 'src/constant/constant';
import IntanceMeshes from 'src/utils/IntanceMeshes';
import App3D from '../App3D';

export default class Building {
  constructor(
    element: any,
    object: IntanceMeshes,
    portal: THREE.Object3D = null,
    physicWorld: PhysicWorld,
    hiddenPortal = false,
    category = -1,
    home = null,
  ) {
    this.physicWorld = physicWorld;
    this.ID = element.landID;
    this.type = element.landType;
    this.category = category;
    this.object = object;
    this.portal = portal;
    this.landMeshParent = element.posObject;
    this.hiddenPortal = hiddenPortal;
    this.home = home;
    if (this.portal) {
      this.portal.userData.building = this;
      this.SetupBuilding(element);
    }
  }

  ID: string;
  type: string;
  address: string;
  object: IntanceMeshes;
  portal: THREE.Object3D;
  portalCollider: THREE.Object3D;
  hiddenPortal: boolean;
  landMeshParent: THREE.Object3D;
  physicWorld: PhysicWorld;
  category: number;
  home: any;

  mainMeshIndex = -1;

  Show(isShow = true) {
    // show building if buyed
    this.object.SetVisible(isShow);
  }

  SetupBuilding(element: any) {
    if (this.object == undefined) {
      console.log('sd');
    }
    this.object.ChangeCount(this.object.count + 1);
    this.mainMeshIndex = this.object.count - 1;

    const matrix = new THREE.Matrix4();
    const pos = new THREE.Vector3();
    const quat = new THREE.Quaternion();
    const scale = new THREE.Vector3();
    this.landMeshParent.matrixWorld.decompose(pos, quat,scale);
    matrix.compose(pos, quat, new THREE.Vector3(1,1,1));

    this.object.SetAtIndex(this.mainMeshIndex, matrix);
    this.object.root.userData.home = this.home;
    if (this.object.root.userData.portal) {
      if (!this.hiddenPortal) {
        this.portalCollider = this.object.root.userData.portal.clone();
        this.landMeshParent.add(this.portal);
        this.landMeshParent.add(this.portalCollider);
        this.portalCollider.position.copy(this.object.root.userData.portal.position);
        this.portal.position.copy(this.portalCollider.position);
        if (this.type == LAND_TYPE.SAMURAI) {
          this.portalCollider.type = SCENE_NAME.SAMURAI;
        } else if (this.type == LAND_TYPE.STORE) {
          this.portalCollider.type = SCENE_NAME.STORE;
        } else if (this.type == LAND_TYPE.HUMAN) {
          this.portalCollider.type = SCENE_NAME.HUMAN;
      }
      this.portalCollider.userData.RAYLAYER = RAYLAYER.PORTAL;
      this.portalCollider.userData.targetScene = this.type + ' Scene ' + this.ID;
      this.portalCollider.userData.category = this.category;
        this.physicWorld.AddInteractableCollider(this.portalCollider as THREE.Mesh, RAYLAYER.PORTAL);
      }
    }
    for (let i = 0; i < this.object.root.userData.colliderMeshes.length; i++) {
      const mesh = this.object.root.userData.colliderMeshes[i].clone();
      this.landMeshParent.add(mesh);
      mesh.RAYLAYER = RAYLAYER.BUILDING;
      mesh.info = this;
      if (element.posObject.userData.sub_type == LAND_TYPE.MAT) {
        mesh.userData.subType = this.landMeshParent.userData.sub_type;
        mesh.userData.home = this.home;
        mesh.scale.set(2.2,1,1);
      }
      if (element.landInfo.home.metadata.attributes.find(
        (c) => c.trait_type === 'Type',
      ).value == LAND_TYPE.ECSITE) {
        mesh.userData.subType = LAND_TYPE.ECSITE;
      }
      this.physicWorld.AddCollider(mesh as THREE.Mesh, RAYLAYER.BUILDING);
    }
  }
  Update() {
    if (this.portal && this.portalCollider) {
      const worldPortalPos = new THREE.Vector3();
      this.portal.getWorldPosition(worldPortalPos);
      const distance = worldPortalPos.distanceTo(App3D.Ins.globalAvatar.GetPosition());
      if (distance < 30) {
        this.portal.visible = true;
        this.portalCollider.userData.active = true;
      }
      else {
        this.portal.visible = false;
        this.portalCollider.userData.active = false;
      }
    }
  }
}
