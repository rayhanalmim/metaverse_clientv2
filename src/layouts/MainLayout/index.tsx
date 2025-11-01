import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from 'src/hooks/useAuth';
import { getI18n } from 'react-i18next';
import './style.css';
import Logo from 'src/assets/images/logo-metaverse.svg';
import { useSocket } from 'src/hooks/useSocket';
import React, { useCallback, useEffect, useState } from 'react';
import { IOverView } from 'src/interfaces/socket';
import Loader from 'src/components/Loader';
import { use3DApp } from 'src/hooks/use3DApp';
import Inventory from 'src/components/Inventory';
import SelectAvatar from 'src/components/SelectAvatar';
import Modal from 'react-modal';
import {
  BUILD_STATUS,
  CONTROL_MODE,
  defaultItem,
  ITEM_TYPE,
  LAND_STATUS,
  SCENE_NAME,
  SOCKET_EVENTS,
} from 'src/constant/constant';
import BagOpen from 'src/assets/images/bag-open.png';
import BagClose from 'src/assets/images/bag-close.png';
import BuildingModal from 'src/components/BuildingModal';
import NFTDisplay from 'src/components/NFTDisplay';
import { NFT_CHOMES, NFT_CLANDS, ETH_CHOMES, ETH_CLANDS } from 'src/config';
import StoreModal from 'src/components/StoreModal';
import LogoutModal from 'src/components/LogoutModal';
import MapNavigate from 'src/components/MapNavigate';
import MyNft from 'src/api/myNft';
import ShowMapUrl from 'src/assets/images/map/show-map.png';
import ChangePasswordNotiModal from 'src/components/ChangePasswordNotiModal';
import DisconnectModal from 'src/components/DisconnectModal';
import { useMetaMask } from 'src/hooks/useMetamaskProvider';
import NewSignInModal from 'src/components/NewSignInModal';
import IconShoot from '../../components/Icons/Shoot';
import { debounce } from 'lodash';
import MatModal from 'src/components/MatModal';
import RakuichiNFTDisplay from 'src/components/RakuichiNFTDisplay';
// import NFTDebugModal from 'src/components/NFTDebugModal';

let listStateItem = [];
let listItemSelect = [];
let prevItems = [];

const MainLayout = () => {
  const { t } = getI18n();
  const { isLogin, user, threeApp, setUserData, myNFT, setNFT, generalItems, getUser } = useAuth();
  const { socket } = useSocket();
  const [isShowModel, setIsShowModel] = useState(false);
  const [isShowMap, setIsShowMap] = useState(false);
  const [itemSelect, setItemSelect] = useState([]);
  const [gender, setGender] = useState(1);
  const [isChangePassword, setIsChangePassword] = useState(false);
  const [isDisconnect, setIsDisconnect] = useState(false);
  const [isNewSignIn, setIsNewSignIn] = useState(false);
  const [isShowShootingIcon, setIsShootingIcon] = useState(false);
  const [wallet, setWallet] = useState('');
  const { handleDisconnect, chainID } = useMetaMask();
  const [isNewState, setIsNewState] = useState(false);
  const [showNFTDisplay, setShowNFTDisplay] = useState(true);
  const [showRakuichiNFTDisplay, setShowRakuichiNFTDisplay] = useState(true);
  const [currentBuildingId, setCurrentBuildingId] = useState<string | number>('385');

  const homeAddress = [NFT_CHOMES.toLowerCase(), ETH_CHOMES.toLowerCase()];
  const landAddress = [NFT_CLANDS.toLowerCase(), ETH_CLANDS.toLowerCase()];

  const onJoinRoom = async () => {
    threeApp.getAvatarScene().activeAvatar.RemoveHorse();
    const newItemSelect = listItemSelect.filter((item) => item.type !== ITEM_TYPE.HORSE);
    setItemSelect([...newItemSelect]);
    await setUserItem(newItemSelect.map((item) => item.id));
    prevItems = [];
    setTimeout(() => {
      socket.emit(SOCKET_EVENTS.CHANGE_ITEMS, {
        itemsID: newItemSelect.map((item) => item.id),
        id: user.id,
      });
    }, 700);
  };

  const {
    isHas3DApp,
    onDisconnect,
    land,
    setLand,
    initMouseEvent,
    isShowStore,
    setIsShowStore,
    isLoading,
    setIsLoading,
    isShowBag,
    setIsShowBag,
    isShowMat,
    matId,
    setIsShowMat,
  } = use3DApp({ onJoinRoom });

  Modal.setAppElement('body');

  if (!isLogin) {
    return <Navigate to="/auth/login" />;
  }

  const debounceLoadData = useCallback(debounce(getUser, 300), []);

  useEffect(() => {
    if (chainID) setNFT();
    debounceLoadData(chainID);
  }, [chainID]);

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
      handleSocket();
    } else {
      handleSocket();
    }
  }, [socket]);

  const isReadyAvatar = () => {
    if (threeApp && threeApp.getAvatarScene() && threeApp.getAvatarScene().isHasAvatar) {
      if (isLoading) {
        setTimeout(() => {
          setIsLoading(false);
        }, 1000);
      }
    } else {
      setTimeout(() => {
        isReadyAvatar();
      }, 300);
    }
  };

  useEffect(() => {
    isReadyAvatar();
  }, [threeApp]);

  useEffect(() => {
    if (isLogin) {
      handleDisconnect();
      setIsLoading(true);
    }
    window.addEventListener('beforeunload', () => {
      onDisconnect();
    });
    window.onpopstate = () => {
      location.reload();
    };
    return () => {
      onDisconnect();
    };
  }, []);

  const loadUserItem = (data) => {
    if (generalItems.length === 0) {
      setIsNewState((st) => !st);
      return;
    }
    if (data && !data.avatar_id) {
      handleChangeAvatar(data);
    }
    if (data && data.avatar_id && data.items) {
      if (!socket.connected) {
        socket.connect();
      }
      handleChangeAvatar(data);
      if (listItemSelect.length !== 0) {
        prevItems = [...listItemSelect];
      }
      setItemSelect(data.items);
      listItemSelect = [...data.items];
      listStateItem = [...data.items];
      handleChangeItem(data);
    }
  };

  const debounceLoadUser = useCallback(debounce(loadUserItem, 500), [isNewState]);

  useEffect(() => {
    if (!threeApp?.mainScene) {
      debounceLoadUser(user);
    } else {
      loadUserItem(user);
    }
    socket.on(SOCKET_EVENTS.DISCONNECT, () => {
      setTimeout(() => {
        setIsDisconnect(true);
      }, 1000);
    });
  }, [user, isNewState]);

  const handleSocket = () => {
    socket.on(SOCKET_EVENTS.JOIN, (overview: IOverView) => {
      Object.keys(overview)
        .filter((key) => +key !== user.id)
        .forEach((key) => {
          threeApp.OtherAvatarScene(overview[key]);
        });
    });
    socket.on(SOCKET_EVENTS.OUT, ({ id }) => {
      threeApp.RemoveAvatar(id);
    });
    socket.on(SOCKET_EVENTS.OVERVIEW, (overview: IOverView) => {
      Object.keys(overview)
        .filter((key) => +key !== user.id)
        .forEach((key) => {
          threeApp.MoveAvatarScene(overview[key]);
        });
    });
    socket.on(SOCKET_EVENTS.JUMP, (data) => {
      threeApp.JumpAvatarScene(data);
    });
    socket.on(SOCKET_EVENTS.SHOOT, (data) => {
      threeApp.ShootAvatarScene(data);
    });
    socket.on(SOCKET_EVENTS.ARROW, (data) => {
      threeApp.ArrowAvatarScene(data);
    });
    socket.on(SOCKET_EVENTS.BUY_LAND_HOME, (data) => {
      console.log('hook.buy-land-home', data);
      const formatData = data.map((item) => {
        return { ...item, metadata: item.metadata ? JSON.parse(item.metadata) : {} };
      });
      formatData.forEach((dataItem) => {
        if (dataItem.is_selling) {
          const itemRemove = listItemSelect.find((item) => item.id === dataItem.id);
          if (!itemRemove) return;
          if (itemRemove.type === ITEM_TYPE.BODY) {
            threeApp.getAvatarScene().onChangeItem(defaultItem);
            return;
          }
          threeApp.getAvatarScene().onRemoveItem(itemRemove);
          return;
        }
        if (
          dataItem.is_closed &&
          (dataItem.seller || '').toLowerCase() === (user.wallet_address || '').toLowerCase()
        ) {
          getUser();
          return;
        }
        const isHouse = homeAddress.includes(dataItem.token_address.toLowerCase());
        if (!isHouse) {
          if (threeApp && threeApp.mainScene && threeApp.mainScene.NFTBuilding)
            threeApp.mainScene.NFTBuilding.setDataItem(
              dataItem,
              dataItem.status ||
                dataItem.owner.toLowerCase() === (user.wallet_address || '').toLowerCase(),
            );
        }
      });
      setTimeout(() => {
        setNFT();
      }, 1500);
    });
    socket.on(SOCKET_EVENTS.LAST_LOGIN, () => {
      setIsNewSignIn(true);
    });
    socket.on(SOCKET_EVENTS.CHANGE_ITEMS, (data) => {
      threeApp.UpdateItemAvatar(data.itemsID, data.id);
    });
    socket.on(SOCKET_EVENTS.CHANGE_PASSWORD, () => {
      setIsChangePassword(true);
    });
    socket.on(SOCKET_EVENTS.APPLY_HOME, (landData) => {
      threeApp.mainScene.NFTBuilding.ApplyHome(
        landData.land.token_id,
        landData.land,
        landData.username,
      );
    });
    socket.on(SOCKET_EVENTS.ROOM_BUY_HOME_LAND, (data) => {
      threeApp.mainScene.NFTBuilding.SetOwnerName(data.id, data.name);
    });
  };

  const handleChangeAvatar = (data) => {
    if (!threeApp) return;
    threeApp.getAvatarScene().SetAvatarId(data.avatar_id);
    threeApp.userID = data.id;
    if (data.avatar.gender) {
      setGender(+data.avatar.gender);
    }
  };

  const handleChangeItem = (data) => {
    if (
      !threeApp ||
      !threeApp.getAvatarScene() ||
      !threeApp.getAvatarScene().activeAvatar ||
      !threeApp.getAvatarScene().isHasAvatar
    ) {
      setTimeout(() => {
        handleChangeItem(data);
      }, 50);
      return;
    }

    if (!data.wallet_address && generalItems.length > 0) {
      const itemsNft = itemSelect.filter((item) => !generalItems.some((c) => c.id === item.id));
      itemsNft.forEach((item) => {
        threeApp.getAvatarScene().onRemoveItem(item);
      });
    }
    if (data.wallet_address && generalItems.length > 0) {
      if (!wallet) {
        setWallet(data.wallet_address);
      }
      if (wallet) {
        if (wallet !== data.wallet_address) {
          const itemsNft = itemSelect.filter((item) => !generalItems.some((c) => c.id === item.id));
          itemsNft.forEach((item) => {
            threeApp.getAvatarScene().onRemoveItem(item);
          });
        }
      }
    }

    const hasBody = data.items.some((it) => it.type === ITEM_TYPE.BODY);
    if (!hasBody) threeApp.getAvatarScene().onChangeItem(defaultItem);
    data.items.forEach((item, index) => {
      if (
        [SCENE_NAME.MAIN, SCENE_NAME.AVATARS].includes(threeApp.GetSceneName()) ||
        item.type !== ITEM_TYPE.HORSE
      ) {
        (function (ind) {
          setTimeout(function () {
            threeApp.getAvatarScene().onChangeItem(item);
          }, 1000 + 100 * ind);
        })(index);
      }
    });
    socket.emit(SOCKET_EVENTS.CHANGE_ITEMS, {
      itemsID: data.items
        .filter(
          (item) =>
            [SCENE_NAME.MAIN, SCENE_NAME.AVATARS].includes(threeApp.GetSceneName()) ||
            item.type !== ITEM_TYPE.HORSE,
        )
        .map((c) => c.id),
      id: data.id,
    });
  };

  const onBuild = async (house, forceMove = false) => {
    if (!land) return;
    const landId = threeApp.mainScene.NFTBuilding.GetLandId(land);
    const landDetail = threeApp.mainScene.NFTBuilding.GetLandDetail(land);
    await MyNft.applyHome(house.id, landId);
    land.landStatus = LAND_STATUS.BUYED;
    land.buildStatus = BUILD_STATUS.BUILDED;
    if (!land.username) {
      land.username = user.username;
    }
    land.landInfo = { ...landDetail, home: house };
    console.log(forceMove);
    threeApp.mainScene.NFTBuilding.setBuilding(land, null, forceMove);
    threeApp.mainScene.NFTBuilding.SetApplyHome(land.landID, house);
    setCurrentBuildingId(385);
    console.log('[MainLayout] Setting currentBuildingId:', land.landID);
    setShowRakuichiNFTDisplay(true);
    console.log('[MainLayout] Setting showRakuichiNFTDisplay to true');
    if (!socket.connected) {
      socket.connect();
    }
    // eslint-disable-next-line camelcase
    socket.emit(SOCKET_EVENTS.APPLY_HOME, {
      // eslint-disable-next-line camelcase
      land_id: landId,
      username: land.username,
      // eslint-disable-next-line camelcase
      chain_id: chainID,
    });
    setLand(null);
  };

  const applyHome = (id: number) => {
    // Get the land object to preserve its username
    const land = threeApp.mainScene.NFTBuilding.GetLandByID(id);
    // eslint-disable-next-line camelcase
    socket.emit(SOCKET_EVENTS.APPLY_HOME, {
      // eslint-disable-next-line camelcase
      land_id: id,
      username: land?.username || user.username, // Use existing username if available
      // eslint-disable-next-line camelcase
      chain_id: chainID,
    });
  };

  const onShowThreeApp = async () => {
    const joyMove: HTMLElement = document.querySelector('#joyDivMove');
    if (joyMove) joyMove.style.display = 'block';
    const listItemId = itemSelect.map((item) => item.id);
    if (user.last_room === '0' || !user.last_room) {
      await setUserItem(listItemId);
    } else {
      await setUserItem(
        itemSelect.filter((c) => c.type !== ITEM_TYPE.HORSE).map((item) => item.id),
      );
    }
    if (!threeApp) return;
    setIsLoading(true);
    let pos;
    let prevPos;
    let quaternion;
    if (user) {
      prevPos = user.previous_position ? JSON.parse(user.previous_position).position : null;
      pos = user.last_position ? JSON.parse(user.last_position).position : null;
      quaternion = user.previous_position ? JSON.parse(user.previous_position).quaternion : null;
    }
    threeApp.ActiveMainScene(pos, prevPos, user.last_room, quaternion);
    finalLoader();
  };

  const initKeyEvent = () => {
    document.addEventListener('pointerlockchange', () => {
      if (document.pointerLockElement === document.body) {
        setIsShootingIcon(true);
        return;
      }
      setIsShootingIcon(false);
    });
    window.addEventListener('keyup', (e) => {
      if (!socket.connected) return;
      const mode =
        threeApp.mainScene.currentControlMode === CONTROL_MODE.TPS
          ? CONTROL_MODE.FPS
          : CONTROL_MODE.TPS;
      const mapMode =
        threeApp.mainScene.currentControlMode === CONTROL_MODE.MAP
          ? CONTROL_MODE.TPS
          : CONTROL_MODE.MAP;
      switch (e.code) {
        case 'KeyY':
          setIsShowModel((state) => !state);
          break;
        case 'KeyP':
          if (threeApp.GetSceneName() === SCENE_NAME.STORE) setIsShowStore((st) => !st);
          break;
        case 'KeyM':
          if (threeApp.GetSceneName() === SCENE_NAME.MAIN)
            threeApp.mainScene.ChangeControlMode(mapMode);
          break;
        case 'KeyV':
          threeApp.mainScene.ChangeControlMode(mode);
          break;
        case 'KeyH':
          handlePointerLock();
          break;
      }
    });
  };

  const handlePointerLock = () => {
    if (document.pointerLockElement !== document.body) {
      document.body.requestPointerLock();
      return;
    }
    document.exitPointerLock();
  };

  const setUserItem = async (listItemId) => {
    const avatarId = threeApp.getAvatarScene().GetActiveAvatarId();
    await setUserData( user?.avatar_id || avatarId, listItemId);
  };

  const finalLoader = () => {
    if (!threeApp.mainScene.isFinalLoader()) {
      setTimeout(() => {
        finalLoader();
      }, 10);
      return;
    }
    setTimeout(() => {
      setIsLoading(false);
      setIsShowBag(true);
      initKeyEvent();
      initMouseEvent();
      const mainUi: any = document.querySelector('.App');
      if (mainUi) {
        mainUi.style.width = 0;
        mainUi.style.height = 0;
        mainUi.style.display = 'none';
      }
      socket.emit(SOCKET_EVENTS.INIT);
      threeApp.initSocket(socket);
      setInterval(() => {
        onMovement();
      }, 25);
    }, 3000);
  };

  const onMovement = () => {
    if (isHas3DApp()) {
      socket.emit(SOCKET_EVENTS.MOVEMENT, {
        position: threeApp.mainScene.currentUserAvatar.GetPosition(),
        quaternion: threeApp.mainScene.currentUserAvatar.GetQuaternion(),
        action: threeApp.mainScene.currentUserAvatar.GetCurrentActionName(),
        velocity: threeApp.mainScene.controller.GetVelocity(),
      });
    }
  };

  const onSelect = async (item, items) => {
    if (isShowModel) {
      const listItemId = items.map((it) => it.id);
      await setUserItem(listItemId);
      socket.emit(SOCKET_EVENTS.CHANGE_ITEMS, {
        itemsID: listItemId,
        id: user.id,
      });
    }
    const isAddItem = items.some((c) => c.id === item.id);
    if (isAddItem) {
      threeApp.getAvatarScene().onChangeItem(item);
      return;
    }
    threeApp.getAvatarScene().onRemoveItem(item);
  };

  const onPrevAvatar = async () => {
    await threeApp.getAvatarScene().onPrevAvatar();
    const avatarGender = threeApp.getAvatarScene().getGender();
    if (avatarGender !== gender) setItemSelect([]);
    setGender(avatarGender);
    removeItemAvatar(avatarGender);
  };

  const onNextAvatar = async () => {
    await threeApp.getAvatarScene().onNextAvatar();
    const avatarGender = threeApp.getAvatarScene().getGender();
    if (avatarGender !== gender) setItemSelect([]);
    setGender(avatarGender);
    removeItemAvatar(avatarGender);
  };

  const removeItemAvatar = (avatarGender) => {
    itemSelect.forEach((item) => {
      if (item.gender !== '0' && +item.gender !== avatarGender) {
        threeApp.getAvatarScene().onRemoveItem(item);
      }
    });
  };

  const onGotoItem = (item) => {
    if (threeApp.GetSceneName() === SCENE_NAME.MAIN) {
      threeApp.mainScene.MoveAvatarToLand(item.token_id);
    }
  };

  const onShowMap = () => {
    setIsShowMap((state) => !state);
  };

  const onChangeMode = (mode: string) => {
    threeApp.mainScene.ChangeControlMode(mode);
  };

  const onBuyLand = (item) => {
    if (landAddress.includes(item.nft.token_address.toLowerCase())) {
      threeApp.mainScene.NFTBuilding.SetOwnerName(item.nft.token_id, user.username);
      socket.emit(SOCKET_EVENTS.ROOM_BUY_HOME_LAND, { id: item.nft.token_id, name: user.username });
    }
    setIsShowStore(false);
  };

  const isChangeMapMode = threeApp?.GetSceneName() === SCENE_NAME.MAIN;

  console.log('[MainLayout] Render - NFT Display Status:', {
    showNFTDisplay,
    showRakuichiNFTDisplay,
    currentBuildingId
  });
  
  return (
    <>
      <div className="page-main">
        <Loader isLoading={isLoading} key="loading-3d" />
        <ChangePasswordNotiModal isOpen={isChangePassword} />
        <DisconnectModal isOpen={isDisconnect} />
        <LogoutModal
          isShowChangeMode={isShowBag}
          isOpen={true}
          onChangeMode={onChangeMode}
          isChangeMapMode={isChangeMapMode}
        />
        <div className="page-logo">
          <img src={Logo} alt="" />
        </div>
        <div className="avatar-title">{t('avatar.choose_avatar')}</div>
        <div className="section-avatar">
          <div className="select-avatar">
            <SelectAvatar
              onShowThreeApp={onShowThreeApp}
              onPrevAvatar={onPrevAvatar}
              onNextAvatar={onNextAvatar}
            />
            {!threeApp?.mainScene && (
              <Inventory
                gender={gender}
                onSelect={onSelect}
                itemSelect={itemSelect}
                setItemSelect={(item) => setItemSelect(item)}
                applyHome={applyHome}
              />
            )}
          </div>
        </div>
        <Modal
          isOpen={isShowModel}
          className="inventory-modal"
          onRequestClose={() => setIsShowModel(false)}
        >
          <Inventory
            gender={gender}
            onSelect={onSelect}
            itemSelect={itemSelect}
            setItemSelect={(item) => setItemSelect(item)}
            isModal={true}
            onGotoItem={onGotoItem}
            applyHome={applyHome}
          />
        </Modal>
        <Modal isOpen={isShowBag} overlayClassName="bag-icon">
          <div onClick={() => setIsShowModel(true)}>
            <img src={isShowModel ? BagOpen : BagClose} alt="Bag icon" />
          </div>
        </Modal>
        <BuildingModal
          isOpen={!!land && myNFT.lands.some((item) => item.token_id === land.landID)}
          onRequestClose={() => setLand(null)}
          onBuild={onBuild}
          houseList={myNFT.house}
          land={land}
        />
        <StoreModal
          isOpen={isShowStore}
          onRequestClose={() => setIsShowStore(false)}
          onBuyLand={onBuyLand}
        />
        <Modal isOpen={isShowBag && isShowMap} overlayClassName="navigate-modal">
          <MapNavigate />
        </Modal>
        <Modal isOpen={isShowShootingIcon} overlayClassName="shooting-point-modal">
          <IconShoot />
        </Modal>
        {threeApp && threeApp.GetSceneName() === SCENE_NAME.MAIN && (
          <Modal isOpen={isShowBag} overlayClassName="open-map-modal">
            <img onClick={onShowMap} src={ShowMapUrl} />
          </Modal>
        )}
      </div>
      <NewSignInModal isOpen={isNewSignIn} onRequestClose={() => setIsNewSignIn(false)} />
      <MatModal
        isOpen={isShowMat}
        onBuyLand={onBuyLand}
        onRequestClose={() => setIsShowMat(false)}
        id={matId}
      />
      {/* Replace the custom NFT debug button with our new modal component */}
      {/* <NFTDebugModal 
        isOpen={isShowBag}  
        buildingId={currentBuildingId} 
        showNFTDisplay={showRakuichiNFTDisplay}
        setShowNFTDisplay={setShowRakuichiNFTDisplay}
      /> */}
      <Outlet />
    </>
  );
};

export default MainLayout;
