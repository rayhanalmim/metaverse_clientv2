import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';

interface Settings {
  [key: string]: any;
}

export default class DebugUI {
  public gui: GUI;
  public folders: any[];
  public settings: Settings = {};

  constructor() {
    this.gui = new GUI({ width: 310 });
    this.gui.close(); // = true;
    this.folders = [];
  }
  public AddFolder(name: string) {
    const folder = this.gui.addFolder(name);
    this.folders.push(folder);
    return folder;
  }
  public GetFolder(name: string) {
    for (let i = 0; i < this.folders.length; i++) {
      if (this.folders[i].name == name) return this.folders[i];
    }
    return null;
  }
  public AddBoolParam(name: string, value = true, folder: any, onChange: any) {
    this.settings[name] = value;
    folder.add(this.settings, name).onChange((value: number) => {
      onChange(value);
    });
  }
  public AddSlideParam(
    name: string,
    value: number,
    min: number,
    max: number,
    step: number,
    folder: any,
    onChange: any,
  ) {
    this.settings[name] = value;
    folder.add(this.settings, name, min, max, step).onChange((value: number) => {
      onChange(value);
    });
  }
  public AddDropBox(name: string, value, options: any, folder: any, onChange: any) {
    this.settings[name] = value;
    folder.add(this.settings, name, options).onChange((value) => {
      onChange(value);
    });
  }
  public AddInput(name: string, value = '', folder: any) {
    this.settings[name] = value;
    return folder.add(this.settings, name).onFinishChange(function (value) {
      // Do something with the new value
      console.log(value);
    });
  }
  public AddButton(name: string, value: any, folder: any){
    this.settings[name] = value;
    return folder.add(this.settings, name);
  }
}
