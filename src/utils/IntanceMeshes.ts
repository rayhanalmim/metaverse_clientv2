import * as THREE from 'three';
import fa from '@walletconnect/qrcode-modal/dist/cjs/browser/languages/fa';

export default class IntanceMeshes {
  meshes: THREE.InstancedMesh[] = [];
  root: THREE.Object3D;
  count: number;

  constructor(group: THREE.Group, count: number) {
    this.root = new THREE.Object3D();
    this.root.name = group.name;
    const colliderMeshes = [];
    group.traverse((child) => {
      if (child.type == 'Mesh') {
        if (child.userData.isportal == 1) {
          this.root.userData.portal = child;
        } else if (child.userData.isCollider == 1) {
          colliderMeshes.push(child);
        } else {
          const childMesh = child as THREE.Mesh;
          const intanceMesh = new THREE.InstancedMesh(
            childMesh.geometry,
            childMesh.material,
            count,
          );
          intanceMesh.frustumCulled = false;
          intanceMesh.name = child.name;
          this.root.add(intanceMesh);
          this.meshes.push(intanceMesh);
        }
      }
    });
    this.ChangeCount(0);
    this.root.userData.colliderMeshes = colliderMeshes;
  }

  ChangeCount(count: number) {
    this.count = count;
    for (let i = 0; i < this.meshes.length; i++) {
      this.meshes[i].count = count;
    }
  }

  SetAtIndex(index: number, matrixWorld: THREE.Matrix4) {
    for (let i = 0; i < this.meshes.length; i++) {
      this.meshes[i].setMatrixAt(index, matrixWorld);
      this.meshes[i].instanceMatrix.needsUpdate = true;
    }
  }

  SetVisible(show = true) {
    this.root.visible = show;
  }
}
