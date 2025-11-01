import { RAYLAYER } from 'src/constant/constant';
import Environments from '../Init3d';
import * as THREE from 'three';

export default class PhysicWorld {
  public colliderParent: THREE.Object3D;
  public envColliderParent: THREE.Object3D;
  public interactableColliderParent: THREE.Object3D;

  public defaultMat: THREE.MeshBasicMaterial;

  public name: string;
  public navMesh: THREE.Mesh;

  constructor(link: string, scene: THREE.Scene) {
    this.defaultMat = new THREE.MeshBasicMaterial({
      color: 0x00ff00,
      wireframe: true,
      side: THREE.FrontSide,
    });
    this.name = link;
    Environments.Ins.resourcesManager.LoadGLB(link, (gltf) => {
      gltf.name = 'PhysicsWalls_lv1';
      console.log('physic', gltf.scene);
      gltf.scene.traverse((child) => {
        if (child.type == 'Mesh') {
          child.layers.enable(RAYLAYER.ENVIRONMENT);
          this.SetupCollider(child);
        }
      });
      this.envColliderParent.attach(gltf.scene);
    });

    this.colliderParent = new THREE.Object3D();
    this.colliderParent.name = 'Collider Parent';
    scene.add(this.colliderParent);

    this.envColliderParent = new THREE.Object3D();
    this.envColliderParent.name = 'Env Collider Parent';
    this.colliderParent.add(this.envColliderParent);

    this.interactableColliderParent = new THREE.Object3D();
    this.interactableColliderParent.name = 'Objects Collider Parent';
    this.colliderParent.add(this.interactableColliderParent);
  }

  public AddNAV(mesh: THREE.Mesh) {
    this.SetupCollider(mesh);
    this.navMesh = mesh;
    this.colliderParent.add(mesh);
  }

  public AddCollider(mesh: THREE.Mesh, layer: number) {
    mesh.layers.enable(layer);
    mesh.userData.RAYLAYER = layer;
    this.SetupCollider(mesh);
    this.envColliderParent.attach(mesh);
  }

  public AddInteractableCollider(mesh: THREE.Object3D, layer: number, isRender = false) {
    mesh.layers.enable(layer);
    mesh.userData.RAYLAYER = layer;
    this.SetupCollider(mesh, isRender);
    this.interactableColliderParent.attach(mesh);
  }

  private SetupCollider(mesh: THREE.Object3D, isRender = false) {
    if (isRender) {
      mesh.visible = true;
    } else {
      (mesh as THREE.Mesh).material = this.defaultMat;
      mesh.visible = false;
    }
  }
}
