import React from 'react';
import Modal from 'react-modal';
import FormButton from '../Form/Button';
import WarningIcon from '../Icons/Warning';

type INewSignInModal = {
  isOpen: boolean;
  onRequestClose: () => void;
};

const NewSignInModal: React.FC<INewSignInModal> = ({ isOpen, onRequestClose }) => {
  return (
    <Modal isOpen={isOpen} className="custom-confirm-modal" onRequestClose={onRequestClose}>
      <div className="confirm-logout confirm-new-sign-in">
        <div className="icon">
          <WarningIcon />
        </div>
        <div className="content">
          We noticed a new sign-in to your <br /> Sengoku account.
        </div>
        <div>Please check & secure your account.</div>
        <div className="confirm-btn">
          <FormButton onClick={onRequestClose}>OK</FormButton>
        </div>
      </div>
    </Modal>
  );
};

export default NewSignInModal;
