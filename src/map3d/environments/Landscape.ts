import Env from '../Init3d';
import { NodeToyMaterial, NodeToyMaterialData } from '@nodetoy/three-nodetoy';
import * as THREE from 'three';
import {data} from '../shaders/MaterialsBlend.js';
export default class Landscape {
  textures = ['MossyGround', 'WGround', 'CryGround', 'StandRock'];
  landSacpeMat: NodeToyMaterial;
  constructor(parent: THREE.Object3D, groundlink: string, envMap: any) {
    // this.landSacpeMat = new THREE.ShaderMaterial({
    //   uniforms: {
    //     Tex1:{ value: process.env.REACT_APP_API_END_POINT_NOPORT + '/textures/MossyGround/MossyGround_C.jpg'},
    //     Tex2:{ value: process.env.REACT_APP_API_END_POINT_NOPORT + '/textures/WGround/WGround_C.jpg'},
    //     Tex3:{ value: process.env.REACT_APP_API_END_POINT_NOPORT + '/textures/CryGround/CryGround_C.jpg'},
    //     Tex4:{ value: process.env.REACT_APP_API_END_POINT_NOPORT + '/textures/StandRock/StandRock_C.jpg'},
    //     Normal1:{ value: process.env.REACT_APP_API_END_POINT_NOPORT + '/textures/MossyGround/MossyGround_N.jpg'},
    //     Normal2:{ value: process.env.REACT_APP_API_END_POINT_NOPORT + '/textures/WGround/WGround_N.jpg'},
    //     Normal3:{ value:  process.env.REACT_APP_API_END_POINT_NOPORT + '/textures/CryGround/CryGround_N.jpg'},
    //     Normal4:{ value: process.env.REACT_APP_API_END_POINT_NOPORT + '/textures/StandRock/StandRock_N.jpg'},
    //     Roughness1:{ value: process.env.REACT_APP_API_END_POINT_NOPORT + '/textures/MossyGround/MossyGround_R.jpg'},
    //     Roughness2:{ value: process.env.REACT_APP_API_END_POINT_NOPORT + '/textures/WGround/WGround_R.jpg'},
    //     Roughness3:{ value: process.env.REACT_APP_API_END_POINT_NOPORT + '/textures/CryGround/CryGround_R.jpg'},
    //     Roughness4:{ value: process.env.REACT_APP_API_END_POINT_NOPORT + '/textures/StandRock/StandRock_R.jpg'},
    //     AoMap:{ value: process.env.REACT_APP_API_END_POINT_NOPORT + '/textures/MapLightmap.jpg'},
    //     normalScale:{value: new THREE.Vector2(1,1)}
    //   },
    //   vertexShader:shaderData.vertex,
    //   fragmentShader: shaderData.fragment
    // });
    this.landSacpeMat = new NodeToyMaterial();
    this.landSacpeMat.data = data;
    this.landSacpeMat.fog = true;

    Env.Ins.resourcesManager.LoadGLB(groundlink, (gltf) => {
      const land = gltf.scene.children[0];
      land.material = this.landSacpeMat;
      parent.add(gltf.scene);
      gltf.scene.name = 'Landscape';
      // this.LoadMaterials();
      // Env.Ins.resourcesManager.LoadTexture('textures/ft.png', (tex: THREE.Texture) => {
      //   tex.format = THREE.RGBAFormat;
      //   // tex.channel = 1;
      //   tex.wrapS = THREE.RepeatWrapping;
      //   tex.wrapT = THREE.RepeatWrapping;
      //   tex.needsPMREMUpdate = true;
      //   tex.needsUpdate = true;
      //   tex.matrixAutoUpdate = true;
      //   // (this.landSacpeMat as any).aoMap = tex;
      //   // (this.landSacpeMat as any).lightMap = tex;
      //   // this.landSacpeMat.uniforms['AoMap'].value = tex;
      //   // this.landSacpeMat.uniforms['lightMap'].value = tex;
      // console.log('landspca1', tex);

      // NodeToyMaterial.tick();

      // });
      NodeToyMaterial.tick();
    });
  }
  LoadMaterials() {
    for (let i = 0; i < this.textures.length; i++) {
      this.LoadTexture(
        'Tex',
        'textures/' + this.textures[i] + '/' + this.textures[i] + '_C.jpg',
        i,
      );
      this.LoadTexture(
        'Normal',
        'textures/' + this.textures[i] + '/' + this.textures[i] + '_N.jpg',
        i,
      );
      this.LoadTexture(
        'Roughness',
        'textures/' + this.textures[i] + '/' + this.textures[i] + '_R.jpg',
        i,
      );
    }
  }
  LoadTexture(key: string, link: string, index) {
    console.log('lands', key, link, index);
    Env.Ins.resourcesManager.LoadTexture(link, (tex) => {
      tex.format = THREE.RGBAFormat;
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      this.landSacpeMat.uniforms[key + (index + 1)].value = tex;
    });
  }
}
