import FormButton from '../Form/Button';
import React, { useState } from 'react';
import Modal from 'react-modal';
import Select from 'react-select';
import './style.css';
import { useAuth } from 'src/hooks/useAuth';
import { BUILD_STATUS, LAND_STATUS, LAND_TYPE } from 'src/constant/constant';
import MyNft from 'src/api/myNft';
import { toast } from 'react-toastify';
import { IHomeLandData } from 'src/interfaces/general';

type IModal = {
  isOpen: boolean;
  onRequestClose: () => void;
  lands: IHomeLandData[];
  house: IHomeLandData;
  applyHome: (landId: number) => void;
};

const ChooseLandModal: React.FC<IModal> = ({ isOpen, onRequestClose, lands, house, applyHome }) => {
  const { threeApp, user } = useAuth();
  const [data, setData] = useState(null);

  const options = () => {
    if (house?.metadata?.attributes.find((x) => x.trait_type === 'Type').value === LAND_TYPE.MAT) {
      const landsMat = threeApp?.mainScene?.NFTBuilding?.GetAllLand().mat;
      return lands
        .filter(
          (c) =>
            landsMat.some((x) => x.landID === c.token_id) &&
            !threeApp.mainScene.NFTBuilding.GetLandHasHouse().some(
              (v) => v.token_id === c.token_id,
            ),
        )
        .map((item) => {
          return {
            value: item.token_id,
            label: item.metadata.name,
          };
        });
    }
    const landsMat = threeApp?.mainScene?.NFTBuilding?.GetAllLand().mat;
    return lands
      .filter((c) => {
        return (
          !landsMat?.some((x) => x.landID === c.token_id) &&
          (c.metadata.attributes.find((x) => x.trait_type === 'Type').value ===
            house?.metadata?.attributes.find((x) => x.trait_type === 'Type').value ||
            (c.metadata.attributes.find((x) => x.trait_type === 'Type').value === LAND_TYPE.STORE &&
              [LAND_TYPE.STORE, LAND_TYPE.MARKETPLACE, LAND_TYPE.ECSITE].includes(
                house?.metadata?.attributes.find((x) => x.trait_type === 'Type').value,
              ))) &&
          !threeApp.mainScene.NFTBuilding.GetLandHasHouse().some((v) => v.token_id === c.token_id)
        );
      })
      .map((item) => {
        return {
          value: item.token_id,
          label: item.metadata.name,
        };
      });
  };

  const onBuild = async () => {
    const land = threeApp.mainScene.NFTBuilding.GetAllLand().models.find(
      (item) => item.landID === data?.value,
    );

    const landApi = threeApp.mainScene.NFTBuilding.GetAllLand().api.find(
      (item) => item.token_id === data?.value,
    );

    try {
      await MyNft.applyHome(house.id, landApi.id);

      land.landStatus = LAND_STATUS.BUYED;
      land.buildStatus = BUILD_STATUS.BUILDED;
      land.username = user.username;
      land.landInfo = { ...landApi, home: house };
      threeApp.mainScene.NFTBuilding.setBuilding(land);
      threeApp.mainScene.NFTBuilding.SetApplyHome(landApi.token_id, house);
      applyHome(landApi.id);
      onRequestClose();
    } catch (e) {
      toast(e.response.data.message, { type: 'error' });
    }
  };

  const onChange = (item) => {
    setData(item);
  };

  const colourStyles = {
    control: (styles) => ({ ...styles, backgroundColor: 'white' }),
    option: (styles, { isDisabled, isFocused, isSelected }) => {
      return {
        ...styles,
        backgroundColor: isDisabled
          ? undefined
          : isSelected
          ? 'rgba(255, 192, 0, 1)'
          : isFocused
          ? 'rgba(255, 192, 0, 0.4)'
          : undefined,
        color: 'black',
      };
    },
  };

  return (
    <Modal isOpen={isOpen} className="choose-land-modal" onRequestClose={onRequestClose}>
      <div className="modal-content">
        <div>Choose your land</div>
        <div className="land-select">
          <Select
            options={options()}
            onChange={onChange}
            className="select-lands"
            styles={colourStyles}
          />
        </div>
      </div>
      <div className="choose-land-btn">
        <FormButton rounded="md" onClick={onBuild}>
          BUILD
        </FormButton>
        <FormButton rounded="md" onClick={onRequestClose}>
          CANCEL
        </FormButton>
      </div>
    </Modal>
  );
};

export default ChooseLandModal;
