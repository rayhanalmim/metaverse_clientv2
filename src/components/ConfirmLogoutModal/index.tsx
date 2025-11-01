import React from 'react';
import Modal from 'react-modal';
import './style.css';
import FormButton from '../Form/Button';
import { useAuth } from 'src/hooks/useAuth';
import InfoIcon from '../Icons/Info';

type ILogoutModal = {
  isOpen: boolean;
  onRequestClose: () => void;
};

const ConfirmLogoutModal: React.FC<ILogoutModal> = ({ isOpen, onRequestClose }) => {
  const { logout } = useAuth();

  return (
    <Modal isOpen={isOpen} className="custom-confirm-modal" onRequestClose={onRequestClose}>
      <div className="confirm-logout">
        <div className="icon">
          <InfoIcon />
        </div>
        <div className="content">Are you sure you want to logout?</div>
        <div className="confirm-btn">
          <FormButton onClick={logout}>OK</FormButton>
          <FormButton onClick={onRequestClose}>Cancel</FormButton>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmLogoutModal;
