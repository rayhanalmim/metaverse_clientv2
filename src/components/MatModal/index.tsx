import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { shortenString } from 'src/constant/constant';
import './style.css';
import { useMetaMask } from 'src/hooks/useMetamaskProvider';
import { IStoreItemData } from 'src/interfaces/property';
import { NFT_CHOMES, NFT_CLANDS, ETH_CHOMES, ETH_CLANDS } from 'src/config';
import { useAuth } from 'src/hooks/useAuth';
import IconPlus from '../Icons/Plus';
import MatChooseHouseModal from '../MatChooseHouseModal';
import myNft from '../../api/myNft';
import FormButton from '../Form/Button';

type IStoreModal = {
  isOpen: boolean;
  onRequestClose: () => void;
  onBuyLand: (item) => void;
  id: string;
};

const MatModal: React.FC<IStoreModal> = ({ isOpen, onRequestClose, id, onBuyLand }) => {
  const [listItem, setListItem] = useState([]);
  const [isShowChooseHouse, setIsShowChooseHouse] = useState(false);
  const [isShowDetail, setIsShowDetail] = useState(false);
  const [isMyMat, setIsMyMat] = useState(false);
  const [nftItem, setNftItem] = useState(null);
  const { formatPrice, comparePrice, isLoading, accountAddress, onApprove, onBuy } = useMetaMask();

  const getListMatDetail = async () => {
    if (!id) return;
    try {
      const { data } = await myNft.getMatDetail(id);
      const formatData = data.data.selling_list.map((c) => {
        return {
          ...c,
          nft: {
            ...c.nft,
            metadata: JSON.parse(c.nft.metadata),
          },
        };
      });
      setListItem(formatData);
    } catch (e) {
      console.error(e);
    }
  };

  const checkIsMyMat = async () => {
    const { data } = await myNft.getMatItem();
    if (data.data.some((c) => c.id == id) && accountAddress) setIsMyMat(true);
  };

  useEffect(() => {
    if (isOpen) {
      checkIsMyMat();
      getListMatDetail();
    }
  }, [id, isOpen]);

  useEffect(() => {
    setNftItem(null);
    setIsShowDetail(false);
    if (!isOpen) setListItem([]);
  }, [isOpen]);

  const onSelect = (house) => {
    setListItem(house);
  };

  const onShowDetail = (item) => {
    if (isMyMat) return;
    setNftItem(item);
    setIsShowDetail(true);
  };

  const getButtonText = () => (comparePrice(nftItem.price) ? 'Approve' : 'Buy Now');

  return (
    <Modal
      className="store-modal mat-modal"
      overlayClassName="store-overlay mat-modal-overlay"
      isOpen={isOpen}
      onRequestClose={onRequestClose}
    >
      <div className="store-modal-container">
        {!isShowDetail ? (
          <div className="list-store">
            {listItem.map((item) => (
              <div className="nft-item" key={item.id} onClick={() => onShowDetail(item)}>
                <div className="nft-image">
                  <img src={item.nft.metadata.image} alt="" />
                </div>
                <div className="nft-tag">
                  <div className="nft-name">{shortenString(item.nft.metadata.name)}</div>
                  <div className="nft-sell">
                    {formatPrice(item.price)}
                    <span className="unit">OVE</span>
                  </div>
                </div>
              </div>
            ))}
            {listItem.length < 11 && isMyMat && (
              <div className="nft-plus-item" onClick={() => setIsShowChooseHouse(true)}>
                <IconPlus />
              </div>
            )}
          </div>
        ) : (
          <>
            {nftItem && (
              <>
                <div className="store-detail">
                  <div className="left-side">
                    <div className="left-side-image">
                      <img src={nftItem.nft.metadata.image} alt="" />
                    </div>
                  </div>
                  <div className="right-side">
                    <div className="nft-info">
                      <div className="info-title">{nftItem.nft.metadata.name}</div>
                      <div className="info-owner">
                        <span className="label">Owned by </span>
                        {nftItem.nft.owner}
                      </div>
                      <div className="info-address">
                        <span className="label">Contact Address</span>
                        {nftItem.nft.token_address}
                      </div>
                      <div className="info-token">
                        <span className="label">Token ID</span>
                        {nftItem.nft.token_id}
                      </div>
                      <div className="info-detail">{nftItem.nft.metadata.description}</div>
                      <div className="info-price">
                        {formatPrice(nftItem.price)} <span>OVE</span>
                      </div>
                      {/* <div className="info-sub-price">($123.00)</div> */}
                    </div>
                    {(accountAddress || '').toLowerCase() !== nftItem.nft.owner.toLowerCase() && (
                      <div className="nft-action">
                        <FormButton
                          loading={isLoading}
                          className="buy-now"
                          size="lg"
                          onClick={() =>
                            comparePrice(nftItem.price)
                              ? onApprove(nftItem)
                              : onBuy(nftItem, onBuyLand)
                          }
                        >
                          {getButtonText()}
                        </FormButton>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
      <MatChooseHouseModal
        isOpen={isShowChooseHouse}
        id={id}
        onRequestClose={() => setIsShowChooseHouse(false)}
        onSelect={onSelect}
        listSelect={listItem}
      />
    </Modal>
  );
};

export default MatModal;
