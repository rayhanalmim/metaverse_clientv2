import { NodeToyMaterial } from '@nodetoy/three-nodetoy';
import Environments from '../Init3d';
import * as THREE from 'three';
import Land from './land';
import { LandOwner } from 'src/constant/constantClass';
import { BUILD_STATUS, LAND_STATUS, LAND_TYPE, RAYLAYER } from 'src/constant/constant';
import Building from './Building';
import Property from 'src/api/property';
import PhysicWorld from '../physic/PhysicWorld';
import myNft from 'src/api/myNft';
import { data } from '../shaders/Hologram';
import ModuleBuilding from './ModuleBuilding';
import IntanceMeshes from 'src/utils/IntanceMeshes';
import SceneInside from '../scenes/SceneInside';
import App3D from '../App3D';

export default class NftBuildings {
  private static _instance?: NftBuildings;

  protal: THREE.Object3D;
  storeBuildings: IntanceMeshes[] = [];
  storeEcBuildings: IntanceMeshes[] = [];
  storeMatBuildings: IntanceMeshes[] = [];
  samuraiBuildings: IntanceMeshes[] = [];
  humanBuildings: IntanceMeshes[] = [];
  lands: Land[] = [];
  freeEffect: NodeToyMaterial;
  buyedEffect: THREE.MeshStandardMaterial;
  physicWorld: PhysicWorld;
  camera;
  raycaster;
  portalRaycaster: THREE.Raycaster;
  landsData = [];
  material;
  myLandEffect;

  humanModule: THREE.Object3D[] = [];

  instanceMeshes: THREE.InstancedMesh[] = [];

  buildingsRoot: THREE.Object3D;

  humanInstanceFloor: THREE.InstancedMesh;
  samuraiInstanceFloor: THREE.InstancedMesh;
  storeInstanceFloor: THREE.InstancedMesh;

  public samuraiSceneData: SceneInside[] = [];
  public samuraiPortalPos: THREE.Vector3[] = [
    new THREE.Vector3(-4.92066, 0, -4.69066),
    new THREE.Vector3(-1.56577, 0, 6.056732),
    new THREE.Vector3(-1.1177, 0, 0.05635),
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0, 0),
  ];

  public loadBuildingFinishCallback: any;

  public HUMAN_COUNT = 500;
  public SAMURAI_COUNT = 200;
  public ECSTORE_COUNT = 100;
  public MATSTORE_COUNT = 100;
  public NORMALSTORE_COUNT = 100;

  constructor() {
    if (NftBuildings._instance) throw new Error('Use Singleton.instance instead of new.');
    NftBuildings._instance = this;
  }

  public Init(parent: THREE.Object3D, link: string, camera, physicWorld: PhysicWorld) {
    this.camera = camera;
    this.raycaster = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, -1, 0), 0, 4000);
    this.physicWorld = physicWorld;
    this.freeEffect = new NodeToyMaterial();
    this.freeEffect.data = data;
    this.buyedEffect = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    this.myLandEffect = new THREE.MeshStandardMaterial({ color: 0x00c853 });

    this.buildingsRoot = new THREE.Object3D();
    this.buildingsRoot.name = 'Buildings';
    parent.add(this.buildingsRoot);

    Environments.Ins.resourcesManager.LoadGLB(link, (gltf) => {
      gltf.scene.traverse((child) => {
        if (child.type == 'Mesh' && child.userData.type == LAND_TYPE.HUMAN) {
          this.humanInstanceFloor = new THREE.InstancedMesh(
            child.geometry,
            child.material,
            this.HUMAN_COUNT,
          );
          this.humanInstanceFloor.name = 'humanInstanceFloor';
          this.humanInstanceFloor.userData.lands = [];
        }
        if (child.type == 'Mesh' && child.userData.type == LAND_TYPE.SAMURAI) {
          this.samuraiInstanceFloor = new THREE.InstancedMesh(
            child.geometry,
            child.material,
            this.SAMURAI_COUNT,
          );
          this.samuraiInstanceFloor.name = 'samuraiInstanceFloor';
          this.samuraiInstanceFloor.userData.lands = [];
        }
        if (child.type == 'Mesh' && child.userData.type == LAND_TYPE.STORE) {
          this.storeInstanceFloor = new THREE.InstancedMesh(
            child.geometry,
            child.material,
            this.ECSTORE_COUNT + this.NORMALSTORE_COUNT + this.MATSTORE_COUNT,
          );
          this.storeInstanceFloor.userData.lands = [];
          this.storeInstanceFloor.name = 'storeInstanceFloor';
        }
      });
      Environments.Ins.resourcesManager.LoadGLB(
        'models/map/mainmap_nft_building_pos.glb',
        (floorEmpty) => {
          this.buildingsRoot.add(floorEmpty.scene);
          for (let ind = 0; ind < floorEmpty.scene.children.length; ind++) {
            let instanceMesh = null;
            if (floorEmpty.scene.children[ind].name.includes(LAND_TYPE.HUMAN)) {
              instanceMesh = this.humanInstanceFloor;
            } else if (floorEmpty.scene.children[ind].name.includes(LAND_TYPE.SAMURAI)) {
              instanceMesh = this.samuraiInstanceFloor;
            } else if (floorEmpty.scene.children[ind].name.includes(LAND_TYPE.STORE)) {
              instanceMesh = this.storeInstanceFloor;
            } else {
              console.error('This is not a floor parent');
            }
            for (let i = 0; i < floorEmpty.scene.children[ind].children.length; i++) {
              const _land = new Land(
                floorEmpty.scene.children[ind].children[i].userData.name,
                floorEmpty.scene.children[ind].children[i].userData.id,
                floorEmpty.scene.children[ind].children[i].userData.type,
                instanceMesh,
                floorEmpty.scene.children[ind].children[i],
                i,
                physicWorld,
              );
              instanceMesh.userData.lands.push(_land);
              this.lands.push(_land);
            }
          }
          this.samuraiInstanceFloor.instanceMatrix.needsUpdate = true;
          this.storeInstanceFloor.instanceMatrix.needsUpdate = true;
          this.humanInstanceFloor.instanceMatrix.needsUpdate = true;
        },
      );
      Environments.Ins.resourcesManager.LoadGLB('models/things/PortalEffect.glb', (gltf) => {
        this.protal = gltf.scene;
        this.protal.traverse((child) => {
          if (child.type == 'Mesh') {
            child.layers.enable(RAYLAYER.PORTAL);
          }
        });
        this.LoadBuildings();
      });
      this.buildingsRoot.add(this.humanInstanceFloor);
      this.buildingsRoot.add(this.samuraiInstanceFloor);
      this.buildingsRoot.add(this.storeInstanceFloor);
    });
    this.LoadModule();
  }

  private LoadModule() {
    Environments.Ins.resourcesManager.LoadGLB(
      'models/buildings/human_building_module.glb',
      (gltf) => {
        gltf.scene.traverse((child) => {
          if (child.type == 'Mesh') {
            this.humanModule.push(child);
          }
        });
      },
    );
  }

  public GetModule(name: string): THREE.Object3D {
    for (let i = 0; i < this.humanModule.length; i++) {
      if (this.humanModule[i].name == name) {
        return this.humanModule[i].clone(true);
      }
    }
    console.error('Cant find module:', name);
    return new THREE.Mesh(new THREE.BoxGeometry());
  }

  public static get Ins() {
    return NftBuildings._instance ?? (NftBuildings._instance = new NftBuildings());
  }

  GetLandByID(id: number) {
    // const item = this.landsData.find((it) => it.token_id === id);
    // if (!item) return;
    return this.lands.find((c) => c.landID === id);
  }

  GetLandPosition(id: string) {
    const land: Land = this.GetLandByID(parseInt(id));
    return land.GetTeleportPos();
  }

  GetLandId(land) {
    return this.landsData.find((c) => c.token_id === land.landID)?.id;
  }

  GetLandDetail(land) {
    return this.landsData.find((c) => c.token_id === land.landID);
  }

  GetAllLand() {
    return {
      models: this.lands,
      api: this.landsData,
      mat: this.lands.filter(
        (c) => c.posObject.userData.sub_type && c.posObject.userData.sub_type === LAND_TYPE.MAT,
      ),
    };
  }

  GetECSitePoint(event) {
    const x = (event.clientX / window.innerWidth) * 2 - 1;
    const y = -(event.clientY / window.innerHeight) * 2 + 1;
    this.camera.updateMatrixWorld();
    this.raycaster.setFromCamera({ x, y }, this.camera);
    const intersects = this.raycaster.intersectObjects(
      this.storeEcBuildings.map((c) => c.root.children)[0],
    );
    if (!intersects.length) return;
    return intersects[0];
  }

  GetMatPoint(event) {
    const x = (event.clientX / window.innerWidth) * 2 - 1;
    const y = -(event.clientY / window.innerHeight) * 2 + 1;
    this.camera.updateMatrixWorld();
    this.raycaster.setFromCamera({ x, y }, this.camera);
    const intersects = this.raycaster.intersectObjects(
      this.storeMatBuildings.map((c) => c.root.children)[0],
    );
    if (!intersects.length) return;
    return intersects[0];
  }

  LoadBuildings() {
    Environments.Ins.resourcesManager.LoadGLB(
      'models/buildings/store_building.glb',
      (normalStoreGLB) => {
        for (let i = 0; i < normalStoreGLB.scene.children.length; i++) {
          const category = new IntanceMeshes(
            normalStoreGLB.scene.children[i],
            this.NORMALSTORE_COUNT,
          );
          this.buildingsRoot.add(category.root);
          this.storeBuildings.push(category);
        }
        Environments.Ins.resourcesManager.LoadGLB(
          'models/buildings/storeMat_building.glb',
          (matStoreGLB) => {
            for (let i = 0; i < matStoreGLB.scene.children.length; i++) {
              const category = new IntanceMeshes(
                matStoreGLB.scene.children[i],
                this.MATSTORE_COUNT,
              );
              this.buildingsRoot.add(category.root);
              this.storeMatBuildings.push(category);
            }

            Environments.Ins.resourcesManager.LoadGLB(
              'models/buildings/storeEC_building.glb',
              (ecStoreGLB) => {
                for (let i = 0; i < ecStoreGLB.scene.children.length; i++) {
                  const category = new IntanceMeshes(
                    ecStoreGLB.scene.children[i],
                    this.ECSTORE_COUNT,
                  );
                  this.buildingsRoot.add(category.root);
                  this.storeEcBuildings.push(category);
                }

                Environments.Ins.resourcesManager.LoadGLB(
                  'models/buildings/samurai_building.glb',
                  (samuraiGLB) => {
                    this.samuraiBuildings = new Array<IntanceMeshes>(
                      samuraiGLB.scene.children.length,
                    );
                    for (let i = 0; i < samuraiGLB.scene.children.length; i++) {
                      const category = new IntanceMeshes(
                        samuraiGLB.scene.children[i],
                        this.SAMURAI_COUNT,
                      );
                      this.buildingsRoot.add(category.root);
                      this.samuraiBuildings[parseInt(category.root.name) - 1] = category;
                    }
                    for (let i = 0; i < this.samuraiBuildings.length; i++) {
                      this.samuraiSceneData.push(
                        new SceneInside(
                          'models/map/samurai/samurai' + (i + 1) + '/',
                          'models/map/samurai/samurai' + (i + 1) + '_physicmesh.glb',
                          'models/map/samurai/samurai' + (i + 1) + '_navmesh.glb',
                          this.samuraiPortalPos[i],
                        ),
                      );
                    }
                    Environments.Ins.resourcesManager.LoadGLB(
                      'models/buildings/human_building.glb',
                      (gltf2) => {
                        for (let i = 0; i < gltf2.scene.children.length; i++) {
                          const category = new IntanceMeshes(
                            gltf2.scene.children[i],
                            this.HUMAN_COUNT,
                          );
                          this.buildingsRoot.add(category.root);
                          this.humanBuildings.push(category);
                        }
                        if (this.loadBuildingFinishCallback) {
                          this.loadBuildingFinishCallback();
                        }
                        this.SetupStartState();
                      },
                    );
                  },
                );
              },
            );
          },
        );
      },
    );
  }

  SetupLoadedBuilding(mesh: THREE.InstancedMesh, gltf: any) {
    const colliderMeshes = [];
    mesh.count = 1;
    this.buildingsRoot.add(mesh);
    gltf.scene.traverse((child) => {
      if (child.type == 'Mesh') {
        if (child.userData.isportal == 1) {
          mesh.userData.portal = child;
        }
        if (child.userData.isCollider == 1) {
          colliderMeshes.push(child);
        }
      }
    });
    mesh.userData.colliderMeshes = colliderMeshes;
  }

  async GetData() {
    // create fake data
    const { data } = await Property.getHome();
    this.landsData = data.data;
    this.landsData.forEach((item) => {
      const land = this.lands.find((it) => it.landID === item.token_id);
      if (!land) return;
      land.landStatus = item.status;
      land.username = item.username;
      if (!item.home) {
        land.landOwner = new LandOwner(item.owner, item.token_id);
        return;
      }
      land.buildStatus = BUILD_STATUS.BUILDED;
      land.landStatus = LAND_STATUS.BUYED;
      land.landOwner = new LandOwner(item.home.owner, item.home.token_id);
      land.landInfo = item;
      // land.buildStatus = BUILD_STATUS.BUILDED;
    });
  }

  async SetupStartState() {
    await this.GetData();
    try {
      const resLand = await myNft.list('?type=land');
      for (const element of this.lands) {
        const hasId = resLand.data.data.some((item) => item.token_id === element.landID);
        if (hasId) {
          this.setBuilding(element, true);
        } else {
          this.setBuilding(element);
        }
      }
    } catch (e) {
      for (const element of this.lands) {
        this.setBuilding(element);
      }
    }
  }

  makeTextSprite(message, parameters) {
    if (parameters === undefined) parameters = {};
    const fontface = parameters.fontface || 'Courier New';
    const fontsize = parameters.fontsize || 18;

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    context.font = 'Bold ' + fontsize + 'px ' + fontface;

    context.fillStyle = parameters.textColor || '#000000';
    context.fillText(message, 4, 20);

    const texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;

    const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(0.5 * fontsize, 0.25 * fontsize, 0.75 * fontsize);
    return sprite;
  }

  setEffect(element) {
    if (element.landStatus !== LAND_STATUS.BUYED) {
      element.SetFree(this.freeEffect);
    }
  }

  removeEffect(element) {
    if (element.landStatus !== LAND_STATUS.BUYED) {
      element.SetFree(this.material);
    }
  }

  setDataItem(item, isAuth = false) {
    this.landsData = this.landsData.map((it) => {
      if (it.token_id === item.token_id)
        return {
          ...it,
          status: LAND_STATUS.BUYED,
        };
      return it;
    });
    const land = this.lands.find((it) => it.landID === item.token_id);
    land.landStatus = LAND_STATUS.BUYED;
    this.setBuilding(land, isAuth);
  }

  GetLandHasHouse() {
    return this.landsData.filter((c) => c.home);
  }

  SetApplyHome(tokenId, home) {
    this.landsData = this.landsData.map((item) => {
      if (item.token_id === tokenId) {
        return {
          ...item,
          home,
        };
      }
      return item;
    });
  }

  ApplyHome(landId, landDetail, username = '') {
    const land = this.lands.find((it) => it.landID === landId);
    land.landStatus = LAND_STATUS.BUYED;
    land.buildStatus = BUILD_STATUS.BUILDED;
    land.username = username || '';
    land.landInfo = landDetail;
    this.setBuilding(land);
  }

  SetOwnerName(id, name) {
    const land = this.lands.find((it) => it.landID === id);
    land.landStatus = LAND_STATUS.BUYED;
    land.username = name || '';
    const hasSprite = land.posObject.children.find((c) => c.type === 'Sprite');
    if (hasSprite) {
      land.posObject.remove(hasSprite);
    }
    const spritey = this.makeTextSprite(name, {
      fontsize: 18,
      textColor: '#D50000',
    });
    land.posObject.add(spritey);
    spritey.position.set(0, 0.1, 0);
    if(land.landType == LAND_TYPE.STORE && land.posObject.userData.sub_type === LAND_TYPE.MAT){
      spritey.scale.x *=2.5;
    }
  }

  setBuilding(element, isAuth = false, forceMove = false) {
    const tst = new THREE.Vector3();
    element.GetWorldPosition(tst);

    if (element.landStatus == LAND_STATUS.BUYED) {
      this.setEffect(element);
      const spritey = this.makeTextSprite(element.username, {
        fontsize: 18,
        textColor: '#D50000',
      });
      if(element.landType == LAND_TYPE.STORE && element.posObject.userData.sub_type === LAND_TYPE.MAT){
        spritey.scale.x *=2.5;
      }
      if (!element.buildStatus) {
        element.posObject.add(spritey);
        spritey.position.set(0, 0.1, 0);

      }
      if (element.buildStatus) {
        const hasSprite = element.posObject.children.find((c) => c.type === 'Sprite');
        if (hasSprite) {
          element.posObject.remove(hasSprite);
        }
        element.posObject.add(spritey);
        element.SetFree(this.material);
        if (element.landType == LAND_TYPE.STORE) {
          const storeType = element.landInfo.home.metadata.attributes.find(
            (c) => c.trait_type === 'Type',
          ).value;
          if (element.posObject.userData.sub_type === LAND_TYPE.MAT) {
            if (storeType === LAND_TYPE.MAT) {
              element.AddBuilding(
                new Building(
                  element,
                  this.storeMatBuildings[0],
                  this.protal.clone(true),
                  this.physicWorld,
                  false,
                  -1,
                  element.landInfo.home,
                ),
              );
            }
            spritey.position.set(0, 3, 0);
          }
          if (element.posObject.userData.sub_type !== LAND_TYPE.MAT) {
            if (storeType === LAND_TYPE.MARKETPLACE) {
              element.AddBuilding(
                new Building(
                  element,
                  this.storeBuildings[0],
                  this.protal.clone(true),
                  this.physicWorld,
                ),
              );
              spritey.position.set(0, 10, 0);
            }
            if (storeType === LAND_TYPE.ECSITE) {
              element.AddBuilding(
                new Building(
                  element,
                  this.storeEcBuildings[0],
                  this.protal.clone(true),
                  this.physicWorld,
                  true,
                ),
              );
              spritey.position.set(0, 5, 0);
            }
          }
        } else if (element.landType == LAND_TYPE.SAMURAI) {
          let index = this.GetSamuraiBuildingByCategory(element.landInfo.home.metadata.attributes);
          if (index > this.samuraiBuildings.length) {
            index = 0;
            console.error('cant find index', index);
          }
          element.AddBuilding(
            new Building(
              element,
              this.samuraiBuildings[index],
              this.protal.clone(true),
              this.physicWorld,
              false,
              index,
            ),
          );
          spritey.position.set(0, 5.5, 0);
        } else if (element.landType == LAND_TYPE.HUMAN) {
          const humanType = element.landInfo.home.metadata.attributes.find(
            (c) => c.trait_type === 'Type',
          ).value;
          if (humanType === LAND_TYPE.MAT) {
            element.AddBuilding(
              new Building(
                element,
                this.storeMatBuildings[0],
                this.protal.clone(true),
                this.physicWorld,
                false,
                -1,
                element.landInfo.home,
              ),
            );
          } else {
            element.AddBuilding(
              new ModuleBuilding(
                element,
                this.humanBuildings[0],
                this.protal.clone(true),
                this.physicWorld,
                false,
                element.landInfo.home.metadata.attributes,
              ),
            );
          }
          spritey.position.set(0, 5.5, 0);
        }
        if (forceMove) {
          App3D.Ins.mainScene.MoveAvatarToLand(element.landID);
        }
      }
    }
  }

  GetSamuraiBuildingByCategory(homeAttributes: any[]) {
    const attribute = homeAttributes.find((att) => att.trait_type === 'Category');
    return parseInt(attribute.value) - 1;
  }

  Update() {
    this.lands.forEach((land) => {
      if (land.building) land.building.Update();
    });
  }
}
