import OnlineAvatar from 'src/map3d/avatars/OnlineAvatar';

export class AvatarAction {
  constructor(action: THREE.AnimationAction, canLoop: boolean) {
    this.action = action;
    this.canLoop = canLoop;
    this.name = this.action.getClip().name;
  }
  public BottomFilter(){
    (this.action as any)._propertyBindings = this.filteredBindings;
    (this.action as any)._interpolants = this.filteredInterpolants;
  }
  public NoFilter(){
    (this.action as any)._propertyBindings = this.normalBindings;
    (this.action as any)._interpolants = this.normalInterpolants;
  }

  public action: THREE.AnimationAction;
  public canLoop: boolean;
  public name: string;
  public filteredBindings: any[] = [];
  public filteredInterpolants: any[] = [];
  public normalBindings: any[] = [];
  public normalInterpolants: any[] = [];
}

export class LandOwner {
  constructor(name = '', id = '') {
    this.ownerName = name;
    this.ownerID = id;
  }

  ownerName: string;
  ownerID: string;
}

export interface OtherAvatar {
  id: number;
  avatar: OnlineAvatar;
  itemsID: number[];
  isLoad: boolean;
}
