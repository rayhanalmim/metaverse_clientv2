import itemsData from '../../data/items.json';
import Env from '../Init3d';
import NormalItem from '../items/normalItem';

export default class Popup {
  changeItemCallback: any[] = [];
  showing = true;

  rootElement: HTMLElement;
  mainElement: HTMLElement;
  headerElement: HTMLElement;
  contentElement: HTMLElement;
  closeButton: HTMLButtonElement;

  popupName: string;
  constructor(rootElement: HTMLElement, popupName = '') {
    this.popupName = popupName;

    this.rootElement = rootElement || document.body;
    this.mainElement = document.createElement('div');
    this.mainElement.id = popupName;
    this.mainElement.classList.add('popup');
    this.rootElement.appendChild(this.mainElement);

    this.CreateHeader();
    this.CreateContent();
    this.CreateCloseButton();
    this.SetupDrag();
  }

  CreateHeader() {
    this.headerElement = document.createElement('div');
    this.headerElement.id = 'popupheader';
    this.headerElement.classList.add('popupheader');
    this.headerElement.innerText = this.popupName;
    this.mainElement.appendChild(this.headerElement);
  }
  CreateContent() {
    this.contentElement = document.createElement('div');
    this.contentElement.id = 'popupcontent';
    this.contentElement.classList.add('popupcontent');
    this.mainElement.appendChild(this.contentElement);
  }
  CreateCloseButton() {
    this.closeButton = document.createElement('button');
    this.closeButton.innerText = 'X';
    this.closeButton.classList.add('closebutton');
    this.closeButton.addEventListener('click', (event) => {
      this.ShowPopup(false);
    });
    this.mainElement.appendChild(this.closeButton);
  }
  SetupDrag() {
    let pos1 = 0;
    let pos2 = 0;
    let pos3 = 0;
    let pos4 = 0;
    this.headerElement.onmousedown = (e) => {
      e.preventDefault();
      pos3 = e.clientX;
      pos4 = e.clientY;
      document.onmouseup = (mouseUp) => {
        document.onmouseup = null;
        document.onmousemove = null;
      };
      document.onmousemove = (mouseMove) => {
        mouseMove.preventDefault();
        // calculate the new cursor position:
        pos1 = pos3 - mouseMove.clientX;
        pos2 = pos4 - mouseMove.clientY;
        pos3 = mouseMove.clientX;
        pos4 = mouseMove.clientY;
        // set the element's new position:
        this.mainElement.style.top = this.mainElement.offsetTop - pos2 + 'px';
        this.mainElement.style.left = this.mainElement.offsetLeft - pos1 + 'px';
      };
    };
  }
  LoadItems() {
    // Load content of popup
  }
  ShowPopup(isShow = true) {
    if (isShow) {
      this.mainElement.style.display = 'block';
    } else {
      this.mainElement.style.display = 'none';
    }
    this.showing = isShow;
  }
}
