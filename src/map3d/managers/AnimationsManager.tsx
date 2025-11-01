import * as THREE from 'three';
import { AvatarAction } from 'src/constant/constantClass';
import Env from '../Init3d';
import { BONE, CLIP_NAMES } from 'src/constant/constant';

export default class AnimationsManager {
  private idleClip: THREE.AnimationClip;
  private idle1Clip: THREE.AnimationClip;
  private idle2Clip: THREE.AnimationClip;
  private idle3Clip: THREE.AnimationClip;
  private idle4Clip: THREE.AnimationClip;
  private walkClip: THREE.AnimationClip;
  private runClip: THREE.AnimationClip;
  private jumpClip: THREE.AnimationClip;
  private TPoseClip: THREE.AnimationClip;

  public shootClip: THREE.AnimationClip;

  private horseIdleClip: THREE.AnimationClip;
  private horseCanterClip: THREE.AnimationClip;
  private horseJumpClip: THREE.AnimationClip;
  private horseWalkClip: THREE.AnimationClip;

  private animationClips: THREE.AnimationClip[];

  public mixeres: THREE.AnimationMixer[] = [];
  public upperBodyFilterBones = '';

  constructor(animationlink: string, callback: any) {
    Env.Ins.resourcesManager.LoadGLB(animationlink, (gltf) => {
      console.log('Animation', gltf);
      const leftLeg = gltf.scene.children[0].children[0].children[1];
      const rightLeg = gltf.scene.children[0].children[0].children[2];
      leftLeg.traverse((child) => {
        this.upperBodyFilterBones += '_' + child.name;
      });
      rightLeg.traverse((child) => {
        this.upperBodyFilterBones += '_' + child.name;
      });
      this.upperBodyFilterBones += '_' + BONE.ROOT;
      this.SetupAnimations(gltf);
      callback();
    });
  }
  SetupAnimations(gltf) {
    this.animationClips = gltf.animations;
    this.animationClips.forEach((clip) => {
      switch (clip.name) {
        case CLIP_NAMES.IDLE:
          this.idleClip = clip;
          break;
        case CLIP_NAMES.IDLE_1:
          this.idle1Clip = clip;
          break;
        case CLIP_NAMES.IDLE_2:
          this.idle2Clip = clip;
          break;
        case CLIP_NAMES.IDLE_3:
          this.idle3Clip = clip;
          break;
        case CLIP_NAMES.IDLE_4:
          this.idle4Clip = clip;
          break;
        case CLIP_NAMES.RUN:
          this.runClip = clip;
          break;
        case CLIP_NAMES.WALK:
          this.walkClip = clip;
          break;
        case CLIP_NAMES.JUMP:
          this.jumpClip = clip;
          break;
        case CLIP_NAMES.TPOSE:
          this.TPoseClip = clip;
          break;
        case CLIP_NAMES.H_IDLE:
          this.horseIdleClip = clip;
          break;
        case CLIP_NAMES.H_WALK:
          this.horseWalkClip = clip;
          break;
        case CLIP_NAMES.H_RUN:
          this.horseCanterClip = clip;
          break;
        case CLIP_NAMES.H_JUMP:
          this.horseJumpClip = clip;
          break;
        case CLIP_NAMES.SHOOT:
          this.shootClip = clip;
          break;
      }
    });
  }
  public GetClip(clipName: string) {
    switch (clipName) {
      case CLIP_NAMES.IDLE:
        return this.idleClip;
      case CLIP_NAMES.IDLE_1:
        return this.idle1Clip;
      case CLIP_NAMES.IDLE_2:
        return this.idle2Clip;
      case CLIP_NAMES.IDLE_3:
        return this.idle3Clip;
      case CLIP_NAMES.IDLE_4:
        return this.idle4Clip;
      case CLIP_NAMES.RUN:
        return this.runClip;
      case CLIP_NAMES.WALK:
        return this.walkClip;
      case CLIP_NAMES.JUMP:
        return this.jumpClip;
      case CLIP_NAMES.TPOSE:
        return this.TPoseClip;
      case CLIP_NAMES.H_IDLE:
        return this.horseIdleClip;
      case CLIP_NAMES.H_WALK:
        return this.horseWalkClip;
      case CLIP_NAMES.H_RUN:
        return this.horseCanterClip;
      case CLIP_NAMES.H_JUMP:
        return this.horseJumpClip;
      case CLIP_NAMES.SHOOT:
        return this.shootClip;
    }
  }

  public addAnimation(mixer: THREE.AnimationMixer) {
    this.mixeres.push(mixer);
  }
  public Update(deltaTime: number) {
    this.mixeres.forEach((mixer) => {
      mixer.update(deltaTime);
    });
  }
}
