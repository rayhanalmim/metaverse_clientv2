import * as THREE from 'three';
export default class MapObject3D{
    constructor(object3D: THREE.Object3D){
        this.object3D = object3D;
    }
    public instanceIndex: number;
    public distance: number;
    public object3D: THREE.Object3D;
}