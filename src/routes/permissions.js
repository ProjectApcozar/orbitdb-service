import { Router } from 'express';
import { generatePermissionsId } from '../utils/utils.js';
import { encryptAsym, decryptAsym } from '../utils/crypto.js';

export default function permissionsRoutes(permissionsDB, usersDB) {
    const router = Router();

    router.post('/', async (req, res) => {
        try {
            const { patientId, doctorId, patientPassword } = req.body;
            
            if (!patientId || !doctorId || !patientPassword) {
                return res.status(400).send({
                    message: 'Patient and doctor are required'
                });
            }

            // TO DO: Decouple this logic into a business logic layer
            // First we get the id to check if the relation already exists
            const permissionId = generatePermissionsId(patientId, doctorId);
            const exists = await permissionsDB.get(permissionId);

            if (exists) {
                return res.status(400).send({
                    message: 'Relation already exists'
                });
            }

            // Then, If the relation does not exist, we proceed to add it
            const patient = await usersDB.get(patientId);
            const patientEncryptedCipherKey = patient.encryptedCipherKey;
            const patientPrivKey = patientData.privkey;

            const doctor = await usersDB.get(doctorId);
            const doctorPubKey = doctorData.pubkey;

            const decryptedCipherKey = decryptAsym(patientEncryptedCipherKey, patientPrivKey, patientPassword);
            const doctorEncryptedCipherKey = encryptAsym(decryptedCipherKey, doctorPubKey);

            const result = await permissionsDB.put({
                _id: id,
                patient,
                doctor,
                date: new Date().toISOString(),
                doctorEncryptedCipherKey,
            });

            const tx = await contract.grantAccess(patientId, doctorId);

            if (result && tx) {
                return res.status(201).send({ message: 'Relation added' });
            }

        } catch (error) {
            res.status(500).send({ message: error.message });
        };
    });

    router.get('/', async (req, res) => {
        try {
            const items = await permissionsDB.all();
            res.status(200).send(items);
        } catch (error) {
            res.status(500).send({ message: error.message });
        }
    });

    router.get('/patient/:patient', async (req, res) =>{
        try {
            const patientId = req.params.patient;
            const patientPermissions = permissionsDB.query((doc) => doc.patient === patientId);
            res.status(200).send(patientPermissions);
        } catch (error) {
            res.status(500).send({ message: error.message });
        }
    });

    router.get('/doctor/:doctor', async(req, res) => {
        try {
            const doctorId = req.params.doctor;
            const doctorPermissions = permissionsDB.query((doc) => doc.doctor === doctorId);
            res.status(200).send(doctorPermissions);
        } catch (error) {
            res.status(500).send({ message: error.message });
        }
    });

    router.delete('/', async(req, res) => {
        try {
            const { patientId, doctorId } = req.body;
            if (!patientId || !doctorId) {
                return res.status(400).send({
                    message: 'Patient and Doctor are necessary'
                });
            }
    
            const permissionId = generatePermissionsId(patientId, doctorId);
            await permissionsDB.del(permissionId);
    
            res.status(200).send(({ message: 'Relation removed' }));
        } catch (error) {
            res.status(500).send({ message: error.message });
        };
    });

    return router;
}