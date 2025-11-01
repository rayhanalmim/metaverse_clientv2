import * as THREE from 'three';
export default class RenderSettings{
    public renderer: THREE.WebGLRenderer;
    constructor(){
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.outputEncoding = THREE.sRGBEncoding;
    }
}