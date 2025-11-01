import { MOUSE_EVENT_TYPE, UIID } from '../../constant/constant';

export default class UIBridge {
  public btnEnter: HTMLElement;
  public fpsUI: HTMLElement;
  constructor() {
    this.btnEnter = document.getElementById('tbnEnter');
    this.fpsUI = document.getElementById(UIID.FPS_UI);
    this.InitFunctions();
  }
  private InitFunctions() {
    // this.btnEnter.addEventListener("click", ()=>{
    // });
  }
  public ChangeText(id: string, text: string) {
    const target = document.getElementById(id);
    if (target) target.innerHTML = text;
  }
  public BindEvent(id: string, eventType: string, func: any) {
    const target = document.getElementById(id);
    if (target) {
      switch (eventType) {
        case MOUSE_EVENT_TYPE.CLICK:
          target.onclick = (e) => {
            func(e);
          };
          break;
        case MOUSE_EVENT_TYPE.CMENU:
          target.oncontextmenu = (e) => {
            func(e);
          };
          break;
        case MOUSE_EVENT_TYPE.DBCLICK:
          target.ondblclick = (e) => {
            func(e);
          };
          break;
        case MOUSE_EVENT_TYPE.DOWN:
          target.onmousedown = (e) => {
            func(e);
          };
          break;
        case MOUSE_EVENT_TYPE.ENTER:
          target.onmouseenter = (e) => {
            func(e);
          };
          break;
        case MOUSE_EVENT_TYPE.LEAVE:
          target.onmouseleave = (e) => {
            func(e);
          };
          break;
        case MOUSE_EVENT_TYPE.MOVE:
          target.onmousemove = (e) => {
            func(e);
          };
          break;
        case MOUSE_EVENT_TYPE.OUT:
          target.onmouseout = (e) => {
            func(e);
          };
          break;
        case MOUSE_EVENT_TYPE.OVER:
          target.onmouseover = (e) => {
            func(e);
          };
          break;
        case MOUSE_EVENT_TYPE.UP:
          target.onmouseup = (e) => {
            func(e);
          };
          break;
        default:
          break;
      }
    } else {
      console.error('UI ID not found!!!');
    }
  }

  // public ShowFPSUI(isShow: boolean){
  //   if(isShow){
  //     this.fpsUI.style.display = 'block';
  //   }
  //   else{
  //     this.fpsUI.style.display = 'none';
  //   }
  // }
}
