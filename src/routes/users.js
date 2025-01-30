import { Router } from 'express';
import getMedicalDataIntegrityContract from '../utils/contract.js';
import { decryptSym, encryptAsym, generateKeys } from '../utils/crypto.js';

export default function usersRoutes(userDB) {
    const router = Router();
    const contract = getMedicalDataIntegrityContract();

    router.post('/', async (req, res) => {
        try {
            const { key, name, date_of_birth, phone_number, user_password, cipher_key } = req.body;
            // COMENTADO PARA PRUEBAS, EL FE DEBE MANDAR LA USER PASSWORD CIFRADA
            const decryptedUserPassword = decryptSym(user_password, cipher_key);
            const { pubkey, privkey } = generateKeys(decryptedUserPassword);
            const securedCipherKey = encryptAsym(cipher_key, pubkey);
            const value = { name, date_of_birth, phone_number, pubkey, privkey, securedCipherKey };
    
            const CID = await userDB.put(key, value);
            const tx = await contract.updateDataHash(CID, key, key);
            await contract.addPatient(key);
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
                date_of_birth: item.date_of_birth,
                phone_number: item.phone_number,
                dni: item.dni || '',
                hospital: item.hospital || '',
                residence: item.residence || '',
                email: item.email || '',
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