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
import nftDataService from 'src/services/nftDataService';
// Import general repository for user data
import generalRepository from 'src/api/general';

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
  // Add user data property
  userData = [];

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

  public loadBuildingFinishCallback: () => void;

  public HUMAN_COUNT = 500;
  public SAMURAI_COUNT = 200;
  public ECSTORE_COUNT = 100;
  public MATSTORE_COUNT = 100;
  public NORMALSTORE_COUNT = 100;

  // Remove static property owner map and replace with dynamic mapping
  private propertyOwnerMap = new Map();

  private getOwnerForProperty(propertyId: number): string {
    // Use dynamic property ownership from userData if available
    if (this.propertyOwnerMap.has(propertyId)) {
      return this.propertyOwnerMap.get(propertyId);
    }
    return '';
  }

  // Japanese name conversion mapping
  private nameToJapaneseMap = new Map([
    // Convert romanized Japanese names to Japanese characters
    ['Masuda Tetsuro', '増田 哲郎'],
    ['masuda mutsuko', '増田 睦子'],
    ['Sasakura Toshiro', '笹倉 俊郎'],
    ['Ikeda Tonako', '池田 十和子'],
    ['Matsumoto Noriko', '松本 典子'],
    ['Uno Miyoko', '宇野 美代子'],
    ['Arai Yukio', '新井 幸夫'],
    ['Azuma Keiko', '東 恵子'],
    ['Matsumura Erika', '松村 絵里香'],
    ['Tabata Sachiyo', '田畑 幸代'],
    ['Iida Asako', '飯田 朝子'],
    ['Mori Yoshie', '森 淑恵'],
    ['Sakamoto Kumiko', '坂本 久美子'],
    ['Sakamoto Kenichi', '坂本 健一'],
    ['Kano Hisashi', '狩野 久'],
    ['Kano Kouki', '狩野 光輝'],
    ['Noriike Harumi', '法池 春美'],
    ['Kato Takanori', '加藤 孝典'],
    ['Uchima Kazuhiro', '内間 和博'],
    ['Aida Hiroko', '相田 博子'],
    ['Onoda Masaki', '小野田 正樹'],
    ['Kawasaki Daisuke', '川崎 大輔'],
    ['Sugiura Shizuka', '杉浦 静香'],
    ['Ishiguro Izumi', '石黒 泉'],
    ['Nakaya Keiko', '中屋 恵子'],
    ['Takasu Yumiko', '高須 由美子'],
    ['Sugita Kazuo', '杉田 和夫'],
    ['Mori Fujiki', '森 富樹'],
    ['Inagaki Shoko', '稲垣 祥子'],
    ['Kimura Akiko', '木村 明子'],
    ['Kato Yumiko', '加藤 由美子'],
    ['Yamada Takako', '山田 貴子'],
    ['Takasu Hiroki', '高須 寛樹'],
    ['Fujita Joichi', '藤田 丈一'],
    ['Hayakawa Mikako', '早川 美香子'],
    ['Kunikyo Shunsuke', '国京 俊輔'],
    ['Sugiura Keiko', '杉浦 恵子'],
    ['Kato Yuichi', '加藤 雄一'],
    ['Saito Tomohiro', '斉藤 智宏'],
    ['Mori Shoji', '森 昭二'],
    ['Fukatsu Tomohiro', '深津 智宏'],
    ['Matsumura Miharu', '松村 美春'],
    ['Yanuma Yoshimi', '矢沼 好美'],
    ['Sugiyama Tamie', '杉山 民恵'],
    ['Miyachi Ryuichi', '宮地 龍一'],
    ['Nomura Mariko', '野村 真理子'],
    ['Kurita Naomi', '栗田 直美'],
    ['Umemura Yukie', '梅村 由紀恵'],
    ['Sugano Yuko', '菅野 裕子'],
    ['Chuma Naoko', '中馬 直子'],
    ['Izawa Osamu', '井沢 修'],
    ['Uchida Kazuko', '内田 和子'],
    ['Shimokaisho Nozomi', '下海正 望'],
    ['Ikeyama Minako', '池山 美奈子']
  ]);

  private convertToJapanese(englishName: string): string {
    return this.nameToJapaneseMap.get(englishName) || englishName;
  }

  constructor() {
    if (NftBuildings._instance) throw new Error('Use Singleton.instance instead of new.');
    NftBuildings._instance = this;
    // Fetch user data during initialization
    this.fetchUserData();

  }

  // Add new method to fetch user data
  private async fetchUserData() {
    try {
      console.log('Fetching user data from t_users table...');
      const response = await generalRepository.listUser();
      this.userData = response.data.data;
      console.log('User data fetched successfully:', this.userData);

      // Build the property owner map dynamically
      this.buildPropertyOwnerMap();

    } catch (error) {
      console.error('Failed to fetch user data:', error);
    }
  }

  // Build property owner map from user data
  private buildPropertyOwnerMap() {
    // Clear existing map
    this.propertyOwnerMap.clear();

    // Debug: Log the entire userData for inspection
    console.debug('Full userData:', JSON.stringify(this.userData, null, 2));

    // Parse property data from user records
    if (this.userData && this.userData.length > 0) {
      console.debug('Starting to build property owner map...');

      this.userData.forEach(user => {
        if (!user.username || !user.property_ids) {
          console.debug(`Skipping user without username or property_ids: ${JSON.stringify(user)}`);
          return;
        }

        try {
          let propertyIds: number[] = [];

          // Robust parsing of property_ids
          if (typeof user.property_ids === 'string') {
            // Handle various string formats: '[1,2,3]', '1,2,3', ' [1, 2, 3] '
            const cleanString = user.property_ids
              .replace(/^[[{]|[\]}]$/g, '')  // Remove outer brackets or braces
              .replace(/\s+/g, '')  // Remove all whitespace
              .split(',')  // Split by comma
              .filter(id => id.trim() !== '');  // Remove empty entries

            propertyIds = cleanString.map(id => {
              const parsedId = parseInt(id.trim(), 10);
              return isNaN(parsedId) ? null : parsedId;
            }).filter(id => id !== null);

            // ADDITIONAL DEBUG: Log the parsing process
            console.debug(`Parsing property_ids for ${user.username}:`, {
              originalString: user.property_ids,
              cleanString,
              parsedIds: propertyIds
            });
          } else if (Array.isArray(user.property_ids)) {
            // If it's already an array, filter and parse
            propertyIds = user.property_ids
              .map(id => typeof id === 'string' ? parseInt(id, 10) : id)
              .filter(id => !isNaN(id));
          } else {
            console.warn(`Unexpected property_ids type for user ${user.username}:`, typeof user.property_ids);
            return;
          }

          // Debug: Log detailed property mapping information
          console.debug(`User ${user.username} property mapping:`, {
            originalPropertyIds: user.property_ids,
            parsedPropertyIds: propertyIds
          });

          // Map each valid property to this user
          propertyIds.forEach(propertyId => {
            if (propertyId !== null && !isNaN(propertyId)) {
              this.propertyOwnerMap.set(propertyId, user.username);
              console.debug(`Assigned property ${propertyId} to user ${user.username}`);
            }
          });

          console.debug(`Processed user ${user.username}: ${propertyIds.length} properties`);
        } catch (error) {
          console.error(`Comprehensive error parsing property_ids for user ${user.username}:`, {
            error,
            userData: user,
            propertyIds: user.property_ids
          });
        }
      });

      // Debug: Log the final property owner map
      console.debug('Final Property Owner Map:',
        Array.from(this.propertyOwnerMap.entries()).map(([propertyId, owner]) =>
          `Property ${propertyId}: ${owner}`
        )
      );

      console.debug(`Completed property owner map. Total entries: ${this.propertyOwnerMap.size}`);
    } else {
      console.warn('No user data available to build property owner map');
    }
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

  SetupLoadedBuilding(mesh: THREE.InstancedMesh, gltf: { scene: THREE.Object3D }) {
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
    console.log('API Response:', JSON.stringify(data.data, null, 2));
    this.landsData = data.data;

    // Print all available data for comparison
    console.log('Available data sources for property mapping:');
    console.log('- Land data from API:', this.landsData.length, 'items');
    console.log('- User data from t_users:', this.userData.length, 'users');
    console.log('- Property owner mappings:', this.propertyOwnerMap.size, 'mappings');

    this.landsData.forEach((item) => {
      const land = this.lands.find((it) => it.landID === item.token_id);
      if (!land) return;
      land.landStatus = item.status;
      // console.log('Processing land:', {
      //   tokenId: item.token_id,
      //   apiUsername: item.username,
      //   currentUsername: land.username,
      //   owner: item.owner
      // });

      // Set username from API response
      land.username = item.username;
      // console.log('Set username for land', item.token_id, 'to:', land.username);

      // Set land owner
      if (!item.home) {
        land.landOwner = new LandOwner(item.owner, item.token_id);
        return;
      }

      // Handle land with home
      land.buildStatus = BUILD_STATUS.BUILDED;
      land.landStatus = LAND_STATUS.BUYED;
      land.landOwner = new LandOwner(item.owner, item.token_id); // Use land owner, not home owner
      land.landInfo = item;
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
    // Only set username if it's not already set from API
    if (username && !land.username) {
      land.username = username;
    }
    land.landInfo = landDetail;
    this.setBuilding(land);
  }

  SetOwnerName(id, name) {
    const land = this.lands.find((it) => it.landID === id);
    land.landStatus = LAND_STATUS.BUYED;

    // Get the actual owner from our dynamic mapping
    const actualOwner = this.getOwnerForProperty(id);
    if (actualOwner) {
      land.username = actualOwner;
      const hasSprite = land.posObject.children.find((c) => c.type === 'Sprite');
      if (hasSprite) {
        land.posObject.remove(hasSprite);
      }

      const displayName = `ID:${id} - ${land.username}`;
      const spritey = this.makeTextSprite(displayName, {
        fontsize: 18,
        textColor: '#D50000',
      });
      land.posObject.add(spritey);
      spritey.position.set(0, 0.1, 0); // Reduced height to be very close to sign board
      if (land.landType == LAND_TYPE.STORE && land.posObject.userData.sub_type === LAND_TYPE.MAT) {
        spritey.scale.x *= 2.5;
      }
    } else {
      // Remove any existing sprite for unsold properties
      const hasSprite = land.posObject.children.find((c) => c.type === 'Sprite');
      if (hasSprite) {
        land.posObject.remove(hasSprite);
      }
    }
  }

  setBuilding(element, isAuth = false, forceMove = false) {
    const tst = new THREE.Vector3();
    element.GetWorldPosition(tst);

    // // Special case for property ID 863 - display NFT image on blackboard
    // if (element.landID === 863) {

    //   // Clear any existing NFT board
    //   element.posObject.children.forEach((child) => {
    //     if (child.userData && child.userData.isNftBoard) {
    //       element.posObject.remove(child);
    //     }
    //   });

    // }

    if (element.landStatus == LAND_STATUS.BUYED) {
      this.setEffect(element);


      // Check for wallet connection with retry mechanism
      this.checkWalletAndFetchNFTs(element);

      console.log(element.landID);

      // Create the text sprite with both landID and username if available
      const displayText = element.username ? `ID:${element.landID} - ${element.username}` : `ID:${element.landID}`;
      const spritey = this.makeTextSprite(displayText, {
        fontsize: 18,
        textColor: '#D50000',
      });
      if (element.landType == LAND_TYPE.STORE && element.posObject.userData.sub_type === LAND_TYPE.MAT) {
        spritey.scale.x *= 2.5;
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

      // Special case for property 386 - flag
      if (element.landID === 386) {
        Environments.Ins.resourcesManager.LoadGLB(
          'models/buildings/flag/Flag1.glb',
          (gltf) => {

            // Calculate model dimensions and center for proper positioning
            const bbox = new THREE.Box3().setFromObject(gltf.scene);
            const size = bbox.getSize(new THREE.Vector3());
            const center = bbox.getCenter(new THREE.Vector3());

            // Create flag object directly from the scene (like portals and NPCs)
            const flagObject = gltf.scene.clone();

            // Use appropriate scale for the flag (the model is quite large: 8.24 x 22.54 x 8.23)
            const flagScale = new THREE.Vector3(
              0.2,     // width scale - reduce to reasonable size
              0.2,     // height scale - reduce to reasonable size  
              0.2      // depth scale - reduce to reasonable size
            );

            // Position the flag on the ground, accounting for the model's center offset
            // The flag center is at y: 8.79, so we need to lift it to compensate
            const flagY = -0.1; // Ensure base touches ground

            // Apply transformations directly to the flag object
            flagObject.position.set(0, flagY, 0);
            flagObject.scale.copy(flagScale);
            flagObject.rotation.set(0, 0, 0); // No rotation for now

            // Add the flag object as a child of the land object
            element.posObject.add(flagObject);

            // Add owner name text sprite
            const actualOwner = this.getOwnerForProperty(element.landID);
            if (actualOwner) {
              // Convert to Japanese
              const japaneseOwner = this.convertToJapanese(actualOwner);
              element.username = japaneseOwner;

              // Extract family name for the flag (in Japanese, family name comes first)
              const japaneseNameParts = japaneseOwner.split(' ');
              const familyName = japaneseOwner; // First part is family name in Japanese

              // Create text texture for the flag
              const createFlagTextTexture = (text: string) => {
                const canvas = document.createElement('canvas');
                canvas.width = 512;
                canvas.height = 256;
                const context = canvas.getContext('2d');

                // Fill with yellow background first
                context.fillStyle = '#FFFF00'; // Yellow background
                context.fillRect(0, 0, canvas.width, canvas.height);

                // Set text properties for Japanese text
                context.fillStyle = '#8B0000'; // Dark red color for text
                context.font = '900 48px "Noto Sans JP", "Yu Gothic", "Meiryo", Arial, sans-serif'; // Japanese-compatible fonts
                context.textAlign = 'center';
                context.textBaseline = 'middle';

                // Add text outline for better visibility
                context.strokeStyle = '#000000';
                context.lineWidth = 3;
                context.strokeText(text, canvas.width / 2, canvas.height / 2);

                // Fill text
                context.fillText(text, canvas.width / 2, canvas.height / 2);

                const texture = new THREE.Texture(canvas);
                texture.needsUpdate = true;
                return texture;
              };

              // Find and modify the flag mesh - debug all meshes first
              let flagMeshFound = false;

              flagObject.traverse((child) => {
                if (child.type === 'Mesh') {

                  // Target only the main flag cloth mesh (not the small parts)
                  if (child.name === 'Flag' && child.material?.name === 'Flag_Yellow') {


                    // Create material with text texture - use yellow background with dark text
                    const flagTexture = createFlagTextTexture('増田 哲郎');
                    const flagMaterial = new THREE.MeshBasicMaterial({
                      map: flagTexture,
                      transparent: false, // Make opaque since we want yellow background
                      side: THREE.DoubleSide, // Show text on both sides
                      color: 0xffffff // White color so texture shows correctly
                    });

                    // Apply the material to the flag
                    child.material = flagMaterial;
                    flagMeshFound = true;
                  }
                }
              });

              if (!flagMeshFound) {
                console.warn('No flag mesh found! Available meshes logged above.');
              }

              // Add owner name text sprite above the flag
              const displayName = `${japaneseOwner}`;
              const spritey = this.makeTextSprite(displayName, {
                fontsize: 16,
                textColor: '#B80000',
              });
              element.posObject.add(spritey);
              // Position text sprite relative to flag height
              const flagHeight = size.y * flagScale.y;
              spritey.position.set(0, flagY + flagHeight + 1.0, 0); // Position above the flag
            }

          }
        );
        return;
      }

      // Special case for property 384 - medieval sign board
      if (element.landID === 384) {
        Environments.Ins.resourcesManager.LoadGLB(
          'models/buildings/specific/old_medieval_sign_board.glb',
          (gltf) => {

            // Log original model dimensions
            const bbox = new THREE.Box3().setFromObject(gltf.scene);
            const size = bbox.getSize(new THREE.Vector3());

            // Create a new instance mesh for the sign board
            const signMesh = new IntanceMeshes(gltf.scene, 1);
            signMesh.ChangeCount(1); // Ensure we have one instance

            // Set up the transform in local space
            const matrix = new THREE.Matrix4();
            const pos = new THREE.Vector3(0, 0.1, 0); // Local position relative to land
            const quat = new THREE.Quaternion();

            // Calculate scale to fit property (targeting about 1 unit total size)
            const propertyScale = new THREE.Vector3(
              0.15,    // width scale
              0.08,    // explicit height scale - much smaller for vertical reduction
              0.15     // depth scale
            );

            // Raise the position significantly to lift entire sign board above ground
            pos.y += 2; // Increased offset to ensure entire sign is above ground

            // Set up proper rotation sequence for the sign board
            quat.setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI / 2); // First rotate around X to stand up
            const tempQuat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI); // Then rotate around Y to face forward
            quat.multiply(tempQuat); // Combine the rotations

            matrix.compose(pos, quat, propertyScale);
            signMesh.SetAtIndex(0, matrix);

            // Add the sign mesh as a child of the land object
            element.posObject.add(signMesh.root);

            // Create building instance
            element.AddBuilding(
              new Building(
                element,
                signMesh,
                this.protal.clone(true),
                this.physicWorld,
                false,
                -1
              )
            );

            // ADD THIS SECTION - Create and display the owner name on the sign board
            const actualOwner = this.getOwnerForProperty(element.landID);
            if (actualOwner) {
              // Convert to Japanese
              const japaneseOwner = this.convertToJapanese(actualOwner);
              element.username = japaneseOwner;

              // Function to create text texture
              const createTextTexture = () => {
                const canvas = document.createElement('canvas');
                canvas.width = 512;
                canvas.height = 256;
                const context = canvas.getContext('2d');

                // Make transparent background
                context.clearRect(0, 0, canvas.width, canvas.height);

                // Add stronger glow effect for better readability against the wooden background
                context.shadowColor = '#FFFFFF';
                context.shadowBlur = 4;
                context.shadowOffsetX = 1;
                context.shadowOffsetY = 1;

                // Set up text properties for "FOR RENT" text
                context.fillStyle = '#B80000'; // Deeper red text for better visibility
                context.font = '900 36px Arial, sans-serif'; // Slightly smaller font for "FOR RENT"
                context.textAlign = 'center';
                context.textBaseline = 'middle';

                // Draw "FOR RENT" text at the top
                const forRentY = canvas.height * 0.25; // Position at 25% from top
                context.fillText('FOR RENT', canvas.width / 2, forRentY);
                context.fillText('FOR RENT', canvas.width / 2 - 1, forRentY);
                context.fillText('FOR RENT', canvas.width / 2 + 1, forRentY);
                context.fillText('FOR RENT', canvas.width / 2, forRentY - 1);
                context.fillText('FOR RENT', canvas.width / 2, forRentY + 1);

                // Add property ID
                context.fillStyle = '#000088'; // Blue color for ID
                context.font = '900 32px Arial, sans-serif';
                const idY = canvas.height * 0.45; // Position at 45% from top
                context.fillText(`ID: ${element.landID}`, canvas.width / 2, idY);

                // Set up text properties for Japanese owner name
                context.fillStyle = '#B80000'; // Back to red for owner name
                context.font = '900 42px "Noto Sans JP", "Yu Gothic", "Meiryo", Arial, sans-serif'; // Japanese-compatible fonts

                // Draw the Japanese text at the bottom
                const japaneseNameY = canvas.height * 0.7; // Position at 70% from top
                context.fillText(japaneseOwner, canvas.width / 2, japaneseNameY);
                context.fillText(japaneseOwner, canvas.width / 2 - 1, japaneseNameY);
                context.fillText(japaneseOwner, canvas.width / 2 + 1, japaneseNameY);
                context.fillText(japaneseOwner, canvas.width / 2, japaneseNameY - 1);
                context.fillText(japaneseOwner, canvas.width / 2, japaneseNameY + 1);

                const texture = new THREE.Texture(canvas);
                texture.needsUpdate = true;
                return texture;
              };

              // Create textures for both sides
              const frontTexture = createTextTexture();
              const backTexture = createTextTexture();

              // Create materials with alpha transparency
              const frontMaterial = new THREE.MeshBasicMaterial({
                map: frontTexture,
                transparent: true,
                side: THREE.FrontSide
              });

              const backMaterial = new THREE.MeshBasicMaterial({
                map: backTexture,
                transparent: true,
                side: THREE.FrontSide // Using FrontSide for better control
              });

              // Create separate geometries for front and back to handle text orientation
              const signGeometry = new THREE.PlaneGeometry(3.2, 1.6);

              // Create front and back meshes
              const frontTextMesh = new THREE.Mesh(signGeometry, frontMaterial);
              const backTextMesh = new THREE.Mesh(signGeometry, backMaterial);

              // Position both text meshes - adjust Y position to center vertically on the sign
              const textPosY = 2.65;

              // Set positions with increased offset to ensure visibility
              frontTextMesh.position.set(0, textPosY, 0.12);

              // For back side, position it directly on the back of the sign panel
              backTextMesh.position.set(0, textPosY, -0.17);
              backTextMesh.rotation.set(0, Math.PI, 0); // Rotate 180 degrees around Y axis


              // Add both meshes
              element.posObject.add(frontTextMesh);
              element.posObject.add(backTextMesh);

              // Remove the side meshes as they're not needed and causing positioning issues

            }

          }
        );
        return;
      }

      // Special case for properties with BIG SKY VIDEO SCREEN (ALWAYS SHOW)
      if ([385, 362, 822, 866].includes(element.landID)) {
        // Configure video URL here
        // ❌ YouTube URLs don't work - need direct video files
        // const VIDEO_URL = 'https://www.youtube.com/watch?v=XlQ4HwzR8i0';
        
        // ✅ Working alternatives:
        const VIDEO_URL = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
        // const VIDEO_URL = 'https://sample-videos.com/zip/10/mp4/SampleVideo_720x480_5mb.mp4';
        // const VIDEO_URL = 'https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-mp4-file.mp4';
        
        // 🔴 For live streams, you need direct streaming URLs like:
        // const VIDEO_URL = 'https://your-streaming-server.com/live/stream.m3u8';  // HLS
        // const VIDEO_URL = 'https://your-rtmp-server.com/live/stream.webm';       // WebRTC

        // Create video element and texture
        const video = document.createElement('video');
        video.src = VIDEO_URL;
        video.crossOrigin = 'anonymous';
        video.loop = true;
        video.muted = true;
        video.playsInline = true;
        video.autoplay = true;

        // Try to autoplay the video
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise.then(() => {
            console.log('Sky video screen playing successfully on property 385');
          }).catch(error => {
            console.warn('Sky video autoplay failed:', error);
          });
        }

        // Create video texture
        const videoTexture = new THREE.VideoTexture(video);
        videoTexture.minFilter = THREE.LinearFilter;
        videoTexture.magFilter = THREE.LinearFilter;
        videoTexture.format = THREE.RGBAFormat;

        // Create material with video texture
        const skyScreenMaterial = new THREE.MeshBasicMaterial({
          map: videoTexture,
          side: THREE.DoubleSide,  // Visible from both sides
          toneMapped: false,
          transparent: false
        });

        // 🎬 SKY SCREEN CONFIGURATION (DOUBLED SIZE!):
        const screenWidth = 40;      // ← DOUBLED from 20 = MASSIVE screen
        const screenHeight = 24;     // ← DOUBLED from 12 = MASSIVE screen
        const screenHeightInSky = 35; // ← HIGHER = further up in sky
        const screenDistance = 0;     // ← ADJUST = forward/backward from property center

        // Create BIG sky screen geometry
        const skyScreenGeometry = new THREE.PlaneGeometry(screenWidth, screenHeight);

        // Create the sky screen mesh
        const skyVideoScreen = new THREE.Mesh(skyScreenGeometry, skyScreenMaterial);

        // Position the screen HIGH in the sky above the property
        skyVideoScreen.position.set(0, screenHeightInSky, screenDistance);

        // Optional: Add slight rotation to face viewers better
        // skyVideoScreen.rotation.set(0, 0, 0); // No rotation = flat
        // skyVideoScreen.rotation.set(-0.1, 0, 0); // Slight tilt down

        // Add the sky screen to the property
        element.posObject.add(skyVideoScreen);

        // Store video reference for cleanup if needed
        element.posObject.userData.video = video;
        element.posObject.userData.skyVideoScreen = skyVideoScreen;

        console.log(`🎬 MASSIVE SKY VIDEO SCREEN created for property ${element.landID}!`);
        console.log(`   Size: ${screenWidth}x${screenHeight} units (DOUBLED SIZE!)`);
        console.log(`   Height: ${screenHeightInSky} units in the sky`);
   
        console.log(`   Video: ${VIDEO_URL}`);

        return;
      }

      // Get the actual owner from our dynamic mapping
      const actualOwner = this.getOwnerForProperty(element.landID);
      if (actualOwner) {
        element.username = actualOwner;
        const displayName = `ID:${element.landID} - ${element.username}`;

        const spritey = this.makeTextSprite(displayName, {
          fontsize: 18,
          textColor: '#D50000',
        });

        if (element.landType == LAND_TYPE.STORE && element.posObject.userData.sub_type === LAND_TYPE.MAT) {
          spritey.scale.x *= 2.5;
        }

        if (!element.buildStatus) {
          element.posObject.add(spritey);
          spritey.position.set(0, 0.1, 0); // Reduced height to be very close to sign board
        }

        if (element.buildStatus) {
          const hasSprite = element.posObject.children.find((c) => c.type === 'Sprite');
          if (hasSprite) {
            element.posObject.remove(hasSprite);
          }
          element.posObject.add(spritey);
          spritey.position.set(0, 0.1, 0); // Reduced height to be very close to sign board
          element.SetFree(this.material);

          if (element.landType == LAND_TYPE.STORE) {
            const storeType = element.landInfo.home.metadata.attributes.find(
              (c) => c.trait_type === 'Type',
            ).value;

            if (element.posObject.userData.sub_type === LAND_TYPE.MAT) {
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
      } else {
        // Show just the land ID for properties without owners
        const displayName = `ID:${element.landID}`;
        const spritey = this.makeTextSprite(displayName, {
          fontsize: 18,
          textColor: '#666666', // Gray color for properties without owners
        });

        if (element.landType == LAND_TYPE.STORE && element.posObject.userData.sub_type === LAND_TYPE.MAT) {
          spritey.scale.x *= 2.5;
        }

        element.posObject.add(spritey);
        spritey.position.set(0, 0.1, 0); // Reduced height to be very close to sign board
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
  // Method to check wallet connection and fetch NFTs with retries
  // Enhanced method to check wallet connection and fetch NFTs with retries
  async checkWalletAndFetchNFTs(element: Land, retryCount = 0) {
    const displayAddress = this.getOwnerForProperty(element.landID);

    // If no owner found, skip NFT display
    if (!displayAddress) {
      console.warn(`No owner found for property ${element.landID}`);
      return;
    }

    // Find the user with this username
    const user = this.userData.find(u => u.username === displayAddress);

    // If user found and has NFT metadata
    if (user && user.nft_metadata && user.nft_metadata.length > 0) {
      // Remove any existing NFT boards
      element.posObject.children.forEach((child) => {
        if (child.userData && child.userData.isNftBoard) {
          element.posObject.remove(child);
        }
      });

      // Create NFT display board with all images
      this.createNFTDisplayBoard(
        element,
        user.nft_metadata,
        displayAddress
      );
    } else {
      console.warn('No NFT metadata available for this user');
    }
  }

  // Modify createNFTDisplayBoard to accept an array of NFT metadata
  createNFTDisplayBoard(
    element: Land,
    nftMetadata: any[],
    ownerAddress: string,
    nftIndex = 0
  ) {
    // Function to create NFT info texture
    const createNFTTexture = (): Promise<THREE.Texture> => {
      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 512;
      const context = canvas.getContext('2d');

      // Dark semi-transparent background with gradient
      const gradient = context.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, 'rgba(0, 0, 0, 0.7)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0.7)');
      context.fillStyle = gradient;
      context.fillRect(0, 0, canvas.width, canvas.height);

      // Add subtle border
      context.strokeStyle = 'rgba(100, 200, 255, 0.5)';
      context.lineWidth = 4;
      context.strokeRect(2, 2, canvas.width - 4, canvas.height - 4);

      // Create a promise to handle image loading
      return new Promise<THREE.Texture>((resolve) => {
        // Create an array to track loaded images
        const loadedImages: HTMLImageElement[] = [];
        let loadedCount = 0;

        // Function to draw images once all are loaded
        const drawImages = () => {
          // Dynamic grid calculation based on number of images
          const imageCount = loadedImages.length;
          let cols, rows;

          // Determine grid layout
          if (imageCount <= 2) {
            cols = imageCount;
            rows = 1;
          } else if (imageCount <= 4) {
            cols = 2;
            rows = 2;
          } else {
            cols = 3;
            rows = Math.ceil(imageCount / cols);
          }

          // Calculate image sizes dynamically
          const maxImageWidth = canvas.width / (cols + 0.5);
          const maxImageHeight = canvas.height / (rows + 0.5);
          const imageSize = Math.min(maxImageWidth, maxImageHeight);
          const padding = 10;

          // Center the grid
          const gridWidth = cols * (imageSize + padding) - padding;
          const gridHeight = rows * (imageSize + padding) - padding;
          const startX = (canvas.width - gridWidth) / 2;
          const startY = (canvas.height - gridHeight) / 2;

          // Draw images in a grid
          loadedImages.forEach((img, index) => {
            const row = Math.floor(index / cols);
            const col = index % cols;

            const imageX = startX + col * (imageSize + padding);
            const imageY = startY + row * (imageSize + padding);

            // Add a subtle white border to each image
            context.fillStyle = 'rgba(255, 255, 255, 0.2)';
            context.fillRect(imageX - 2, imageY - 2, imageSize + 4, imageSize + 4);

            // Draw the NFT image with slight shadow effect
            context.shadowColor = 'rgba(0, 0, 0, 0.5)';
            context.shadowBlur = 10;
            context.shadowOffsetX = 3;
            context.shadowOffsetY = 3;
            context.drawImage(img, imageX, imageY, imageSize, imageSize);

            // Reset shadow
            context.shadowColor = 'transparent';
          });

          const texture = new THREE.Texture(canvas);
          texture.needsUpdate = true;
          resolve(texture);
        };

        // Load all images
        nftMetadata.forEach((nft, index) => {
          const nftImage = new Image();
          nftImage.crossOrigin = 'anonymous';

          nftImage.onload = () => {
            loadedImages[index] = nftImage;
            loadedCount++;

            // If all images are loaded, draw them
            if (loadedCount === nftMetadata.length) {
              drawImages();
            }
          };

          nftImage.onerror = () => {
            console.warn(`Failed to load NFT image: ${nft.name}`);
            loadedCount++;

            // If all images are loaded (or failed), draw what we have
            if (loadedCount === nftMetadata.length) {
              drawImages();
            }
          };

          // Load the NFT image
          nftImage.src = nft.image;
        });
      });
    };

    // Create the board asynchronously
    const createBoard = async () => {
      try {
        // Create textures for both sides
        const frontTexture = await createNFTTexture();
        const backTexture = await createNFTTexture();

        // Create materials with alpha transparency
        const frontMaterial = new THREE.MeshBasicMaterial({
          map: frontTexture,
          transparent: true,
          side: THREE.FrontSide
        });

        const backMaterial = new THREE.MeshBasicMaterial({
          map: backTexture,
          transparent: true,
          side: THREE.FrontSide
        });

        // Create geometry for the NFT display board
        const boardGeometry = new THREE.PlaneGeometry(4, 2);

        // Create front and back meshes
        const frontBoardMesh = new THREE.Mesh(boardGeometry, frontMaterial);
        const backBoardMesh = new THREE.Mesh(boardGeometry, backMaterial);

        // Position both boards higher above the building (5-6 units up)
        const boardPosY = 4.8; // Raised significantly above the building

        frontBoardMesh.position.set(0, boardPosY, -5.8);   // Move forward
        backBoardMesh.position.set(0, boardPosY, -5.6);

        backBoardMesh.rotation.set(0, Math.PI, 0); // Rotate 180 degrees around Y axis

        // Mark as NFT boards for cleanup
        frontBoardMesh.userData = { isNftBoard: true };
        backBoardMesh.userData = { isNftBoard: true };

        // Add both meshes to the land object
        element.posObject.add(frontBoardMesh);
        element.posObject.add(backBoardMesh);

        console.log(`NFT display board created with ${nftMetadata.length} NFTs`);
      } catch (error) {
        console.error('Error creating NFT display board:', error);
      }
    };

    // Call the board creation function
    createBoard();
  }

}
