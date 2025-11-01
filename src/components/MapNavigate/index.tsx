import React, { useEffect, useState } from 'react';
import MapImage from 'src/assets/images/map/map-navigate.png';
import MapPoint from 'src/assets/images/map/pin.png';
import { useAuth } from 'src/hooks/useAuth';
import { CONTROL_MODE } from 'src/constant/constant';

const MapNavigate = () => {
  const xDefault = -475.2974188513536;
  const zDefault = -372.8904994941732;
  const leftDefault = 15;
  const topDefault = 95;

  const { threeApp } = useAuth();

  const [sceneName, setSceneName] = useState('Main Scene');
  const [pos, setPos] = useState({
    x: threeApp.mainScene.currentUserAvatar.GetPosition().x || -264.8,
    z: threeApp.mainScene.currentUserAvatar.GetPosition().z || -238.6,
  });

  useEffect(() => {
    setInterval(() => {
      setSceneName(threeApp.GetSceneName());
      setPos({
        x: threeApp.mainScene.currentUserAvatar.GetPosition().x || -264.8,
        z: threeApp.mainScene.currentUserAvatar.GetPosition().z || -238.6,
      });
    }, 1000);
  }, []);

  const topStyle = () => {
    if (pos.z < zDefault) {
      return topDefault - Math.abs(zDefault - pos.z) / 8.47948749223 + 'px';
    }
    return Math.abs(zDefault - pos.z) / 8.47948749223 + topDefault + 'px';
  };

  const pointStyle: any = () => {
    return {
      position: 'absolute',
      left: Math.abs(xDefault - pos.x) / 8.36333793527 + leftDefault + 'px',
      top: topStyle(),
      width: '15px',
      marginTop: '-27px',
    };
  };

  const onShowMap = () => {
    if (sceneName === 'Main Scene') {
      threeApp.mainScene.ChangeControlMode(CONTROL_MODE.MAP);
    }
  };

  return (
    sceneName === 'Main Scene' && (
      <div id="mapNavigate">
        <img onClick={onShowMap} className="map" src={MapImage} alt="" />
        <span className="point" style={pointStyle()}>
          <img className="point-image" src={MapPoint} alt="" />
        </span>
      </div>
    )
  );
};

export default MapNavigate;
