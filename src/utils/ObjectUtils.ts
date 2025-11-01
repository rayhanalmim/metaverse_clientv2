import * as THREE from 'three';
export function ResetTransform(object: THREE.Object3D) {
  object.position.set(0, 0, 0);
  object.rotation.set(0, 0, 0);
  object.scale.set(100, 100, 100);
}
export function SetupObject(object: any, castShadow = true, receiveShadow = true, envMap = null) {
  object.traverse((child) => {
    if (child.type == 'Mesh' || child.type == 'SkinnedMesh') {
      child.castShadow = castShadow;
      child.receiveShadow = receiveShadow;
      child.material.envMap = envMap;
    }
  });
}
export function setCookie(cname, cvalue, exdays) {
  const d = new Date();
  d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
  const expires = 'expires=' + d.toUTCString();
  document.cookie = cname + '=' + cvalue + ';' + expires + ';path=/';
}
export function getCookie(cname) {
const name = cname + '=';
  const decodedCookie = decodeURIComponent(document.cookie);
  const ca = decodedCookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return '';
}

export function CreateTextSprite(message: string, parameters: any) {
  if (parameters === undefined) parameters = {};
  const fontface = Object.prototype.hasOwnProperty.call(parameters, 'fontface')
    ? parameters['fontface']
    : 'Courier New';
  const fontsize = Object.prototype.hasOwnProperty.call(parameters, 'fontsize')
    ? parameters['fontsize']
    : 18;
  const borderThickness = Object.prototype.hasOwnProperty.call(parameters, 'borderThickness')
    ? parameters['borderThickness']
    : 4;
  const borderColor = Object.prototype.hasOwnProperty.call(parameters, 'borderColor')
    ? parameters['borderColor']
    : { r: 0, g: 0, b: 0, a: 1.0 };
  const backgroundColor = Object.prototype.hasOwnProperty.call(parameters, 'backgroundColor')
    ? parameters['backgroundColor']
    : { r: 0, g: 0, b: 255, a: 1.0 };
  const textColor = Object.prototype.hasOwnProperty.call(parameters, 'textColor')
    ? parameters['textColor']
    : { r: 0, g: 0, b: 0, a: 1.0 };

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  context.font = 'Bold ' + fontsize + 'px ' + fontface;

  context.fillStyle =
    'rgba(' +
    backgroundColor.r +
    ',' +
    backgroundColor.g +
    ',' +
    backgroundColor.b +
    ',' +
    backgroundColor.a +
    ')';
  context.strokeStyle =
    'rgba(' + borderColor.r + ',' + borderColor.g + ',' + borderColor.b + ',' + borderColor.a + ')';
  context.fillStyle = 'rgba(' + textColor.r + ', ' + textColor.g + ', ' + textColor.b + ', 1.0)';
  context.fillText(message, borderThickness, fontsize + borderThickness);

  const texture = new THREE.Texture(canvas);
  texture.needsUpdate = true;
  const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
  const sprite = new THREE.Sprite(spriteMaterial);
  sprite.scale.set(0.5 * fontsize, 0.25 * fontsize, 0.75 * fontsize);
  return sprite;
}
export function RandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min);
}
export {};
