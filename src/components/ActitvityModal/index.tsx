import Modal from 'react-modal';
import './style.css';
import auth from 'src/api/auth';
import React, { useEffect, useState } from 'react';
import { IActivityItem, IActivityType } from 'src/interfaces/auth';
import { shortenString } from 'src/constant/constant';
import { useMetaMask } from 'src/hooks/useMetamaskProvider';
import { TX_HASH_URL } from 'src/config';
import IconList from '../Icons/List';
import IconIn from '../Icons/In';
import IconOut from '../Icons/Out';
import Table from 'rc-table';

interface IProps {
  isOpen: boolean;
  onRequestClose: () => void;
}

const ActivityModal: React.FC<IProps> = ({ isOpen, onRequestClose }) => {
  const [activities, setActivities] = useState<IActivityItem[]>([]);
  const { formatPrice } = useMetaMask();

  const getUserActivity = async () => {
    const { data } = await auth.getListActivity(1, 50);
    setActivities([
      ...data.data.curr.map((item, index) => {
        return { ...item, key: index };
      }),
    ]);
  };

  useEffect(() => {
    isOpen && getUserActivity();
  }, [isOpen]);

  const getIconByType = (type: IActivityType) => {
    if (type === IActivityType.LIST) return <IconList />;
    if (type === IActivityType.IN) return <IconIn />;
    if (type === IActivityType.OUT) return <IconOut />;
    return '';
  };

  const gotoTxHash = (hash: string) => {
    window.open(TX_HASH_URL + hash, '_blank');
  };

  const columns = [
    {
      title: 'Type',
      dataIndex: 'activityType',
      key: 'activityType',
      width: '14%',
      render: (val) => (
        <div className="activity-type">
          {getIconByType(val)} {val}
        </div>
      ),
    },
    {
      title: 'From',
      dataIndex: 'from',
      key: 'from',
      width: '14%',
      render: (val) => <div>{shortenString(val)}</div>,
    },
    {
      title: 'To',
      dataIndex: 'to',
      key: 'to',
      width: '14%',
      render: (val) => <div>{shortenString(val)}</div>,
    },
    {
      title: 'Token',
      dataIndex: 'token',
      key: 'token',
      width: '14%',
      render: (val) => <div>{shortenString(val)}</div>,
    },
    {
      title: 'Token ID',
      dataIndex: 'tokenId',
      key: 'tokenId',
      width: '10%',
      render: (val) => <div>{shortenString(val === '-1' ? '-' : val)}</div>,
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      width: '20%',
      render: (val, row) => (
        <div className="activity-amount">{row.token !== 'OVE' ? val : formatPrice(val)}</div>
      ),
    },
    {
      title: 'TxHash',
      dataIndex: 'hash',
      key: 'hash',
      render: (val) => (
        <div className="activity-hash" onClick={() => gotoTxHash(val)}>
          {shortenString(val)}
        </div>
      ),
    },
  ];

  return (
    <Modal isOpen={isOpen} className="activity-modal" onRequestClose={onRequestClose}>
      <div className="title">ACTIVITY</div>
      <div className={activities.length === 0 ? 'activity-content no-scroll' : 'activity-content'}>
        <Table
          style={{ width: '100%', minWidth: '1000px' }}
          scroll={{ x: '100%', y: 520 }}
          columns={columns}
          data={activities}
          rowKey={(record) => record.key}
        />
        {activities.length === 0 && <div className="no-data">No Data</div>}
      </div>
    </Modal>
  );
};
export default ActivityModal;
