import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import MapObject3D from './MapObject3D';
import Settings3D from './Settings3D';
import { HARDWARE_LEVEL } from 'src/constant/constant';

export default class MapObject {
  public name: string;
  public link: string;
  public lodLink: string;
  public object: THREE.InstancedMesh;
  public rootObject: THREE.Mesh;
  public lodObject: THREE.InstancedMesh;
  public rootLodObject: THREE.Mesh;
  public placeholderObjects: MapObject3D[];
  public maxCount: number;
  public maxLODCount: number;
  public useLOD: boolean;
  public hideMatrix: THREE.Matrix4;

  public loaded: boolean;

  private gltfLoader: GLTFLoader;

  constructor(name: string, link: string, lodLink: string, gltfLoader: GLTFLoader) {
    this.name = name;
    this.link = link;
    this.lodLink = lodLink;
    this.object = null;
    this.rootObject = null;
    this.lodObject = null;
    this.rootLodObject = null;
    this.placeholderObjects = [];
    this.maxCount = 3;
    this.useLOD = true;

    this.gltfLoader = gltfLoader;

    this.hideMatrix = new THREE.Matrix4();
    this.hideMatrix.makeScale(0, 0, 0);

    this.loaded = false;
  }

  CallbackInit(parent: THREE.Object3D, LodParent: THREE.Object3D) {
    if (this.placeholderObjects.length > 1) {
      if (this.useLOD) {
        this.maxCount = Math.floor(this.placeholderObjects.length / 5);
        if (this.maxCount == 0) this.maxCount = 1;

        // this.maxLODCount = Math.floor((this.placeholderObjects.length - this.maxCount) / 3);
        this.maxLODCount = Math.floor(
          (this.placeholderObjects.length - this.maxCount) *
            (1 / (4 - Settings3D.Ins.GetHardwareLevel())),
        );

        if (this.maxLODCount == 0)
          this.maxLODCount = this.placeholderObjects.length - this.maxCount;
        // console.log(this.name, this.placeholderObjects.length, this.maxCount, this.maxLODCount);
      } else {
        // console.log('Init Mat 2222!');
        this.maxCount = this.placeholderObjects.length;
      }

      if (Settings3D.Ins.GetHardwareLevel() == HARDWARE_LEVEL.LOW) {
        const basicMat = new THREE.MeshBasicMaterial();
        THREE.MeshBasicMaterial.prototype.copy.call(basicMat, this.rootObject.material);
        this.rootObject.material = basicMat;
      }

      this.object = new THREE.InstancedMesh(
        this.rootObject.geometry,
        this.rootObject.material,
        this.maxCount,
      );
      this.object.frustumCulled = false;
      this.object.name = this.name;
      // console.log(this.object.name, this.object, this.maxCount);
      parent.add(this.object);
      for (let i = 0; i < this.maxCount; i++) {
        this.object.setMatrixAt(i, this.placeholderObjects[i].object3D.matrixWorld);
      }
      if (this.useLOD) {
        try {
          this.gltfLoader.load(
            this.lodLink,
            (object) => {
              this.rootLodObject = object.scene.children[0] as THREE.Mesh;
              this.rootLodObject.material = this.rootObject.material;
              this.InitLOD(LodParent);
              this.loaded = true;
            },
            null,
            () => {
              this.useLOD = false;
              this.loaded = true;
              console.log('ERROR LOAD LOD', this.name);
            },
          );
        } catch (err) {
          this.useLOD = false;
          this.loaded = true;
          console.log('ERROR LOAD LOD111', this.name);
        }
      } else {
        this.loaded = true;
      }
    } else {
      parent.add(this.rootObject);
    }
  }

  InitLOD(LodParent: THREE.Object3D) {
    // console.log('InitLOD', this.name);
    this.lodObject = new THREE.InstancedMesh(
      this.rootLodObject.geometry,
      this.rootLodObject.material,
      this.maxLODCount,
    );
    this.lodObject.name = this.name + '_LOD1';
    this.lodObject.matrixAutoUpdate = false;
    this.lodObject.matrixWorldAutoUpdate = false;
    this.lodObject.frustumCulled = false;
    LodParent.add(this.lodObject);
    for (let i = 0; i < this.placeholderObjects.length; i++) {
      this.lodObject.setMatrixAt(i, this.placeholderObjects[i].object3D.matrixWorld);
      this.placeholderObjects[i].instanceIndex = i;
    }
  }

  UpdateLOD(cameraPos) {
    if (this.useLOD && this.lodObject) {
      for (let i = 0; i < this.placeholderObjects.length; i++) {
        this.placeholderObjects[i].distance = cameraPos.distanceTo(
          this.placeholderObjects[i].object3D.position,
        );
      }
      this.placeholderObjects.sort((a, b) => a.distance - b.distance);
      for (let i = 0; i < this.placeholderObjects.length; i++) {
        if (i < this.maxCount) {
          this.object.setMatrixAt(i, this.placeholderObjects[i].object3D.matrixWorld);
          // this.lodObject.setMatrixAt(this.placeholderObjects[i].instanceIndex, this.hideMatrix);
        } else {
          this.lodObject.setMatrixAt(
            i - this.maxCount,
            this.placeholderObjects[i].object3D.matrixWorld,
          );
        }
      }
      this.lodObject.instanceMatrix.needsUpdate = true;
      this.object.instanceMatrix.needsUpdate = true;
    }
  }
}
