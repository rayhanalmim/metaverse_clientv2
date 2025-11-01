import FormButton from '../Form/Button';
import React, { useState } from 'react';
import Modal from 'react-modal';
import './style.css';
import Land from 'src/map3d/items/land';
import { useAuth } from 'src/hooks/useAuth';
import { LAND_TYPE } from 'src/constant/constant';
import ConfirmBuildHouseModal from '../ConfirmBuildHouseModal';
import { MARKET_PLACE_URL } from 'src/config';
import { IHomeLandData } from 'src/interfaces/general';

type IBuildingModal = {
  isOpen: boolean;
  onRequestClose: () => void;
  onBuild: (house, forceMove) => void;
  houseList: IHomeLandData[];
  land: Land;
};

const BuildingModal: React.FC<IBuildingModal> = ({
  isOpen,
  onRequestClose,
  onBuild,
  houseList,
  land,
}) => {
  const { threeApp } = useAuth();
  const [isShowConfirm, setIsShowConfirm] = useState(false);
  const [houseItem, setHouseItem] = useState();
  const getHouseType = (house) => {
    const data = house.metadata.attributes.find((item) => item.trait_type === 'Type');
    if (!data) return;
    return data.value;
  };

  const listHouse = () => {
    if (!land) return [];
    const houseDisable = threeApp.mainScene.NFTBuilding.GetLandHasHouse();
    if (land.posObject.userData.sub_type && land.posObject.userData.sub_type === LAND_TYPE.MAT) {
      return houseList
        .filter(
          (item) =>
            getHouseType(item) === land.landType ||
            ([LAND_TYPE.MAT].includes(getHouseType(item)) && land.landType === LAND_TYPE.STORE),
        )
        .filter((item) => !houseDisable.some((c) => c.home.id === item.id));
    }
    return houseList
      .filter(
        (item) =>
          getHouseType(item) === land.landType ||
          ([LAND_TYPE.STORE, LAND_TYPE.MARKETPLACE, LAND_TYPE.ECSITE].includes(
            getHouseType(item),
          ) &&
            land.landType === LAND_TYPE.STORE),
      )
      .filter((item) => !houseDisable.some((c) => c.home.id === item.id));
  };
  const handleBuild = () => {
    if (houseItem) {
      onBuild(houseItem, true);
      setHouseItem(null);
    }
    onCloseConfirm();
    onRequestClose();
  };

  const onShowConfirm = (item) => {
    setHouseItem(item);
    setIsShowConfirm(true);
  };

  const onCloseConfirm = () => {
    setIsShowConfirm(false);
  };

  const onShowNFTDetail = (item) => {
    window.open(
      `${MARKET_PLACE_URL}/detail?tokenId=${item.token_id}&tokenAddress=${item.token_address}`,
      '_blank',
    );
  };

  return (
    <>
      <Modal isOpen={isOpen} className="land-modal" onRequestClose={onRequestClose}>
        <div className="land-modal-title">choose your house</div>
        <div className={listHouse().length === 0 ? 'land-component no-scroll' : 'land-component'}>
          {listHouse().map((item) => (
            <div className="inventory-item" key={item.token_id}>
              <img src={item.metadata.image} alt="" />
              <div className="tab-hover">
                <div className="detail-home-btn">
                  <FormButton onClick={() => onShowNFTDetail(item)}>Detail</FormButton>
                </div>
                <div className="apply-home-btn">
                  <FormButton onClick={() => onShowConfirm(item)}>Build</FormButton>
                </div>
              </div>
            </div>
          ))}
          {Array.from(Array(16).keys()).map((item, index) => (
            <div className="inventory-item" key={index}></div>
          ))}
          {listHouse().length === 0 && <div className="no-data"> No Data</div>}
        </div>
      </Modal>
      <ConfirmBuildHouseModal
        isOpen={isShowConfirm}
        onRequestClose={onCloseConfirm}
        onBuild={handleBuild}
      />
    </>
  );
};

export default BuildingModal;
