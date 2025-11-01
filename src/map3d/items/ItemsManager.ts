import Env from '../Init3d';
import itemsData from '../../data/items.json';
import NormalItem from './normalItem';
import { HORSE_BONE, ITEM_TYPE } from 'src/constant/constant';
import HorseItem from './HorseItem';
import Item from './Item';

export default class ItemsManager {
  private static _instance?: ItemsManager;
  public itemsData = itemsData;
  hatItems: NormalItem[] = [];
  maskItems: NormalItem[] = [];
  bodyItems: NormalItem[] = [];
  gloveItems: NormalItem[] = [];
  shoeItems: NormalItem[] = [];
  horseItems: HorseItem[] = [];
  bowItems: NormalItem[] = [];
  allItems: Item[] = [];

  horseAnimations: THREE.AnimationClip[] = [];

  constructor() {
    if (ItemsManager._instance) throw new Error('Use Singleton.instance instead of new.');
    ItemsManager._instance = this;
    this.InitItems();
  }

  public static get Ins() {
    return ItemsManager._instance ?? (ItemsManager._instance = new ItemsManager());
  }

  InitItems() {
    this.InitItemType(this.hatItems, itemsData.hats);
    this.InitItemType(this.maskItems, itemsData.masks);
    this.InitItemType(this.bodyItems, itemsData.bodys);
    this.InitItemType(this.gloveItems, itemsData.gloves);
    this.InitItemType(this.shoeItems, itemsData.shoes);
    this.InitItemType(this.bowItems, itemsData.bows);

    for (let i = 0; i < itemsData.horses.length; i++) {
      const _item = new HorseItem(itemsData.horses[i]);
      this.horseItems.push(_item);
    }

    this.allItems = [
      ...this.bodyItems,
      ...this.hatItems,
      ...this.maskItems,
      ...this.gloveItems,
      ...this.shoeItems,
      ...this.horseItems,
      ...this.bowItems,
    ];
  }

  InitItemType(items: Item[], itemsData: any) {
    for (let i = 0; i < itemsData.length; i++) {
      const _item = new NormalItem(itemsData[i]);
      items.push(_item);
    }
  }

  LoadItem(item: NormalItem, callback: any) {
    Env.Ins.resourcesManager.LoadGLB(item.link, (gltf) => {
      gltf.scene.traverse((child) => {
        if (child.type == 'SkinnedMesh') {
          child.frustumCulled = false;
          item.skinnedMeshes.push(child);
        } else if (child.type == 'Mesh') {
          item.meshes.push(child);
        }
        item.loaded = true;
      });
      callback(item);
    });
  }

  LoadHorse(horseItem: HorseItem, callback: any) {
    Env.Ins.resourcesManager.LoadGLB(horseItem.link, (gltf) => {
      horseItem.mesh = gltf.scene;
      this.horseAnimations = gltf.animations;
      horseItem.loaded = true;
      horseItem.rideBone = gltf.scene.children[0].getObjectByName(HORSE_BONE.RIDE_BONE);
      callback(horseItem);
    });
  }

  GetItemMesh(item: Item, callback: any) {
    if (item.loaded) {
      callback(item.Clone());
    } else {
      if (item.type == ITEM_TYPE.HORSE) {
        this.LoadHorse(item as HorseItem, (item: Item) => {
          callback(item.Clone());
        });
      } else {
        this.LoadItem(item as NormalItem, (item: Item) => {
          callback(item.Clone());
        });
      }
    }
  }

  GetItemByID(id: number, items: NormalItem[]): NormalItem {
    for (let i = 0; i < items.length; i++) {
      if (items[i].id == id) {
        return items[i];
      }
    }
  }

  GetItemByName(name: string, items: Item[]): Item {
    for (let i = 0; i < items.length; i++) {
      if (items[i].name == name) {
        return items[i];
      }
    }
  }

  GetItemByLink(link: string, items: Item[]): Item {
    for (let i = 0; i < items.length; i++) {
      if (items[i].link == link) {
        return items[i];
      }
    }
  }

  GetItemById(id: number) {
    return this.allItems.find((item) => item.id === id);
  }

  GetItemByType(link: string, type: string) {
    switch (type) {
      case ITEM_TYPE.BODY:
        return this.GetItemByLink(link, this.bodyItems);
      case ITEM_TYPE.HAT:
        return this.GetItemByLink(link, this.hatItems);
      case ITEM_TYPE.MASK:
        return this.GetItemByLink(link, this.maskItems);
      case ITEM_TYPE.GLOVE:
        return this.GetItemByLink(link, this.gloveItems);
      case ITEM_TYPE.SHOE:
        return this.GetItemByLink(link, this.shoeItems);
      case ITEM_TYPE.HORSE:
        return this.GetItemByLink(link, this.horseItems);
      case ITEM_TYPE.BOW:
        return this.GetItemByLink(link, this.bowItems);
      default:
        break;
    }
  }
}
