import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import MapObject from './MapObject';
import MapObject3D from './MapObject3D';
import Settings3D from './Settings3D';

export default class MapBuilder {
  public camera: THREE.PerspectiveCamera;
  public root: THREE.Object3D;
  public objects: THREE.Object3D;
  public lodObjects: THREE.Object3D;
  private link: string;
  private gltfLoader: GLTFLoader;
  public parent: THREE.Object3D;

  private loadedCallback: any;
  public loaded = false;

  public loadedMapObjects: MapObject[];
  private loadingObjects: MapObject[];
  public isMetaMaskBrowser = navigator.userAgent.toLowerCase().includes('metamask');

  constructor(
    parent: THREE.Object3D,
    link: string,
    camera: THREE.PerspectiveCamera,
    gltfLoader: GLTFLoader,
    loadedCallback: any,
  ) {
    this.loadedCallback = loadedCallback;
    this.camera = camera;
    this.root = new THREE.Object3D();
    this.root.name = 'root map';
    this.objects = new THREE.Object3D();
    this.objects.name = 'objects map';
    this.root.add(this.objects);
    this.lodObjects = new THREE.Object3D();
    this.lodObjects.name = 'lod objects map';
    this.root.add(this.lodObjects);
    this.link = link;
    this.gltfLoader = gltfLoader;
    this.loadedMapObjects = [];
    this.parent = parent;
    this.parent.add(this.root);

    this.loadingObjects = [];
    this.LoadMap();
  }

  private LoadMap() {
    this.gltfLoader.load(this.link + 'map.glb', (gltf) => {
      this.root.add(gltf.scene);
      gltf.scene.traverse((child) => {
        child.matrixAutoUpdate = false;
        child.matrixWorldAutoUpdate = false;
        child.updateMatrixWorld();
        if (
          child.userData.glbFile &&
          (child.userData.detailLevel <= Settings3D.Ins.GetHardwareLevel() ||
            child.userData.detailLevel == undefined)
        ) {
          const rootObject = this.GetLoadedMapObject(child.userData.glbFile);
          if (rootObject) {
            const mapObject3D = new MapObject3D(child);
            rootObject.placeholderObjects.push(mapObject3D);
          } else {
            const link = this.link + child.userData.glbFile;
            const linkLOD = this.link + child.userData.glbFile.replace('.glb', '_LOD1.glb');
            const mapObject = new MapObject(
              child.name,
              child.userData.glbFile,
              linkLOD,
              this.gltfLoader,
            );
            const mapObject3D = new MapObject3D(child);
            mapObject.placeholderObjects.push(mapObject3D);
            this.loadedMapObjects.push(mapObject);
            this.loadingObjects.push(mapObject);
            this.gltfLoader.load(link, (object) => {
              mapObject.rootObject = object.scene.children[0] as THREE.Mesh;
              // object.scene.children[0].receiveShadow = true;
              mapObject.CallbackInit(this.objects, this.lodObjects);
              if (this.CheckLoadComplete()) {
                this.loaded = true;
                this.loadedCallback();
              }
            });
          }
        }
      });
    });
  }

  CheckLoadComplete() {
    this.loadedMapObjects.forEach((mapObject) => {
      if (mapObject.loaded == false) {
        return false;
      }
    });
    return true;
  }

  GetLoadedMapObject(link) {
    for (let index = 0; index < this.loadedMapObjects.length; index++) {
      if (link === this.loadedMapObjects[index].link) {
        return this.loadedMapObjects[index];
      }
    }
    return null;
  }

  public UpdateMap(cameraPos: THREE.Vector3) {
    if (this.loadedMapObjects.length > 0) {
      this.camera.getWorldPosition(cameraPos);
      for (let i = 0; i < this.loadedMapObjects.length; i++) {
        this.loadedMapObjects[i].UpdateLOD(cameraPos);
      }
    }
  }
}
