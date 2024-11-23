const crypto = require('crypto');

const key = process.env.ENCRYPTION_KEY;
const iv = Buffer.alloc(16);

const encrypt256 = (data) => {
  let encryptionKey = key;
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(encryptionKey), iv);
  let encrypted;
  if (typeof data === 'object') {
    encrypted = cipher.update(JSON.stringify(data));
  } else {
    encrypted = cipher.update(data);
  }
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return { iv: iv.toString('base64'), encryptedData: encrypted.toString('base64') };
};

const decrypt256 = (data) => {
  let decryptionKey = key;
  const encryptedText = Buffer.from(data.encryptedData, 'base64');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(decryptionKey), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
};

const generateEncryptedPayload = (data) => {
  return encrypt256(data);
};

module.exports = {
  encrypt256,
  decrypt256,
  generateEncryptedPayload
};