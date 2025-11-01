import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { SetupObject } from 'src/utils/ObjectUtils';

export default class ResourcesManager {
  public loadingManager: THREE.LoadingManager;
  private gltfLoader: GLTFLoader;
  private textureLoader: THREE.TextureLoader;
  private rgbeLoader: RGBELoader;
  private dracoLoader: DRACOLoader;

  public envMap: THREE.Texture;

  constructor() {
    this.loadingManager = new THREE.LoadingManager();
    this.dracoLoader = new DRACOLoader();
    this.dracoLoader.setDecoderPath('gltf/');
    this.dracoLoader.preload();
    this.gltfLoader = new GLTFLoader(this.loadingManager);
    this.gltfLoader.setDRACOLoader(this.dracoLoader);
    this.textureLoader = new THREE.TextureLoader(this.loadingManager);
    this.rgbeLoader = new RGBELoader(this.loadingManager);
  }

  public LoadGLB(url: string, onLoadFinish: any) {
    this.gltfLoader.load(
      url,
      (gltf) => {
        onLoadFinish(gltf);
      },
      null,
      (e) => {
        console.error('Load glb error', url, e);
      },
    );
  }

  public LoadTexture(url: string, onLoadFinish: any) {
    this.textureLoader.load(
      url,
      (texture) => {
        onLoadFinish(texture);
      },
      null,
      (e) => {
        console.error('Load textures error', url, e);
      },
    );
  }

  public LoadRGBETexture(url: string, onLoadDinish: any) {
    this.rgbeLoader.load(
      url,
      (texture) => {
        this.envMap = texture;
        onLoadDinish(texture);
      },
      null,
      (e) => {
        console.error('Load rgbe texture error', url, e);
      },
    );
  }

  public GetGLTFLoader() {
    return this.gltfLoader;
  }
}
