
import * as THREE from 'three';
export default interface IArrowSocketData{
    type: number;
    id: string;
    pos: THREE.Vector3;
    quat: THREE.Quaternion;
    subMeshQuat: THREE.Quaternion;
}