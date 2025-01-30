import { Router } from 'express';
import getMedicalDataIntegrityContract from '../utils/contract.js';
import { decryptSym, encryptAsym, generateKeys } from '../utils/crypto.js';

export default function usersRoutes(userDB) {
    const router = Router();
    const contract = getMedicalDataIntegrityContract();

    router.post('/', async (req, res) => {
        try {
            const { key, name, dateOfBirth, phoneNumer, encryptedUserPassword, cipherKey } = req.body;

            // COMENTAR PARA PRUEBAS
            const decryptedUserPassword = decryptSym(encryptedUserPassword, cipherKey);
            const { pubkey, privkey } = generateKeys(decryptedUserPassword);

            const encryptedCipherKey = encryptAsym(cipherKey, pubkey);
            const value = { name, dateOfBirth, phoneNumer, pubkey, privkey, encryptedCipherKey };
    
            const CID = await userDB.put(key, value);
            const tx = await contract.updateDataHash(CID, key, key);
            const tx_2 = await contract.addPatient(key);

            res.status(201).send({ message: 'Item added' , CID});
            console.log(`Nuevo registro añadido: { key: "${key}", value: "${value}", hash: "${tx}" }`);
        } catch (error) {
            res.status(500).send({ error: error.message })
        }
    });

    router.get('/', async (req, res) => {
        try {
            const items = await userDB.all();
            res.status(200).send(items);
        } catch (error) {
            res.status(500).send({ error: error.message });
        }
    });

    router.get('/is-patient/:key', async (req, res) => {

        try {
            const key = req.params.key;
            const filter = contract.filters.PatientAdded(key);
            const logs = await contract.queryFilter(filter);
            const user = await userDB.get(key);

            const isPatient = !!(logs && logs.length > 0 && user);

            res.status(200).send({ isPatient });
        } catch (error) {
            res.status(500).send({ error: error.message });
        }
    });

    router.get('/is-doctor/:key', async (req, res) => {
        try {
            const key = req.params.key;
            const filter = contract.filters.DoctorAdded(key);
            const logs = await contract.queryFilter(filter);
            const user = await userDB.get(key);

            const isDoctor = !!(logs && logs.length > 0 && user);

            res.status(200).send({ isDoctor });
        } catch (error) {
            res.status(500).send({ error: error.message });
        }
    });

    router.get("/:key", async (req, res) => {
        try {
            const key = req.params.key;
            const item = await userDB.get(key);
    
            if (!item) {
                return res.status(404).send({ message: 'Item not found' });
            }

            const userDTO = {
                name: item.name,
                dateOfBirth: item.dateOfBirth,
                phoneNumer: item.phoneNumer,
                dni: item.dni,
                hospital: item.hospital,
                residence: item.residence,
                email: item.email,
            };
    
            res.status(200).send(userDTO);
        } catch (error) {
            res.status(500).send({ error: error.message });
        }
    });

    router.patch('/:key', async (req, res) => {
        try {
            const key = req.params.key;
            const updates = req.body;
            const existingValue = await userDB.get(key);

            if (!existingValue) {
                return res.status(404).send({ message: 'Item not found'});
            }
    
            const updatedValue = { ...existingValue, ...updates };
            
            const CID = await userDB.put(key, updatedValue);
            const tx = await contract.updateDataHash(CID, key, key);

            res.status(200).send({ message: 'Item updated', CID, tx });
            console.log(`Registro actualizado: { key: "${key}", hash: "${CID}" }`);
        } catch (error) {
            res.status(500).send({ error: error.message });
        }
    });

    return router;
}