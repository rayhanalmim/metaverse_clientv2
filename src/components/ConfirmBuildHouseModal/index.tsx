import React from 'react';
import Modal from 'react-modal';
import './style.css';
import FormButton from '../Form/Button';
import InfoIcon from '../Icons/Info';

type IConfirmBuildHouseModal = {
  isOpen: boolean;
  onRequestClose: () => void;
  onBuild: () => void;
};

const ConfirmBuildHouseModal: React.FC<IConfirmBuildHouseModal> = ({
  isOpen,
  onRequestClose,
  onBuild,
}) => {
  return (
    <Modal isOpen={isOpen} className="custom-confirm-modal" onRequestClose={onRequestClose}>
      <div className="confirm-build">
        <div className="icon">
          <InfoIcon />
        </div>
        <div className="content">
          Are you sure you want <br /> to apply this house?
        </div>
        <div className="confirm-btn">
          <FormButton onClick={onBuild}>OK</FormButton>
          <FormButton onClick={onRequestClose}>Cancel</FormButton>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmBuildHouseModal;
