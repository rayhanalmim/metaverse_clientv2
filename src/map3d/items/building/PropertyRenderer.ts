// metaverseclient/src/map3d/items/PropertyRenderer.ts
import * as THREE from 'three';
import { BUILD_STATUS, LAND_STATUS, LAND_TYPE } from 'src/constant/constant';

import IntanceMeshes from 'src/utils/IntanceMeshes';
import Environments from 'src/map3d/Init3d';
import Building from '../Building';
import ModuleBuilding from '../ModuleBuilding';
import Land from '../land';
import App3D from 'src/map3d/App3D';
import PhysicWorld from 'src/map3d/physic/PhysicWorld';

export default class PropertyRenderer {
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
  constructor(
    private propertyOwnerMap: Map<number, string>,
    private protal: THREE.Object3D,
    private storeBuildings: IntanceMeshes[],
    private storeEcBuildings: IntanceMeshes[],
    private storeMatBuildings: IntanceMeshes[],
    private samuraiBuildings: IntanceMeshes[],
    private humanBuildings: IntanceMeshes[],
    private physicWorld: PhysicWorld,
    private material: any
  ) {}

  // Convert English names to Japanese
  private convertToJapanese(englishName: string): string {
    return this.nameToJapaneseMap.get(englishName) || englishName;
  }

  // Get owner for a specific property
  private getOwnerForProperty(propertyId: number): string {
    return this.propertyOwnerMap.has(propertyId) 
      ? this.propertyOwnerMap.get(propertyId) 
      : '';
  }

  // Create a text sprite for displaying property information
  private makeTextSprite(message: string, parameters: { fontsize?: number, textColor?: string }) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const context = canvas.getContext('2d');
    
    // Set text properties
    context.fillStyle = parameters.textColor || '#000000';
    context.font = `${parameters.fontsize || 18}px Arial`;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    
    // Draw text with multiple passes for better visibility
    context.fillText(message, canvas.width / 2, canvas.height / 2);
    context.fillText(message, canvas.width / 2 - 1, canvas.height / 2);
    context.fillText(message, canvas.width / 2 + 1, canvas.height / 2);
    context.fillText(message, canvas.width / 2, canvas.height / 2 - 1);
    context.fillText(message, canvas.width / 2, canvas.height / 2 + 1);

    const texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(spriteMaterial);
    return sprite;
  }

  // Render special properties with unique rendering logic
  private renderSpecialProperty(element: Land) {
    switch (element.landID) {
      case 863: // NFT Blackboard
        this.renderNFTBoard(element);
        break;
      case 386: // Flag Property
        this.renderFlagProperty(element);
        break;
      case 384: // Medieval Sign Board
        this.renderSignBoardProperty(element);
        break;
    }
  }

  // Render NFT Board for property 863
  private renderNFTBoard(element: Land) {
    // Clear any existing NFT board
    element.posObject.children.forEach((child) => {
      if (child.userData && child.userData.isNftBoard) {
        element.posObject.remove(child);
      }
    });
    // Additional NFT board rendering logic can be added here
  }

  // Render Flag Property for property 386
  private renderFlagProperty(element: Land) {
    Environments.Ins.resourcesManager.LoadGLB(
      'models/buildings/flag/Flag1.glb',
      (gltf) => {
        const bbox = new THREE.Box3().setFromObject(gltf.scene);
        const size = bbox.getSize(new THREE.Vector3());
        const flagObject = gltf.scene.clone();
        
        const flagScale = new THREE.Vector3(0.2, 0.2, 0.2);
        const flagY = -0.1;
        
        flagObject.position.set(0, flagY, 0);
        flagObject.scale.copy(flagScale);
        flagObject.rotation.set(0, 0, 0);
        
        element.posObject.add(flagObject);
        
        const actualOwner = this.getOwnerForProperty(element.landID);
        if (actualOwner) {
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
  }

  // Render Sign Board Property for property 384
  private renderSignBoardProperty(element: Land) {
    Environments.Ins.resourcesManager.LoadGLB(
      'models/buildings/specific/old_medieval_sign_board.glb',
      (gltf) => {
        const bbox = new THREE.Box3().setFromObject(gltf.scene);
        const size = bbox.getSize(new THREE.Vector3());
        
        const signMesh = new IntanceMeshes(gltf.scene, 1);
        signMesh.ChangeCount(1);
        
        // Sign board positioning and scaling logic
        const matrix = new THREE.Matrix4();
        const pos = new THREE.Vector3(0, 0.1, 0);
        const quat = new THREE.Quaternion();
        
        const propertyScale = new THREE.Vector3(0.15, 0.08, 0.15);
        
        pos.y += 2;
        
        quat.setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI / 2);
        const tempQuat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI);
        quat.multiply(tempQuat);
        
        matrix.compose(pos, quat, propertyScale);
        signMesh.SetAtIndex(0, matrix);
        
        element.posObject.add(signMesh.root);
        
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
        
        // Additional sign board rendering logic
        const actualOwner = this.getOwnerForProperty(element.landID);
        if (actualOwner) {
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
  }

  // Main method for setting up property rendering
  setBuilding(element: Land, isAuth = false, forceMove = false) {
    // Handle special properties first
    this.renderSpecialProperty(element);

    // Check if the land is bought
    if (element.landStatus === LAND_STATUS.BUYED) {
      const actualOwner = this.getOwnerForProperty(element.landID);
      
      if (actualOwner) {
        element.username = actualOwner;
        const displayName = `ID:${element.landID} - ${element.username}`;
        
        const spritey = this.makeTextSprite(displayName, {
          fontsize: 18,
          textColor: '#D50000',
        });
        
        // Adjust sprite scale for MAT stores
        if (element.landType === LAND_TYPE.STORE && 
            element.posObject.userData.sub_type === LAND_TYPE.MAT) {
          spritey.scale.x *= 2.5;
        }
        
        // Add sprite to the element
        element.posObject.add(spritey);
        spritey.position.set(0, 0.1, 0);
        
        // Render buildings based on land type
        this.renderBuildingByLandType(element, spritey);
        
        // Force move avatar if specified
        if (forceMove) {
          App3D.Ins.mainScene.MoveAvatarToLand(element.landID.toString());
        }
      } else {
        // Handle properties without owners
        const displayName = `ID:${element.landID}`;
        const spritey = this.makeTextSprite(displayName, {
          fontsize: 18,
          textColor: '#666666', // Gray color for properties without owners
        });
        
        element.posObject.add(spritey);
        spritey.position.set(0, 0.1, 0);
      }
    }
  }

  // Render buildings based on land type
  private renderBuildingByLandType(element: Land, spritey: THREE.Sprite) {
    switch (element.landType) {
      case LAND_TYPE.STORE:
        this.renderStoreBuilding(element, spritey);
        break;
      case LAND_TYPE.SAMURAI:
        this.renderSamuraiBuilding(element, spritey);
        break;
      case LAND_TYPE.HUMAN:
        this.renderHumanBuilding(element, spritey);
        break;
    }
  }

  // Render store buildings
  private renderStoreBuilding(element: Land, spritey: THREE.Sprite) {
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
    } else {
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
  }

  // Render samurai buildings
  private renderSamuraiBuilding(element: Land, spritey: THREE.Sprite) {
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
  }

  // Render human buildings
  private renderHumanBuilding(element: Land, spritey: THREE.Sprite) {
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

  GetSamuraiBuildingByCategory(homeAttributes: any[]) {
    const attribute = homeAttributes.find((att) => att.trait_type === 'Category');
    return parseInt(attribute.value) - 1;
  }
}