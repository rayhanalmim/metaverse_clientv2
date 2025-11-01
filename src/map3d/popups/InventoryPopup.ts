import Env from '../Init3d';
import Item from '../items/Item';
import ItemsManager from '../items/ItemsManager';
import NormalItem from '../items/normalItem';
import Popup from './popup';

export default class InventoryPopup extends Popup {
  changeItemCallback: any[] = [];
  shoeElement: HTMLElement;
  bodyElement: HTMLElement;
  maskElement: HTMLElement;
  hatElement: HTMLElement;
  gloveElement: HTMLElement;
  horseElement: HTMLElement;
  bowsElement: HTMLElement;

  constructor(rootElement: HTMLElement) {
    super(rootElement, 'Inventory');
    this.LoadItems();
  }

  LoadItems() {
    this.CreateColum(this.shoeElement, ItemsManager.Ins.shoeItems);
    this.CreateColum(this.bodyElement, ItemsManager.Ins.bodyItems);
    this.CreateColum(this.maskElement, ItemsManager.Ins.maskItems);
    this.CreateColum(this.hatElement, ItemsManager.Ins.hatItems);
    this.CreateColum(this.gloveElement, ItemsManager.Ins.gloveItems);
    this.CreateColum(this.horseElement, ItemsManager.Ins.horseItems);
    this.CreateColum(this.bowsElement, ItemsManager.Ins.bowItems);
    console.log(ItemsManager.Ins.itemsData);
  }

  CreateColum(element: HTMLElement, items: Item[]) {
    element = document.createElement('div');
    element.classList.add('btn-group');
    this.contentElement.appendChild(element);
    items.forEach((item) => {
      this.CreateItem(element, item);
    });
  }

  CreateItem(colume: HTMLElement, item: Item) {
    const btn = document.createElement('button');
    const t = document.createTextNode(item.name);
    const thumb = document.createElement('img');
    thumb.src = item.thumbnail;
    btn.addEventListener('click', (event) => {
      this.OnItemClick(item);
      console.log(item);
    });
    // btn.appendChild(t);
    btn.appendChild(thumb);
    colume.appendChild(btn);
  }

  OnItemClick(item: any) {
    this.changeItemCallback.forEach((callback) => {
      callback(item);
    });
  }

  AddEventChangeItem(callback: any) {
    this.changeItemCallback.push(callback);
  }
}
