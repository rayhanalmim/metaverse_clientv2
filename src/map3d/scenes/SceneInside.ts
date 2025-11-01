import PhysicWorld from '../physic/PhysicWorld';

export default class SceneInside{
    public scene: THREE.Scene;
    public physicWorld: PhysicWorld;
    public linkModel: string;
    public linkPhysic: string;
    public linkNav: string;
    public portalPos: THREE.Vector3;
    constructor(linkModel: string, linkPhysic: string, linkNav: string, portalPos: THREE.Vector3 = null, scene: THREE.Scene = null, physicWorld: PhysicWorld = null){
        this.scene = scene;
        this.physicWorld = physicWorld;
        this.linkModel = linkModel;
        this.linkPhysic = linkPhysic;
        this.linkNav = linkNav;
        this.portalPos = portalPos;
    }
}