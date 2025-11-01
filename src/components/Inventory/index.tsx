import './style.css';
import React, { useCallback, useEffect, useState } from 'react';
import { inventoryTabs, ITEM_TYPE, SCENE_NAME } from 'src/constant/constant';
import IconCheck from '../Icons/Check';
import GeneralRepo from 'src/api/general';
import { IMasterItem } from 'src/interfaces/general';
import { getNetworkId, useAuth } from 'src/hooks/useAuth';
import { useSocket } from 'src/hooks/useSocket';
import FormButton from '../Form/Button';
import ChooseLandModal from '../ChooseLandModal';
import { debounce } from 'lodash';
import { MARKET_PLACE_URL } from 'src/config';

export type IInventoryProps = {
  onSelect: (item, items) => void;
  gender: number;
  itemSelect: IMasterItem[];
  setItemSelect: (itemsData) => void;
  isModal?: boolean;
  onGotoItem?: (item) => void;
  applyHome: (landId: number) => void;
};

const Inventory: React.FC<IInventoryProps> = ({
  onSelect,
  gender,
  itemSelect,
  setItemSelect,
  isModal,
  onGotoItem,
  applyHome,
}) => {
  const tabs = inventoryTabs.filter((item) => {
    if (isModal) return true;
    return !['lands', 'house'].includes(item.key);
  });
  const [listAllItem, setListAllItem] = useState<IMasterItem[]>([]);
  const [tab, setTab] = useState({ name: 'body', key: 'body' });
  const [listActive, setListActive] = useState<IMasterItem[] | any>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isChooseLand, setIsChooseLand] = useState(false);
  const [house, setHouse] = useState(null);
  const { setNFT, myNFT, threeApp, setItemsDefault, generalItems } = useAuth();
  const { socket } = useSocket();

  const fetchData = (isShow) => {
    if (isShow) {
      getListItem();
      setNFT();
    }
  };

  const debounceLoadData = useCallback(debounce(fetchData, 300), []);

  const onChangeTab = (item) => {
    setTab(item);
  };

  const getListItem = async () => {
    if (generalItems.length === 0) {
      const { data } = await GeneralRepo.listItem();
      const formatData = data.data.filter((item) => item.link !== 'models/items/Set1_Body.glb');
      setListAllItem(formatData);
      setItemsDefault(formatData);
      setListActive([
        ...formatData.filter((item) => item.type === tab.key),
        ...(myNFT[tab.key] || []),
      ]);
      return;
    }
    setListAllItem(generalItems);
    setListActive([
      ...generalItems.filter(
        (item) => item.type === tab.key && item.link !== 'models/items/Set1_Body.glb',
      ),
      ...(myNFT[tab.key] || []),
    ]);
  };

  const isRoom = () => ![SCENE_NAME.MAIN, SCENE_NAME.AVATARS].includes(threeApp.GetSceneName());

  const onSelectItem = (item) => {
    if (item.type === ITEM_TYPE.HORSE && isRoom()) return;
    setIsLoading(true);
    if (itemSelect.some((c) => c.id === item.id)) {
      const newItem = isRoom()
        ? itemSelect.filter((c) => c.id !== item.id && c.type !== ITEM_TYPE.HORSE)
        : itemSelect.filter((c) => c.id !== item.id);
      setItemSelect([...newItem]);
      onSelect(item, [...newItem]);
      setTimeout(() => {
        setIsLoading(false);
      }, 1000);
      return;
    }
    const newItem = isRoom()
      ? itemSelect.filter((c) => c.type !== item.type && c.type !== ITEM_TYPE.HORSE)
      : itemSelect.filter((c) => c.type !== item.type);
    setItemSelect([...newItem, item]);
    onSelect(item, [...newItem, item]);
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  useEffect(() => {
    const listFilter = listAllItem.filter((item) => item.type === tab.key);
    setListActive([...listFilter, ...(myNFT[tab.key] || [])]);
  }, [tab]);

  useEffect(() => {
    myNFT.isUpdate && getListItem();
  }, [myNFT]);

  useEffect(() => {
    socket.on('hook.buy-land-home', () => {
      setNFT();
    });
    debounceLoadData(isModal);
  }, [isModal]);

  const hasSelect = (item) => itemSelect.some((c) => c.id === item.id);

  const houseUsed = (item) => {
    return (
      threeApp?.mainScene?.NFTBuilding?.GetLandHasHouse().some(
        (v) => v.home.token_id === item.token_id,
      ) || false
    );
  };

  const landUsed = (item) => {
    return (
      threeApp?.mainScene?.NFTBuilding?.GetLandHasHouse().some(
        (v) => v.token_id === item.token_id,
      ) || false
    );
  };

  const moveToLand = (item) => {
    if (threeApp?.GetSceneName() === SCENE_NAME.MAIN) {
      const land = threeApp?.mainScene?.NFTBuilding?.GetLandHasHouse().find(
        (v) => v.home.token_id === item.token_id,
      );
      if (land) threeApp.mainScene.MoveAvatarToLand(land.token_id);
    }
  };

  const isSameGender = (item) => {
    return item.gender === '0' || `${item.gender}` === `${gender}`;
  };

  const styleSelected = (item) => {
    if (!hasSelect(item)) return 'inventory-item';
    return 'inventory-item active';
  };

  const onClickNFTItem = (item) => {
    if (tab.name === 'house') return;
    onGotoItem(item);
  };

  const onShowApplyModal = (item) => {
    setHouse(item);
    setIsChooseLand(true);
  };

  const onRequestClose = () => {
    setIsChooseLand(false);
    setHouse(null);
  };

  const isNoData =
    (!['house', 'lands'].includes(tab.key) && listActive.length === 0) ||
    (['house', 'lands'].includes(tab.key) && myNFT[tab.key].length === 0);

  const onShowNFTDetail = (item) => {
    window.open(
      `${MARKET_PLACE_URL}/detail?tokenId=${item.token_id}&tokenAddress=${
        item.token_address
      }&chainId=${getNetworkId()}`,
      '_blank',
    );
  };

  return (
    <>
      <div className="inventory">
        <div className="inventory-tabs">
          {tabs.map((item, index) => (
            <div
              key={index}
              className={tab.name === item.name ? 'active' : ''}
              onClick={() => onChangeTab(item)}
            >
              {item.name}
            </div>
          ))}
        </div>
        <div className="inventory-container">
          <div className={isNoData ? 'inventory-scrollbar no-scroll' : 'inventory-scrollbar'}>
            {!['house', 'lands'].includes(tab.key) &&
              listActive.map((item) => (
                <div
                  className={styleSelected(item)}
                  key={item.id}
                  style={{
                    opacity: isLoading ? '0.7' : '1',
                  }}
                >
                  <img
                    className={!isSameGender(item) ? 'gray-image' : ''}
                    src={item.thumbnail || item.metadata.thumbnail}
                    alt=""
                  />
                  <span className="check">
                    <IconCheck />
                  </span>
                  {isSameGender(item) && (
                    <div className="tab-hover">
                      {(item.token_id || item.token_id === 0) && (
                        <div className="detail-home-btn">
                          <FormButton onClick={() => onShowNFTDetail(item)}>Detail</FormButton>
                        </div>
                      )}
                      {(tab.key !== ITEM_TYPE.HORSE ||
                        (tab.key === ITEM_TYPE.HORSE &&
                          [SCENE_NAME.MAIN, SCENE_NAME.AVATARS].includes(
                            threeApp.GetSceneName(),
                          ))) && (
                        <div className="apply-home-btn">
                          <FormButton onClick={() => !isLoading && onSelectItem(item)}>
                            {hasSelect(item) ? 'Cancel' : 'Apply'}
                          </FormButton>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            {['house', 'lands'].includes(tab.key) &&
              (myNFT[tab.key] || []).map((item, index) => (
                <div className={styleSelected(item)} key={index}>
                  <img
                    className={
                      (tab.key === ITEM_TYPE.HOUSE && houseUsed(item)) ||
                      (tab.key === ITEM_TYPE.LANDS && landUsed(item))
                        ? 'gray-image'
                        : ''
                    }
                    src={item.metadata.image}
                    alt="item"
                  />
                  <span className="check">
                    <IconCheck />
                  </span>
                  {((tab.key === ITEM_TYPE.HOUSE && houseUsed(item)) ||
                    (tab.key === ITEM_TYPE.LANDS && landUsed(item))) && (
                    <div className="item-used">
                      <span>IN</span>
                      <span>USE</span>
                    </div>
                  )}
                  <div className="tab-hover">
                    <div className="detail-home-btn">
                      <FormButton onClick={() => onShowNFTDetail(item)}>Detail</FormButton>
                    </div>
                    <div className="apply-home-btn">
                      {tab.key === ITEM_TYPE.LANDS &&
                        [SCENE_NAME.MAIN, SCENE_NAME.AVATARS].includes(threeApp.GetSceneName()) && (
                          <FormButton onClick={() => onClickNFTItem(item)}>Move To</FormButton>
                        )}
                      {tab.key === ITEM_TYPE.HOUSE &&
                        [SCENE_NAME.MAIN, SCENE_NAME.AVATARS].includes(threeApp.GetSceneName()) && (
                          <FormButton
                            onClick={() =>
                              !houseUsed(item) ? onShowApplyModal(item) : moveToLand(item)
                            }
                          >
                            {!houseUsed(item) ? 'Apply' : 'Move To'}
                          </FormButton>
                        )}
                    </div>
                  </div>
                </div>
              ))}
            {Array.from(Array(18).keys()).map((item, index) => (
              <div className="inventory-item" key={index}></div>
            ))}
            {isNoData && <div className="no-data"> No Data</div>}
          </div>
        </div>
      </div>
      <ChooseLandModal
        isOpen={isChooseLand}
        onRequestClose={onRequestClose}
        lands={myNFT.lands}
        house={house}
        applyHome={applyHome}
      />
    </>
  );
};

export default Inventory;
