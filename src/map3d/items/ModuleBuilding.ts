import IntanceMeshes from 'src/utils/IntanceMeshes';
import PhysicWorld from '../physic/PhysicWorld';
import Building from './Building';
import NftBuildings from './Buildings';

export default class ModuleBuilding extends Building {
  constructor(
    element: any,
    object: IntanceMeshes,
    portal: THREE.Object3D = null,
    physicWorld: PhysicWorld,
    hiddenPortal = false,
    attribute: any,
  ) {
    super(element, object, portal, physicWorld, hiddenPortal);
    attribute.forEach(element => {
      if(element.trait_type.includes('Attribute_')){
        this.LoadModule(element.value);
      }
    });
  }
  LoadModule(moduleName: string){
    this.landMeshParent.add(NftBuildings.Ins.GetModule(moduleName));
  }
}
