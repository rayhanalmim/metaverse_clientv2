import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { inventoryTabs, ITEM_TYPE, shortenString } from 'src/constant/constant';
import './style.css';
import FormButton from '../Form/Button';
import myNft from 'src/api/myNft';
import { useMetaMask } from 'src/hooks/useMetamaskProvider';
import { IStoreItemData } from 'src/interfaces/property';
import { NFT_CHOMES, NFT_CLANDS, ETH_CHOMES, ETH_CLANDS } from 'src/config';
import { useAuth } from 'src/hooks/useAuth';

type IStoreModal = {
  isOpen: boolean;
  onRequestClose: () => void;
  onBuyLand: (item) => void;
};

const StoreModal: React.FC<IStoreModal> = ({ isOpen, onRequestClose, onBuyLand }) => {
  const { threeApp } = useAuth();
  const [isShowDetail, setIsShowDetail] = useState(false);
  const [tab, setTab] = useState(ITEM_TYPE.BODY);
  const [nftItem, setNftItem] = useState<Partial<IStoreItemData>>({});
  const [listAllItem, setListAllItem] = useState<IStoreItemData[]>([]);
  const [listItem, setListItem] = useState<IStoreItemData[]>([]);
  const { formatPrice, comparePrice, onApprove, onBuy, isLoading, accountAddress } = useMetaMask();

  const homeAddress = [NFT_CHOMES.toLowerCase(), ETH_CHOMES.toLowerCase()];
  const landAddress = [NFT_CLANDS.toLowerCase(), ETH_CLANDS.toLowerCase()];

  const onShowItem = (item) => {
    setNftItem(item);
    setIsShowDetail(true);
  };

  useEffect(() => {
    if (isOpen) {
      setIsShowDetail(false);
      getListSelling();
      setTab(ITEM_TYPE.BODY);
      setListItem([]);
    }
  }, [isOpen]);

  const getListSelling = async () => {
    const landId = threeApp.type.replace(/^\D+/g, '');
    if (!landId) return;
    const land = threeApp.mainScene.NFTBuilding.GetLandHasHouse().find(
      (item) => item.token_id === +landId,
    );
    const { data } = await myNft.listStoreSelling(land.owner);
    setListAllItem(data.data || []);
    setListItem([
      ...data.data.filter(
        (c) =>
          c.nft.metadata.attributes.find((c) => c.trait_type === 'Type').value === ITEM_TYPE.BODY,
      ),
    ]);
  };

  const onShowTab = (item) => {
    setTab(item.key);
    setIsShowDetail(false);
    if (item.key === 'house') {
      setListItem([
        ...listAllItem.filter((c) => homeAddress.includes(c.nft.token_address.toLowerCase())),
      ]);
      return;
    }
    if (item.key === 'lands') {
      setListItem([
        ...listAllItem.filter((c) => landAddress.includes(c.nft.token_address.toLowerCase())),
      ]);
      return;
    }
    setListItem([
      ...listAllItem.filter(
        (c) => c.nft.metadata.attributes.find((c) => c.trait_type === 'Type').value === item.key,
      ),
    ]);
  };

  const getButtonText = () => (comparePrice(nftItem.price) ? 'Approve' : 'Buy Now');

  return (
    <Modal
      className="store-modal"
      overlayClassName="store-overlay"
      isOpen={isOpen}
      onRequestClose={onRequestClose}
    >
      <div className="store-modal-container">
        <div className="tab">
          {inventoryTabs.map((item) => (
            <div
              className={`${tab === item.key ? 'tab-active' : ''} tab-item`}
              key={item.key}
              onClick={() => onShowTab(item)}
            >
              {item.name}
            </div>
          ))}
        </div>
        {!isShowDetail ? (
          <div className="list-store">
            {listItem.map((item) => (
              <div className="nft-item" key={item.id}>
                <div className="nft-image" onClick={() => onShowItem(item)}>
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
            {listItem.length === 0 && <div className="no-data">No data</div>}
          </div>
        ) : (
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
                      comparePrice(nftItem.price) ? onApprove(nftItem) : onBuy(nftItem, onBuyLand)
                    }
                  >
                    {getButtonText()}
                  </FormButton>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default StoreModal;
