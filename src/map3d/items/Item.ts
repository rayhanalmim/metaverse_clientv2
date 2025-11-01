export default class Item {
  constructor(itemData: any) {
    this.name = itemData.name;
    this.id = itemData.id;
    this.link = itemData.link;
    this.thumbnail = itemData.thumbnail;
    this.sex = itemData.sex;
    this.type = itemData.type;
    this.partsHided = itemData.partsHided;
    this.itemData = itemData;
    this.jumpHeight = itemData.stat_jump;
    if (itemData.stat_move)
      this.moveSpeed = itemData.stat_move;
    else {
      this.moveSpeed = 0;
    }
  }

  public itemData: any;

  public name: string;
  public id: number;
  public link: string;
  public thumbnail: string;
  public sex: number;
  public type: string;
  public partsHided: string;
  public loaded = false;
  public jumpHeight = 0;
  public moveSpeed = 0;
  RemoveFromAvatar(): void {
    // Remove mesh from avatar
  }
  Clone(): void {
    // Remove mesh from avatar
  }
  protected CloneProperties(from: Item, to: Item) {
    to.sex = from.sex;
    to.name = from.name;
    to.id = from.id;
    to.link = from.link;
    to.thumbnail = from.thumbnail;
    to.type = from.type;
    to.partsHided = from.partsHided;
    to.jumpHeight = from.jumpHeight;
    to.itemData = from.itemData;
  }
}
