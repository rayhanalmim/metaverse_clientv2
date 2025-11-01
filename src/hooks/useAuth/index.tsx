import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import Cookies from 'universal-cookie';
import authRepo from 'src/api/auth';
import loginRepo from 'src/api/login';
import { useNavigate } from 'react-router-dom';
import { IUserData } from '../../interfaces/auth';
import App3D from 'src/map3d/App3D';
import { toast } from 'react-toastify';
import myNft from 'src/api/myNft';
import { ITEM_TYPE, LAND_TYPE } from 'src/constant/constant';
import { IHomeLandData, IItemNFTData, IMasterItem } from 'src/interfaces/general';

interface ILogin {
  userName: string;
  password: string;
}

interface MyNFT {
  lands: IHomeLandData[];
  house: IHomeLandData[];
  body: IItemNFTData[] | IMasterItem[];
  hat: IItemNFTData[] | IMasterItem[];
  shoe: IItemNFTData[] | IMasterItem[];
  mask: IItemNFTData[] | IMasterItem[];
  glove: IItemNFTData[] | IMasterItem[];
  horse: IItemNFTData[] | IMasterItem[];
  bow: IItemNFTData[] | IMasterItem[];
  isUpdate?: boolean;
}

interface IAuthContext {
  isLogin: boolean;
  user: Partial<IUserData>;
  login: (data: ILogin) => Promise<void>;
  registerUser: (data: ILogin) => Promise<void>;
  getUser: () => Promise<void>;
  threeApp: any;
  setUserData: (avatarId: number, listItemId: number[]) => Promise<void>;
  myNFT: MyNFT;
  setNFT: () => Promise<void>;
  logout: () => void;
  resetNFT: () => void;
  generalItems: IMasterItem[];
  setItemsDefault: (item: IMasterItem[]) => void;
  setThreeApp: any;
}

const cookies = new Cookies();

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const AuthContext = createContext<IAuthContext>();
const expirationDate = new Date();
expirationDate.setDate(expirationDate.getDate() + 1);
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const [isLogin, setIslogin] = useState(!!cookies.get('token'));
  const [user, setUser] = useState<Partial<IUserData>>();
  const [myNFT, setMyNFT] = useState<MyNFT>({
    lands: [],
    house: [],
    body: [],
    hat: [],
    shoe: [],
    mask: [],
    glove: [],
    horse: [],
    bow: [],
    isUpdate: false,
  });
  const [threeApp, setThreeApp] = useState(null);
  const [generalItems, setGeneralItems] = useState([]);

  const login = async ({ userName, password }) => {
    try {
      toast.dismiss();
      const { data } = await loginRepo.login(userName, password);
      setIslogin(() => true);
       // Try different cookie settings for better compatibility
      const cookieOptions = {
        path: '/',
        expires: expirationDate,
        secure: false, // Allow non-HTTPS in development
        sameSite: 'lax' as const// More permissive for development
      };
      
      cookies.set('token', data.data.accessToken, cookieOptions);
      
      // Verify token was stored
      const storedToken = cookies.get('token');
      console.log('💾 Token Storage Verification:', {
        tokenStored: !!storedToken,
        tokensMatch: storedToken === data.data.accessToken,
        storedTokenPreview: storedToken ? `${storedToken.substring(0, 10)}...` : 'NO TOKEN',
        cookieOptions
      });
      
      // If still not stored, try alternative storage
      if (!storedToken) {
        console.log('⚠️ Cookie storage failed, trying localStorage fallback');
        localStorage.setItem('token', data.data.accessToken);
      }
    } catch (e) {
      toast(e.response.data.message, { type: 'error' });
      await Promise.resolve();
    }
  };

  const logout = async () => {
    await loginRepo.logout();
    cookies.remove('token', { path: '/' });
    localStorage.removeItem('token');
    window.open('/auth/login', '_self');
  };

  const registerUser = async ({ userName, password, email }) => {
    try {
      toast.dismiss();
      await authRepo.register(userName, password, email);
      toast('Your account has been created');
      navigate('/auth/login');
    } catch (e) {
      toast(
        Array.isArray(e.response.data.message)
          ? e.response.data.message[0]
          : e.response.data.message,
        { type: 'error' },
      );
      await Promise.resolve();
    }
  };

  const getUser = async () => {
    try {
      const { data } = await authRepo.user();
      const items = data.data.items.filter(
        (item) => item.gender === data.data.avatar.gender || item.gender === '0',
      );
      const { ethereum } = window;
      if (!ethereum) {
        setUser({
          ...data.data,
          items: items.filter(
            (item) => !item.set_number && item.link !== 'models/items/Set2_Horse.glb',
          ),
        });
        if (!threeApp) setThreeApp(App3D.Ins);
        return;
      }
      const [account] = await ethereum.request({ method: 'eth_accounts' });
      if (
        !account ||
        (account || '').toLowerCase() !== (data.data.wallet_address || '').toLowerCase()
      ) {
        setUser({
          ...data.data,
          items: items.filter(
            (item) => !item.set_number && item.link !== 'models/items/Set2_Horse.glb',
          ),
        });
        if (!threeApp) setThreeApp(App3D.Ins);
        return;
      }
      setUser({ ...data.data, items });
      if (!threeApp) setThreeApp(App3D.Ins);
    } catch (e) {
      console.log(e);
      await Promise.resolve();
    }
  };

  const setUserData = async (avtId, listUserId) => {
    try {
      await authRepo.setUser(avtId, listUserId);
      await getUser();
    } catch (e) {
      toast(e.response.data.message, { type: 'error' });
      await Promise.resolve();
    }
  };

  const getNFTList = async () => {
    const { ethereum } = window;
    if (!ethereum) {
      setDefaultNft();
      return;
    }
    const [account] = await ethereum.request({ method: 'eth_accounts' });
    if (!account || (account || '').toLowerCase() !== (user.wallet_address || '').toLowerCase()) {
      setDefaultNft();
      return;
    }
    try {
      const { data } = await myNft.list('');
      const res = await myNft.list('?type=item');
      const lands = data.data.filter(
        (item) =>
          item.metadata.attributes.some(
            (c) => c.trait_type === 'Type' && Object.values(LAND_TYPE).includes(c.value),
          ) && item.metadata.objectId.toLowerCase().includes('lands'),
      );
      const house = data.data.filter(
        (item) =>
          item.metadata.attributes.find(
            (c) => c.trait_type === 'Type' && Object.values(LAND_TYPE).includes(c.value),
          ) && item.metadata.objectId.toLowerCase().includes('home'),
      );

      const body = formatMasterItem(res.data.data, ITEM_TYPE.BODY, ' Body');

      const hat = formatMasterItem(res.data.data, ITEM_TYPE.HAT, ' Hat');

      const shoe = formatMasterItem(res.data.data, ITEM_TYPE.SHOE, ' Shoes');

      const mask = formatMasterItem(res.data.data, ITEM_TYPE.MASK, ' Mask');

      const glove = formatMasterItem(res.data.data, ITEM_TYPE.GLOVE, ' Glove');

      const horse = formatMasterItem(res.data.data, ITEM_TYPE.HORSE, ' Horse');

      const bow = formatMasterItem(res.data.data, ITEM_TYPE.BOW, ' Bow');

      setMyNFT({ lands, house, body, hat, shoe, mask, glove, horse, bow, isUpdate: true });
    } catch (e) {
      console.log(e);
    }
  };

  const formatMasterItem = (data, type, name) => {
    return data
      .filter(
        (item) =>
          item.metadata.attributes.find((c) => c.trait_type === 'Type').value === type &&
          item.listings.length === 0,
      )
      .map((c) => {
        return {
          id: c.id,
          name: c.metadata.name,
          link: c.metadata.link,
          thumbnail: c.metadata.thumbnail,
          gender: `${c.metadata.attributes.find((x) => x.trait_type === 'Sex').value}`,
          type: c.metadata.attributes.find((x) => x.trait_type === 'Type').value,
          // eslint-disable-next-line camelcase
          parts_hided: c.metadata.attributes.find((x) => x.trait_type === 'PartsHided').value,
          // eslint-disable-next-line camelcase
          token_address: c.token_address,
          // eslint-disable-next-line camelcase
          token_id: c.token_id,
        };
      });
  };

  const setDefaultNft = () => {
    setMyNFT({
      lands: [],
      house: [],
      body: [],
      hat: [],
      shoe: [],
      mask: [],
      glove: [],
      horse: [],
      bow: [],
      isUpdate: true,
    });
  };

  const setNFT = async () => {
    await getNFTList();
  };

  useEffect(() => {
    if (!isLogin) return;
  }, [isLogin]);
  useEffect(() => {
    if (user && user.wallet_address) {
      getNFTList();
    }
    if (user && !user.wallet_address) {
      setMyNFT({ ...myNFT, isUpdate: true });
    }
  }, [user]);

  const resetNFT = () => {
    setMyNFT({
      lands: [],
      house: [],
      body: [],
      hat: [],
      shoe: [],
      mask: [],
      glove: [],
      horse: [],
      bow: [],
      isUpdate: true,
    });
  };

  const setItemsDefault = (item) => {
    setGeneralItems(item);
  };

  const value = useMemo(
    () => ({
      threeApp,
      isLogin,
      user,
      login,
      registerUser,
      getUser,
      setUserData,
      myNFT,
      setNFT,
      logout,
      resetNFT,
      generalItems,
      setItemsDefault,
      setThreeApp,
    }),
    [isLogin, user, threeApp, myNFT, generalItems],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};

export const getToken = () => {
  let token = cookies.get('token');
  
  // Fallback to localStorage if cookie is not available
  if (!token) {
    token = localStorage.getItem('token');
    console.log('🎫 getToken called (localStorage fallback):', {
      hasToken: !!token,
      tokenPreview: token ? `${token.substring(0, 10)}...` : 'NO TOKEN'
    });
  } else {
    console.log('🎫 getToken called (cookies):', {
      hasToken: !!token,
      tokenPreview: token ? `${token.substring(0, 10)}...` : 'NO TOKEN'
    });
  }
  
  return token;
};
export const setNetworkId = (id) => cookies.set('chain_id', id);
export const getNetworkId = () =>  '97';
