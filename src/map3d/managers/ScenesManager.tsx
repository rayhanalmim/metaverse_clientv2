import { Tween } from '@tweenjs/tween.js';
import * as THREE from 'three';
import MScene from '../scenes/Scene';
import PopupManager from './PopupManagers';
import { SCENE_NAME } from 'src/constant/constant';

export default class ScenesManager {
  private scenes: MScene[] = [];
  private activeScene: MScene;
  private MAX_EXPROSURE: number;
  private TRANSITION_TIME: number;

  constructor() {
    this.activeScene = null;
    this.MAX_EXPROSURE = 100;
    this.TRANSITION_TIME = 500;
    window.addEventListener('resize', () => {
      this.onWindowResize();
    });
    window.addEventListener(
      'orientationchange',
      () => {
        this.onWindowResize();
      },
      false,
    );
    // if (document.addEventListener) {
    //   document.addEventListener(
    //     'fullscreenchange',
    //     () => {
    //       this.ExitFullScreenMode();
    //     },
    //     false,
    //   );
    //   document.addEventListener(
    //     'mozfullscreenchange',
    //     () => {
    //       this.ExitFullScreenMode();
    //     },
    //     false,
    //   );
    //   document.addEventListener(
    //     'MSFullscreenChange',
    //     () => {
    //       this.ExitFullScreenMode();
    //     },
    //     false,
    //   );
    //   document.addEventListener(
    //     'webkitfullscreenchange',
    //     () => {
    //       this.ExitFullScreenMode();
    //     },
    //     false,
    //   );
    // }
  }

  public AddScene(mScene: MScene, isSetActive = false) {
    this.scenes.push(mScene);
    if (isSetActive) {
      this.SetActiveScene(mScene.name);
    }
  }

  public GetScene(sceneName: string) {
    for (let i = 0; i < this.scenes.length; i++) {
      if (this.scenes[i].name == sceneName) {
        return this.scenes[i];
      }
    }
    return null;
  }

  public GetActiveScene(): MScene {
    return this.activeScene;
  }

  public SetActiveScene(sceneName: string) {
    for (let i = 0; i < this.scenes.length; i++) {
      if (this.scenes[i].name == sceneName) {
        this.ActiveScene(this.scenes[i]);
        return;
      }
    }
    console.error('Cant find scene: ', sceneName);
  }

  public Update(deltaTime: number) {
    if (this.activeScene) this.activeScene.Update(deltaTime);
  }

  private ActiveScene(scene: MScene, closeAllPopup = true) {
    if (this.activeScene) {
      this.activeScene.renderer.domElement.style.display = 'none';
      this.activeScene = scene;
      this.ShowActiveScene();
    } else {
      this.activeScene = scene;
      this.ShowActiveScene();
    }
    this.activeScene.onWindowResize();
    if (closeAllPopup) {
      PopupManager.Ins.CloseAllPopup();
    }
  }

  private ShowActiveScene() {
    this.activeScene.renderer.domElement.style.display = 'block';
  }

  private onWindowResize() {
    this.activeScene.onWindowResize();
  }

  FullScreenMode() {
    const elem: any = this.activeScene.renderer.domElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) {
      /* Safari */
      elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) {
      /* IE11 */
      elem.msRequestFullscreen();
    }
    this.onWindowResize();
  }

  ExitFullScreenMode() {
    console.log('exit full screen');
    this.onWindowResize();
  }
}
