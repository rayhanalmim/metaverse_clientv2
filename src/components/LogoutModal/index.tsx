import React, { useEffect, useState, useRef } from 'react';
import Modal from 'react-modal';
import './style.css';
import FormButton from '../Form/Button';
import IconLogout from '../Icons/Logout';
import IconActivity from '../Icons/Activity';
import ActitvityModal from '../ActitvityModal';
import { useMetaMask } from 'src/hooks/useMetamaskProvider';
import { getCookie, setCookie } from 'src/utils/ObjectUtils';
import { CONTROL_MODE, SCENE_NAME } from 'src/constant/constant';
import IconSetting from '../Icons/Setting';
import IconMenu from '../Icons/Menu';
import IconNFT from '../Icons/NFT';
import IconHouse from '../Icons/House';
import IconBuilding from '../Icons/Building';
import ConfirmLogoutModal from '../ConfirmLogoutModal';
import SwitchChainModal from '../SwitchNetworkModal';
import Eth from '../Icons/Eth';
import { useAuth } from '../../hooks/useAuth';
import SwitchNetworkSuccessModal from '../SwitchNetworkSuccessModal';
import MyNFTModal from '../MyNFTModal';
import RentHouseModal from '../RentHouseModal';
import RentedBuildingsModal from '../RentedBuildingsModal';

type ILogoutModal = {
  isOpen: boolean;
  onChangeMode: (mode) => void;
  isShowChangeMode: boolean;
  isChangeMapMode: boolean;
};

const LogoutModal: React.FC<ILogoutModal> = ({
  isOpen,
  onChangeMode,
  isShowChangeMode,
  isChangeMapMode,
}) => {
  const { accountAddress, connectWallet, switchNetwork } = useMetaMask();

  const [isShowActivity, setIsShowActivity] = useState(false);
  const [isShowMyNFT, setIsShowMyNFT] = useState(false);
  const [isShowRentHouse, setIsShowRentHouse] = useState(false);
  const [isShowRentedBuildings, setIsShowRentedBuildings] = useState(false);
  const { getUser, threeApp } = useAuth();
  const [isShowMenu, setIsShowMenu] = useState(false);
  const [isShowSetting, setIsShowSetting] = useState(false);
  const [isShowLogout, setIsShowLogout] = useState(false);
  const [isShowSwitchChain, setIsShowSwitchChain] = useState(false);
  const [isShowSwitchSuccess, setIsShowSwitchSuccess] = useState(false);
  const [farDetail, setFarDetail] = useState(+(getCookie('Setting_detail') || '2'));
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (!isShowMenu) {
      setIsShowSetting(false);
      return;
    }

    const handleClose = (ev) => {
      if (wrapperRef.current && !wrapperRef.current.contains(ev.target)) {
        setIsShowMenu(false);
      }
    };

    window.addEventListener('click', handleClose);
    return () => window.removeEventListener('click', handleClose);
  }, [isShowMenu]);

  const showActivity = () => {
    if (!accountAddress) {
      connectWallet();
      setIsShowMenu(false);
      return;
    }
    setIsShowActivity(true);
    setIsShowMenu(false);
  };

  const showMyNFT = () => {
    setIsShowMyNFT(true);
    setIsShowMenu(false);
  };

  const showRentHouse = () => {
    setIsShowRentHouse(true);
    setIsShowMenu(false);
  };

  const showRentedBuildings = () => {
    setIsShowRentedBuildings(true);
    setIsShowMenu(false);
  };

  const onRequestClose = () => {
    setIsShowMenu(false);
  };

  const onReloadPage = () => {
    setCookie('Setting_detail', farDetail, 30);
    location.reload();
  };

  const onShowSetting = () => {
    setIsShowSetting((st) => !st);
  };

  const onShowConfirmLogout = () => {
    setIsShowMenu(false);
    setIsShowLogout(true);
  };

  const onSwitchChain = async (chain: string) => {
    await switchNetwork(chain);
    await getUser();
    setIsShowSwitchChain(false);
    setIsShowSwitchSuccess(true);
  };

  return (
    <>
      <Modal
        className="logout-modal"
        overlayClassName="logout-modal-overlay"
        isOpen={isOpen}
        onRequestClose={onRequestClose}
      >
        <span ref={wrapperRef}>
          <span
            className={isShowMenu ? 'icon-menu is-focus' : 'icon-menu'}
            onClick={() => setIsShowMenu((st) => !st)}
          >
            <IconMenu />
          </span>
          {isShowMenu && (
            <div className="menu">
              <div className="activity-btn">
                <FormButton rounded="sm" onClick={onShowConfirmLogout}>
                  <IconLogout />
                  Logout
                </FormButton>
              </div>
              <div className={isShowActivity ? 'activity-btn is-focus' : 'activity-btn'}>
                <FormButton rounded="sm" onClick={showActivity}>
                  <IconActivity />
                  Activity
                </FormButton>
              </div>
              <div className={isShowMyNFT ? 'activity-btn is-focus' : 'activity-btn'}>
                <FormButton rounded="sm" onClick={showMyNFT}>
                  <IconNFT />
                  My NFT
                </FormButton>
              </div>
              <div className={isShowRentHouse ? 'activity-btn is-focus' : 'activity-btn'}>
                <FormButton rounded="sm" onClick={showRentHouse}>
                  <IconHouse />
                  Rent a Building
                </FormButton>
              </div>
              <div className={isShowRentedBuildings ? 'activity-btn is-focus' : 'activity-btn'}>
                <FormButton rounded="sm" onClick={showRentedBuildings}>
                  <IconBuilding />
                  Rented Buildings
                </FormButton>
              </div>
              <div className={isShowSetting ? 'activity-btn is-focus' : 'activity-btn'}>
                <FormButton rounded="sm" onClick={onShowSetting}>
                  <IconSetting />
                  Settings
                </FormButton>
              </div>
              {isShowSetting && (
                <>
                  <div className="far-detail">
                    Graphic Setting:
                    <div className="far-detail-input">
                      <FormButton onClick={() => setFarDetail((num) => (num > 1 ? --num : num))}>
                        -
                      </FormButton>
                      <span>{farDetail}</span>
                      <FormButton onClick={() => setFarDetail((num) => (num < 3 ? ++num : num))}>
                        +
                      </FormButton>
                    </div>
                    <div className="far-detail-btn">
                      <FormButton onClick={onReloadPage}>Reload</FormButton>
                    </div>
                  </div>
                  {isShowChangeMode && (
                    <>
                      <div>Control Mode</div>
                      <div className="control-mode">
                        {isChangeMapMode && (
                          <FormButton onClick={() => onChangeMode(CONTROL_MODE.MAP)}>
                            {CONTROL_MODE.MAP}
                          </FormButton>
                        )}
                        <FormButton onClick={() => onChangeMode(CONTROL_MODE.TPS)}>
                          {CONTROL_MODE.TPS}
                        </FormButton>
                        <FormButton onClick={() => onChangeMode(CONTROL_MODE.FPS)}>
                          {CONTROL_MODE.FPS}
                        </FormButton>
                      </div>
                    </>
                  )}
                </>
              )}
              {accountAddress &&
                [SCENE_NAME.MAIN, SCENE_NAME.AVATARS].includes(threeApp.GetSceneName()) && (
                  <div className="activity-btn">
                    <FormButton onClick={() => setIsShowSwitchChain(true)}>
                      <Eth />
                      Network
                    </FormButton>
                  </div>
                )}
            </div>
          )}
        </span>
      </Modal>
      <ActitvityModal isOpen={isShowActivity} onRequestClose={() => setIsShowActivity(false)} />
      <MyNFTModal isOpen={isShowMyNFT} onRequestClose={() => setIsShowMyNFT(false)} />
      <RentHouseModal isOpen={isShowRentHouse} onRequestClose={() => setIsShowRentHouse(false)} />
      <RentedBuildingsModal isOpen={isShowRentedBuildings} onRequestClose={() => setIsShowRentedBuildings(false)} />
      <ConfirmLogoutModal isOpen={isShowLogout} onRequestClose={() => setIsShowLogout(false)} />
      <SwitchChainModal
        isOpen={isShowSwitchChain}
        onRequestClose={() => setIsShowSwitchChain(false)}
        onConfirm={onSwitchChain}
      />
      <SwitchNetworkSuccessModal isOpen={isShowSwitchSuccess} />
    </>
  );
};

export default LogoutModal;
