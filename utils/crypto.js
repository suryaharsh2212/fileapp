import CryptoJS from 'crypto-js';

export const encrypt = (text, passphrase) => {
  return CryptoJS.AES.encrypt(text, passphrase).toString();
};


export const decrypt = (cipherText, passphrase) => {
  const bytes = CryptoJS.AES.decrypt(cipherText, passphrase);
  return bytes.toString(CryptoJS.enc.Utf8);
};
