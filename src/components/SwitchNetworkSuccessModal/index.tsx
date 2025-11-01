import React, { useState } from 'react';
import Modal from 'react-modal';
import FormButton from '../Form/Button';
import IconCheckBox from '../Icons/CheckBox';
import './style.css';

type ILogoutModal = {
  isOpen: boolean;
};

const SwitchNetworkSuccessModal: React.FC<ILogoutModal> = ({ isOpen }) => {
  const onReload = () => {
    location.reload();
  };

  return (
    <Modal isOpen={isOpen} className="custom-confirm-modal">
      <div className="confirm-logout switch-network-success">
        <div className="icon">
          <IconCheckBox />
        </div>
        <div className="content">
          <div className="land-select">Switch network successfully!</div>
          <span className="sub-content"> Please reload this load.</span>
        </div>
        <div className="confirm-btn">
          <FormButton onClick={onReload}>Reload</FormButton>
        </div>
      </div>
    </Modal>
  );
};

export default SwitchNetworkSuccessModal;
