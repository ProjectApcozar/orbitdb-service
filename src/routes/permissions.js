import { Router } from 'express';
import { generatePermissionsId, selectFields } from '../utils/utils.js';
import { encryptAsym, decryptAsym, decryptData } from '../utils/crypto.js';
import getMedicalDataIntegrityContract from '../utils/contract.js';
import { doctorDTO, patientPermissionDTO, patientDTO } from '../utils/dtos.js';

export default function permissionsRoutes(permissionsDB, usersDB) {
    const router = Router();
    const contract = getMedicalDataIntegrityContract();

    router.post('/', async (req, res) => {
        try {
            const { patientId, doctorId, patientPassword } = req.body;
            
            if (!patientId || !doctorId || !patientPassword) {
                return res.status(400).send({
                    message: 'Patient and doctor are required'
                });
            }

            const permissionId = generatePermissionsId(patientId, doctorId);
            const exists = await permissionsDB.get(permissionId);

            if (exists) {
                return res.status(400).send({
                    message: 'Relation already exists'
                });
            }

            const patient = await usersDB.get(patientId);
            const patientEncryptedCipherKey = patient.encryptedCipherKey;
            const patientPrivKey = patient.privkey;

            const doctor = await usersDB.get(doctorId);
            const doctorPubKey = doctor.pubkey;

            const decryptedCipherKey = decryptAsym(patientEncryptedCipherKey, patientPrivKey, patientPassword);
            const doctorEncryptedCipherKey = encryptAsym(decryptedCipherKey, doctorPubKey);

            const result = await permissionsDB.put({
                _id: permissionId,
                patientId,
                doctorId,
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

    router.post('/request-access', async (req, res) => {
        try {
            const { patientId, doctorId } = req.body;
            
            if (!patientId || !doctorId) {
                return res.status(400).send({
                    message: 'Patient and doctor are required'
                });
            }

            const tx = await contract.requestAccess(patientId, doctorId);
            console.log(`Nuevo registro añadido: { key: "${patientId}", hash: "${tx}" }`);
            res.status(201).send({ message: 'Item added', tx});
        } catch (error) {
            res.status(500).send({ message: error.message })
        }
    });

    router.get('/access-requests/:patientId', async (req, res) => {
        try {
            const patientId = req.params.patientId;
            const filterRequested  = contract.filters.AccessRequested(patientId);
            const filterGranted  = contract.filters.AccesGranted(patientId);

            const [logsRequested, logsGranted] = await Promise.all([
                contract.queryFilter(filterRequested),
                contract.queryFilter(filterGranted)
            ]);

            const grantedDoctors = new Set(logsGranted.map(log => log.args.doctor.toLowerCase()));
            const pendingRequests = logsRequested.filter(log => !grantedDoctors.has(log.args.doctor.toLowerCase()));

            const response = pendingRequests.map(log => ({
                patient: log.args.patient,
                doctor: log.args.doctor,
                timestamp: log.args.timestamp.toNumber()
            }));

            res.status(200).json(response);
        } catch (error) {
            console.error('Error al obtener las solicitudes de acceso:', error);
            res.status(500).json({ error: 'Error al obtener las solicitudes de acceso' });
        }
    });

    router.get('/', async (req, res) => {
        try {
            const items = await permissionsDB.all();
            res.status(200).send(items);
        } catch (error) {
            res.status(500).send({ message: error.message });
        }
    });

    router.get('/patient/:patientId', async (req, res) =>{
        try {
            const patientId = req.params.patientId;
            const patientPermissions = await Promise.all((await permissionsDB.query((doc) => {
                return doc.patientId === patientId;
            })).map(async (doc) => {
                const doctor = await usersDB.get(doc.doctorId);
                doctor.id = doc.doctorId;
                doctor.permissionDate = doc.date;
                return selectFields(doctor, doctorDTO)
            }));

            res.status(200).send(patientPermissions);
        } catch (error) {
            res.status(500).send({ message: error.message });
        }
    });

    router.post('/doctor/:doctorId', async(req, res) => {
        try {
            const doctorId = req.params.doctorId;
            const { doctorPassword } = req.body;

            const doctor = await usersDB.get(doctorId);

            const doctorPermissions = await Promise.all((await permissionsDB.query((doc) => {
                return doc.doctorId == doctorId
            })).map(async (doc) => {
                const patient = await usersDB.get(doc.patientId);
                const doctorEncryptedCipherKey = doc.doctorEncryptedCipherKey;
                const doctorDecryptedCipherKey = decryptAsym(doctorEncryptedCipherKey, doctor.privkey, doctorPassword);
                const decryptedPatient = decryptData(selectFields(patient, patientDTO), doctorDecryptedCipherKey);
                return selectFields(decryptedPatient, patientPermissionDTO);
            }));

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