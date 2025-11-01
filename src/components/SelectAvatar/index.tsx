import IconArrowLeft from '../Icons/ArrowLeft';
import IconArrowRight from '../Icons/ArrowRight';
import IconMetaMask from '../Icons/MetaMask';
import { shortenString } from 'src/constant/constant';
import FormButton from '../Form/Button';
import { useMetaMask } from 'src/hooks/useMetamaskProvider';
import { getI18n } from 'react-i18next';
import { useAuth } from 'src/hooks/useAuth';
import React, { useEffect } from 'react';
import './style.css';

type ISelectAvatarProps = {
  onShowThreeApp: () => void;
  onPrevAvatar: () => void;
  onNextAvatar: () => void;
};

const SelectAvatar: React.FC<ISelectAvatarProps> = ({
  onShowThreeApp,
  onPrevAvatar,
  onNextAvatar,
}) => {
  const { connectWallet, accountAddress, accountBalance } = useMetaMask();
  const { t } = getI18n();
  const { user } = useAuth();

  return (
    <div className="avatar-main">
      <div className="avatar-scene-main">
        {user && !user.avatar_id && (
          <span id="previous-avatar" onClick={onPrevAvatar}>
            <IconArrowLeft />
          </span>
        )}
        <div id="avatar-scene-container" />
        {user && !user.avatar_id && (
          <span id="next-avatar" onClick={onNextAvatar}>
            <IconArrowRight />
          </span>
        )}
      </div>
      {user && <div className="username">{user.username}</div>}
      <div className="wallet">
        {!accountAddress && <span onClick={connectWallet}>{t('avatar.link_your_wallet')}</span>}
        {accountAddress && (
          <div className="metamask">
            <div>
              <span>
                <IconMetaMask />
              </span>
              <span className="address">{shortenString(accountAddress)}</span>
            </div>
            <div>
              <span className="balance">{accountBalance || 0}</span>
              {/* <span className="eth-icon"> */}
              {/*   <IconEth /> */}
              {/* </span> */}
              <span className="eth">OVE</span>
            </div>
          </div>
        )}
      </div>
      <div className="btn-play">
        <FormButton rounded="md" size="lg" onClick={onShowThreeApp}>
          {t('avatar.play')}
        </FormButton>
      </div>
    </div>
  );
};

export default SelectAvatar;
