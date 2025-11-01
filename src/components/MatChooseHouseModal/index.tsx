import React, { useEffect, useMemo, useState } from 'react';
import Modal from 'react-modal';
import './style.css';
import { CheckBox } from '../Form/CheckBox';
import IconSort from '../Icons/Sort';
import FormButton from '../Form/Button';
import myNft from '../../api/myNft';
import { ITEM_TYPE, LAND_TYPE } from '../../constant/constant';

type IBuildingModal = {
  isOpen: boolean;
  onRequestClose: () => void;
  onSelect: (house) => void;
  listSelect: any[];
  id: string;
};

const MatHouseModal: React.FC<IBuildingModal> = ({
  isOpen,
  onRequestClose,
  onSelect,
  id,
  listSelect,
}) => {
  const [houses, setHouses] = useState([]);
  const [isShowSort, setIsShowSort] = useState(false);
  const [filterType, setFilterType] = useState('ALL');

  const listFilter = [
    { label: 'ALL', value: 'ALL' },
    { label: 'BODY', value: ITEM_TYPE.BODY },
    { label: 'FACE', value: ITEM_TYPE.MASK },
    { label: 'HEAD', value: ITEM_TYPE.HAT },
    { label: 'FEET', value: ITEM_TYPE.SHOE },
    { label: 'HAND', value: ITEM_TYPE.GLOVE },
    { label: 'LANDS', value: ITEM_TYPE.LANDS },
    { label: 'HOUSE', value: ITEM_TYPE.HOUSE },
    { label: 'HORSE', value: ITEM_TYPE.HORSE },
    { label: 'BOW', value: ITEM_TYPE.BOW },
  ];

  const getMatItem = async () => {
    const { data } = await myNft.matListSelling();
    setHouses(
      data.data
        .map((c) => {
          return {
            ...c,
            checked: listSelect.some((x) => x.id === c.id),
          };
        })
        .sort((a, b) => Number(b.checked) - Number(a.checked)),
    );
  };

  const listHouseFilter = useMemo(() => {
    if (filterType === 'ALL') return [...houses];
    if (filterType === ITEM_TYPE.LANDS)
      return houses.filter(
        (item) =>
          item.nft.metadata.attributes.some(
            (c) => c.trait_type === 'Type' && Object.values(LAND_TYPE).includes(c.value),
          ) && item.nft.metadata.objectId.toLowerCase().includes('lands'),
      );
    if (filterType === ITEM_TYPE.HOUSE)
      return houses.filter(
        (item) =>
          item.nft.metadata.attributes.find(
            (c) => c.trait_type === 'Type' && Object.values(LAND_TYPE).includes(c.value),
          ) && item.nft.metadata.objectId.toLowerCase().includes('home'),
      );

    return [
      ...houses.filter(
        (item) =>
          item.nft.metadata.attributes.find((c) => c.trait_type === 'Type').value === filterType,
      ),
    ];
  }, [houses, filterType]);

  useEffect(() => {
    if (isOpen) {
      getMatItem();
      setFilterType('ALL');
    }
    if (!isOpen) setIsShowSort(false);
  }, [isOpen]);

  const onSelectItem = (item) => {
    if (houses.filter((c) => c.checked).length >= 10 && !item.checked) return;
    setHouses([
      ...houses.map((c) => {
        if (c.id === item.id)
          return {
            ...c,
            checked: !c.checked,
          };
        return c;
      }),
    ]);
  };

  const onApply = async () => {
    const houseChecked = houses.filter((c) => c.checked);
    const listId = houseChecked.map((x) => x.id);
    await myNft.changeMatDetail(id, listId);
    onSelect(houseChecked);
    onRequestClose();
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        className="land-modal"
        onRequestClose={onRequestClose}
        overlayClassName="mat-modal-overlay"
      >
        <div className="mat-house-title">
          <span>CHOOSE YOUR NFTs FOR SALE</span>
          <div className="sort" onClick={() => setIsShowSort((st) => !st)}>
            <IconSort /> {filterType.toUpperCase()}
            {isShowSort && (
              <div className="sort-menu">
                <span
                  className={filterType === 'ALL' ? 'active' : ''}
                  onClick={() => setFilterType('ALL')}
                >
                  ALL
                </span>
                {Object.values(ITEM_TYPE).map((type) => (
                  <span
                    className={filterType === type ? 'active' : ''}
                    key={type}
                    onClick={() => setFilterType(type)}
                  >
                    {listFilter.find((c) => c.value === type).label}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="land-component">
          {listHouseFilter.map((item, index) => (
            <div className="inventory-item mat-house-item" key={index}>
              <img src={item.nft.thumbnail || item.nft.metadata.image} alt="" />
              <CheckBox checked={item.checked} rounded="md" onChange={() => onSelectItem(item)} />
            </div>
          ))}
          {houses.length === 0 && <div className="no-data"> No Data</div>}
        </div>
        <div className="mat-house-footer">
          <FormButton onClick={onApply}>OK</FormButton>
          <FormButton onClick={onRequestClose}>Cancel</FormButton>
        </div>
      </Modal>
    </>
  );
};

export default MatHouseModal;
