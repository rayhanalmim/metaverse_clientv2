import React, { useEffect, useMemo, useState } from 'react';
import Modal from 'react-modal';
import FormButton from '../Form/Button';
import Select from 'react-select';
import { useMetaMask } from 'src/hooks/useMetamaskProvider';
import { BNB_CHAIN_ID, MUMBAI_CHAIN_ID } from '../../config';

type ILogoutModal = {
  isOpen: boolean;
  onRequestClose: () => void;
  onConfirm: (chain: string) => void;
};

const SwitchChainModal: React.FC<ILogoutModal> = ({ isOpen, onRequestClose, onConfirm }) => {
  const { chainID } = useMetaMask();
  const [chain, setChain] = useState('');
  const onChange = (item) => {
    setChain(item.value);
  };

  useEffect(() => {
    if (!isOpen) setChain('');
  }, [isOpen]);

  const options = useMemo(() => {
    if (`${chainID}` === BNB_CHAIN_ID) return [{ label: 'ETH', value: MUMBAI_CHAIN_ID }];
    if (`${chainID}` === MUMBAI_CHAIN_ID) return [{ label: 'BNB', value: BNB_CHAIN_ID }];
    return [
      { label: 'ETH', value: MUMBAI_CHAIN_ID },
      { label: 'BNB', value: BNB_CHAIN_ID },
    ];
  }, [chainID]);

  const colourStyles = {
    control: (styles) => ({ ...styles, backgroundColor: 'white', width: '200px' }),
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
    <Modal isOpen={isOpen} className="custom-confirm-modal" onRequestClose={onRequestClose}>
      <div className="confirm-logout">
        <div className="icon">Choose your Network</div>
        <div className="content">
          <div className="land-select">
            <Select
              options={options}
              onChange={onChange}
              className="select-lands"
              styles={colourStyles}
            />
          </div>
        </div>
        <div className="confirm-btn">
          <FormButton disabled={!chain} onClick={() => onConfirm(chain)}>
            OK
          </FormButton>
          <FormButton onClick={onRequestClose}>Cancel</FormButton>
        </div>
      </div>
    </Modal>
  );
};

export default SwitchChainModal;
