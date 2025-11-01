import Item from './Item';

export default class NormalItem extends Item {
  constructor(itemData: any) {
    super(itemData);
  }

  public skinnedMeshes: THREE.SkinnedMesh[] = [];
  public meshes: THREE.Mesh[] = [];

  public SetMesh(meshes: THREE.Mesh[], skinnedMeshes: THREE.SkinnedMesh[]){
    this.meshes = meshes;
    this.skinnedMeshes = skinnedMeshes;
  }
  public RemoveFromAvatar() {
    this.skinnedMeshes.forEach((mesh) => {
      mesh.parent?.remove(mesh);
    });
    this.meshes.forEach((mesh) => {
      mesh.parent?.remove(mesh);
    });
  }
  protected CloneProperties(from: NormalItem, to:NormalItem){
    super.CloneProperties(from,to);
    to.loaded = from.loaded;
  }
  public Clone(): NormalItem {
    const _item = new NormalItem(this.itemData);
    this.meshes.forEach(mesh => {
      _item.meshes.push(mesh.clone())
    });
    this.skinnedMeshes.forEach(skinnedMesh => {
      _item.skinnedMeshes.push(skinnedMesh.clone())
    });
    this.CloneProperties(this, _item);
    return _item;
  }
}
