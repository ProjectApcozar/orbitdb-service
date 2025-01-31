import { publicEncrypt, privateDecrypt, generateKeyPairSync, createPrivateKey } from 'crypto';
import CryptoES from 'crypto-es';

export function generateKeys(userPassword){
    const { publicKey, privateKey } = generateKeyPairSync('rsa', {
        modulusLength: 4096,
        publicKeyEncoding: {
            type: 'spki',
            format: 'pem'
        },
        privateKeyEncoding: {
            type: 'pkcs8',
            format: 'pem',
            cipher: 'aes-256-cbc',
            passphrase: userPassword
        }
    });

    return { pubkey: publicKey, privkey: privateKey };
}

export function encryptAsym(data, publicKey){
    const encryptedBuffer = publicEncrypt(publicKey, Buffer.from(data));
    return encryptedBuffer.toString('base64');
}

export function decryptAsym(data, privateKey, userPassword){
    const buffer = Buffer.from(data, 'base64');
    const privateKeyObject = createPrivateKey({
        key: privateKey,
        format: "pem",
        passphrase: userPassword,
    });

    const decryptedBuffer = privateDecrypt({
        key: privateKeyObject,
    },
        buffer
    );

    return decryptedBuffer.toString('utf-8');
}

export function encryptSym(data, key) {
    const encryptedData = CryptoES.AES.encrypt(data, key).toString();
    return encryptedData;
}

export function decryptSym(encryptedData, key) {
    const decryptAsymBytes = CryptoES.AES.decrypt(encryptedData, key);
    const decryptedData = decryptAsymBytes.toString(CryptoES.enc.Utf8);
    return decryptedData;
}