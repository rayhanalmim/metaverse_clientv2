import ResourcesManager from './managers/ResourceManager';
import * as THREE from 'three';
import TWEEN from '@tweenjs/tween.js';
import Stats from 'three/examples/jsm/libs/stats.module';
import ScenesManager from './managers/ScenesManager';
import AnimationsManager from './managers/AnimationsManager';
import UIBridge from './uiBridge/UIBridge';
import DebugUI from './debug/debugUI';
import { NODE_ENV } from '../config';

export default class Environments {
  private static _instance?: Environments;

  // debug
  public stats: any = Stats();
  public debugUI: DebugUI;
  public container3d = document.getElementById('webgl_container');
  public containerAvatar = document.getElementById('avatar-scene-container');

  public resourcesManager: ResourcesManager;
  public scenesManager: ScenesManager;
  public animationsManager: AnimationsManager;
  public uiBridge: UIBridge;
  public clock: THREE.Clock;
  public deltaTime = 0;

  public updateFuntions: any[] = [];

  private constructor() {
    console.log('Init 3d App !!!');
    if (Environments._instance) throw new Error('Use Singleton.instance instead of new.');
    Environments._instance = this;
    if (NODE_ENV !== 'prod') this.container3d?.appendChild(this.stats.dom);
    // this.debugUI = new DebugUI();

    this.resourcesManager = new ResourcesManager();
    this.scenesManager = new ScenesManager();
    this.uiBridge = new UIBridge();
    this.clock = new THREE.Clock();

    // const fullScreenButton = document.createElement('button');
    // document.body.appendChild(fullScreenButton);
    // fullScreenButton.style.position = 'absolute';
    // fullScreenButton.style.top = '5%';
    // fullScreenButton.style.left = '50%';
    // fullScreenButton.style.transform = 'translate(-50%, -50%)';
    // fullScreenButton.style.zIndex = '10';
    // fullScreenButton.innerText = 'Full';
    // fullScreenButton.style.height = '50px';
    // fullScreenButton.style.width = '50px';
    // fullScreenButton.addEventListener('click',()=>{
    //   this.scenesManager.FullScreenMode();
    // })
    this.animate();
  }

  public static get Ins() {
    return Environments._instance ?? (Environments._instance = new Environments());
  }

  public LoadAnimation(callback) {
    this.animationsManager = new AnimationsManager('models/avatars/Animations.glb', () => {
      callback();
    });
  }

  public AddUpdateFunction(func: any) {
    this.updateFuntions.push(func);
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    this.deltaTime = this.clock.getDelta();
    if (NODE_ENV !== 'prod') this.stats.update();
    TWEEN.update();
    this.updateFuntions.forEach((func) => {
      func(this.deltaTime);
    });
    this.scenesManager?.Update(this.deltaTime);
    this.animationsManager?.Update(this.deltaTime);
  }
}
