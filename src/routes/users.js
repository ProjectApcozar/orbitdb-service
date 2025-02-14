import { Router } from 'express';
import getMedicalDataIntegrityContract from '../utils/contract.js';
import { decryptSym, encryptAsym, generateKeys } from '../utils/crypto.js';
import { selectFields } from '../utils/utils.js';
import { patientDTO } from '../utils/dtos.js';

export default function usersRoutes(userDB) {
    const router = Router();
    const contract = getMedicalDataIntegrityContract();

    router.post('/', async (req, res) => {
        try {
            const { key, name, dateOfBirth, phoneNumber, encryptedUserPassword, cipherKey } = req.body;

            const decryptedUserPassword = decryptSym(encryptedUserPassword, cipherKey);
            const { pubkey, privkey } = generateKeys(decryptedUserPassword);
            const encryptedCipherKey = encryptAsym(cipherKey, pubkey);
            const value = { name, dateOfBirth, phoneNumber, pubkey, privkey, encryptedCipherKey };
            const CID = await userDB.put(key, value);
            await contract.updateDataHash(CID, key, key);
            await contract.addPatient(key);
            res.status(201).send({ message: 'Item added' , CID});
            console.log(`Nuevo registro añadido: { key: "${key}", value: "${value}",, }`);
        } catch (error) {
            res.status(500).send({ error: error.message })
        }
    });

    router.post('/register-doctor', async (req, res) => {
        try {
            const { key, name, phoneNumber, hospital, type, password } = req.body;
            const { pubkey, privkey } = generateKeys(password);
            const value = { name, phoneNumber, hospital, type, pubkey, privkey };
            const CID = await userDB.put(key, value);
            const tx = await contract.updateDataHash(CID, key, key);
            const tx2 = await contract.addDoctor(key);
            res.status(201).send({ message: 'Item added', CID});
            console.log(`Nuevo registro añadido: { key: "${key}", value: "${value}", hash: "${tx}" }`);
        } catch (error) {
            res.status(500).send({ error: error.message });
        }
    });

    router.post('/add-doctor', async (req, res) => {
        try {
            const { key } = req.body;
            const tx = await contract.addDoctor(key);
            res.status(201).send({ message: 'Item added', tx});
            console.log(`Nuevo registro añadido: { key: "${key}", hash: "${tx}" }`);
        } catch (error) {
            res.status(500).send({ error: error.message });
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

            const isPatient = !!((logs && logs.length > 0) && Boolean(user));

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

            const isDoctor = !!(logs && logs.length > 0 && Boolean(user));

            res.status(200).send({ isDoctor });
        } catch (error) {
            res.status(500).send({ error: error.message });
        }
    });

    router.get('/is-doctor-enabled/:key', async (req, res) => {
        try {
            const key = req.params.key;
            const filter = contract.filters.DoctorAdded(key);
            const logs = await contract.queryFilter(filter);

            const isDoctorEnabled = !!(logs && logs.length > 0);

            res.status(200).send({ isDoctorEnabled });
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

            const patient = selectFields(item, patientDTO);
            res.status(200).send(patient);
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