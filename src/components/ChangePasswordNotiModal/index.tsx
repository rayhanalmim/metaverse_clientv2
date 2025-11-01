import FormButton from '../Form/Button';
import React from 'react';
import Modal from 'react-modal';
import './style.css';

type IModal = {
  isOpen: boolean;
};

const ChangePasswordNotiModal: React.FC<IModal> = ({ isOpen }) => {
  const handleRefresh = () => {
    window.open('/auth/login', '_self');
  };
  return (
    <Modal isOpen={isOpen} className="change-password-modal">
      <div className="modal-content">
        Your account password has been changed
        <div>Please login again.</div>
      </div>
      <FormButton rounded="md" size="md" onClick={handleRefresh}>
        OK
      </FormButton>
    </Modal>
  );
};

export default ChangePasswordNotiModal;
