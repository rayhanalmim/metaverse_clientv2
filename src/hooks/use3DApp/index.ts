import { useAuth } from '../useAuth';
import { useSocket } from '../useSocket';
import { useEffect, useState } from 'react';
import Land from 'src/map3d/items/land';
import { LAND_TYPE, RAYLAYER, SCENE_NAME } from 'src/constant/constant';
import { useEvent } from '../useEvent';
import { usePrevious } from '../usePrevious';
import { EC_SITE_URL } from 'src/config';
import App3D from 'src/map3d/App3D';

let address = '';

export const use3DApp = ({ onJoinRoom }) => {
  const { threeApp, user } = useAuth();
  const app3D: App3D = threeApp as App3D;
  const { socket } = useSocket();
  const [land, setLand] = useState<Land>();
  const { useClickEvent, useMoveEvent } = useEvent();
  const [currentMesh, setCurrenMesh] = useState(null);
  const previousMesh = usePrevious(currentMesh);
  const [isShowStore, setIsShowStore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isShowBag, setIsShowBag] = useState(false);
  const [isShowMat, setIsShowMat] = useState(false);
  const [matId, setMatId] = useState('');
  let preScene = '';

  const isHas3DApp = () => {
    return !!(
      app3D &&
      app3D.mainScene &&
      app3D.mainScene.currentUserAvatar &&
      app3D.mainScene.currentUserAvatar.GetAvatarRoot()
    );
  };

  const onDisconnect = () => {
    socket.emit('out', { x: 0, y: 0, z: 0 });
    socket.disconnect();
  };

  useEffect(() => {
    if (user) address = user.wallet_address;
  }, [user]);

  const onClickLand = (ev) => {
    const rayObject = app3D.globalController.GetIntersectsAllInteractableObjects(ev);
    if (rayObject != null) {
      switch (rayObject.object.userData.RAYLAYER) {
        case RAYLAYER.ENVIRONMENT:
          break;
        case RAYLAYER.LAND:
          if (rayObject.instanceId) {
            const currentLand = rayObject.object.userData.lands[rayObject.instanceId];
            const landData = app3D.mainScene.GetAllLand();
            const item = landData.api.find((it) => it.token_id === currentLand.landID);
            if (!item || !item.home) {
              const dataLand = landData.models.find((it) => it.landID === currentLand.landID);
              if (dataLand && !dataLand.buildStatus) {
                setLand(dataLand);
              }
            }
          }
          break;
        case RAYLAYER.BUILDING:
          if (rayObject.object.userData.subType == LAND_TYPE.MAT) {
            setMatId(rayObject.object.userData.home.id);
            setIsShowMat(true);
          } else if (rayObject.object.userData.subType == LAND_TYPE.ECSITE) {
            window.open(EC_SITE_URL, '_blank');
            return;
          }
          break;
        case RAYLAYER.PORTAL:
          if (threeApp.GetSceneName() !== SCENE_NAME.MAIN) {
            preScene = threeApp.type;
          }
          // eslint-disable-next-line no-case-declarations
          const mainUi: any = document.querySelector('.App');
          if (mainUi) {
            mainUi.style.width = '100vw';
            mainUi.style.height = '100vh';
            mainUi.style.display = 'block';
          }
          threeApp.joinRoom(
            rayObject.object.userData.targetScene,
            rayObject.object.userData.category,
          );
          onJoinRoom();
          setIsLoading(true);
          setIsShowBag(false);
          threeApp.SceneLoader().onLoad = () => {
            setIsLoading(false);
            setIsShowBag(true);
          };
          setTimeout(() => {
            if (
              preScene === rayObject.object.userData.targetScene &&
              rayObject.object.userData.targetScene.includes(SCENE_NAME.SAMURAI)
            ) {
              setIsLoading(false);
              setIsShowBag(true);
            }
          }, 1000);
          // eslint-disable-next-line no-case-declarations
          const loadStore = () => {
            if (rayObject.object.userData.targetScene.includes(SCENE_NAME.STORE)) {
              if (threeApp.storeScene && threeApp.storeScene.isFinalLoadStore) {
                setTimeout(() => {
                  setIsLoading(false);
                  setIsShowBag(true);
                }, 500);
              } else {
                setTimeout(() => {
                  loadStore();
                }, 100);
              }
            }
          };
          loadStore();
          // eslint-disable-next-line no-case-declarations
          const loadHuman = () => {
            if (rayObject.object.userData.targetScene.includes(SCENE_NAME.HUMAN)) {
              if (threeApp.humanScene && threeApp.humanScene.isFinalLoadHuman) {
                setTimeout(() => {
                  setIsLoading(false);
                  setIsShowBag(true);
                }, 500);
              } else {
                setTimeout(() => {
                  loadHuman();
                }, 100);
              }
            }
          };
          loadHuman();
          setTimeout(() => {
            if (rayObject.object.userData.targetScene === SCENE_NAME.MAIN) {
              setIsLoading(false);
              setIsShowBag(true);
            }
          }, 500);
          break;
        case RAYLAYER.NPC:
          setIsShowStore(true);
          break;
      }
    }
  };

  const isMyLand = (rayObject) => {
    if (!rayObject.instanceId) return false;
    const currentLand = rayObject.object.userData.lands[rayObject.instanceId];
    const landData = app3D.mainScene.GetAllLand();
    const item = landData.api.find((it) => it.token_id === currentLand.landID);
    if (item && item.home) return false;
    const dataLand = landData.models.find((it) => it.landID === currentLand.landID);

    // Check if user is owner
    const isOwner = (item.owner || '').toLowerCase() === (address || '').toLowerCase();

    // Check if user is tenant (if rental data is available)
    const isTenant = item && item.home && item.home.tenant_wallet &&
                     item.home.tenant_wallet.toLowerCase() === (address || '').toLowerCase();

    if (!isOwner && !isTenant) return false;
    return dataLand && !dataLand.buildStatus;
  };

  const initMouseEvent = () => {
    useClickEvent(onClickLand);
    useMoveEvent((ev) => {
      const rayObject = app3D.globalController.GetIntersectsAllInteractableObjects(ev);
      if (
        rayObject != null &&
        rayObject.object.userData.RAYLAYER != null &&
        (isMyLand(rayObject) ||
          rayObject.object.userData.RAYLAYER == RAYLAYER.NPC ||
          rayObject.object.userData.RAYLAYER == RAYLAYER.PORTAL ||
          (rayObject.object.userData.RAYLAYER == RAYLAYER.BUILDING &&
            (rayObject.object.userData.subType == LAND_TYPE.ECSITE ||
              rayObject.object.userData.subType == LAND_TYPE.MAT)))
      ) {
        document.body.style.cursor = 'pointer';
      } else {
        document.body.style.cursor = 'default';
      }
    });
  };

  return {
    isHas3DApp,
    onDisconnect,
    land,
    setLand,
    initMouseEvent,
    currentMesh,
    previousMesh,
    isShowStore,
    setIsShowStore,
    isLoading,
    setIsLoading,
    isShowBag,
    setIsShowBag,
    isShowMat,
    matId,
    setIsShowMat,
  };
};
