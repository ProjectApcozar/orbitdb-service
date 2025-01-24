import { Router } from 'express';
import getMedicalDataIntegrityContract from '../utils/contract.js';
import { encrypt, generateKeys } from '../utils/crypto.js';

export default function usersRoutes(dataDB) {
    const router = Router();
    const contract = getMedicalDataIntegrityContract();

    router.post('/', async (req, res) => {
        try {
            const { key, name, date_of_birth, phone_number, passphrase, password } = req.body;
            
            const { pubkey, privkey } = generateKeys(passphrase);
            const securedPassword = encrypt(password, pubkey);
            const value = { name, date_of_birth, phone_number, pubkey, privkey, securedPassword };
    
            const CID = await dataDB.put(key, value);
            const tx = await contract.updateDataHash(CID, key, key);

            res.status(201).send({ message: 'Item added' , CID});
            console.log(`Nuevo registro añadido: { key: "${key}", value: "${value}", hash: "${tx}" }`);
        } catch (error) {
            res.status(500).send({ error: error.message })
        }
    });

    router.get('/', async (req, res) => {
        try {
            const items = await dataDB.all();
            res.status(200).send(items);
        } catch (error) {
            res.status(500).send({ error: error.message });
        }
    });

    router.get("/:key", async (req, res) => {
        try {
            const key = req.params.key;
            const item = await dataDB.get(key);
    
            if (!item) {
                return res.status(404).send({ message: 'Item not found' });
            }
    
            res.status(200).send(item);
        } catch (error) {
            res.status(500).send({ error: error.message });
        }
    });

    router.patch('/:key', async (req, res) => {
        try {
            const key = req.params.key;
            const updates = req.body;
            const existingValue = await dataDB.get(key);
    
            if (!existingValue) {
                return res.status(404).send({ message: 'Item not found'});
            }
    
            const updatedValue = { ...existingValue, ...updates };
            const hash = await dataDB.put(key, updatedValue);
            const base32Hash = getBase32Hash(hash);
            const tx = await contract.updateDataHash(base32Hash, key, key);

            res.status(200).send({ message: 'Item updated', hash, tx });
            console.log(`Registro actualizado: { key: "${key}", value: "${JSON.stringify(updatedValue)}", hash: "${hash}" }`);
        } catch (error) {
            res.status(500).send({ error: error.message });
        }
    });

    return router;
}