import { POPUP } from 'src/constant/constant';
import Popup from '../popups/popup';
import InventoryPopup from '../popups/InventoryPopup';

export default class PopupManager {
  private static _instance?: PopupManager;

  public rootElement: HTMLElement;
  public allPopups: Popup[] = [];

  private inventoryPopup: InventoryPopup;
  constructor() {
    if (PopupManager._instance) throw new Error('Use Singleton.instance instead of new.');
    PopupManager._instance = this;
    this.rootElement = document.createElement('div');
    this.rootElement.classList.add('popupRoot');
    document.body.insertBefore(this.rootElement,document.body.firstChild);
  }
  public static get Ins() {
    return PopupManager._instance ?? (PopupManager._instance = new PopupManager());
  }
  public GetPopup(popupName: string): Popup {
    for (let i = 0; i < this.allPopups.length; i++) {
      console.log(popupName, this.allPopups[i].popupName);
      if (this.allPopups[i].popupName === popupName) {
        return this.allPopups[i];
      }
    }
    console.error('Popup not found!!');
    return null;
  }
  public ShowHidePopup(popupName: string) {
    const popup = this.GetPopup(popupName);
    if (popup) {
      if (popup.showing) {
        popup.ShowPopup(false);
      } else {
        popup.ShowPopup(true);
      }
    }
  }
  public ShowPopup(popupName: string) {
    switch (popupName) {
      case POPUP.INVENTORY:
        if (this.inventoryPopup) {
          this.inventoryPopup.ShowPopup(true);
        } else {
          this.inventoryPopup = new InventoryPopup(this.rootElement);
          this.allPopups.push(this.inventoryPopup);
        }
        return this.inventoryPopup;

      default:
        break;
    }
  }
  public HidePopup(popupName: string) {
    switch (popupName) {
      case POPUP.INVENTORY:
        if (this.inventoryPopup) {
          this.inventoryPopup.ShowPopup(false);
        } else {
          this.inventoryPopup = new InventoryPopup(this.rootElement);
        }
        return this.inventoryPopup;

      default:
        break;
    }
  }
  public CloseAllPopup(){
    this.allPopups.forEach(popup => {
      this.HidePopup(popup.popupName);
    });
  }
}
