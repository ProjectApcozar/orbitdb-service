import { publicEncrypt, generateKeyPairSync } from 'crypto';

export function generateKeys(passphrase){
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
            passphrase
        }
    });

    return { pubkey: publicKey, privkey: privateKey };
}

export function encrypt(data, publicKey){
    const encryptedBuffer = publicEncrypt(publicKey, Buffer.from(data));
    return encryptedBuffer.toString('base64');
}

export function decrypt(data, privateKey, passphrase){
    const buffer = Buffer.from(data, 'base64');
    const decryptedBuffer = privateDecrypt({
        key: privateKey,
        passphrase,
    },
        buffer
    );

    return decryptedBuffer.toString('utf-8');
    
}