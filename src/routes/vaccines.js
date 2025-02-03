import { Router } from 'express';
import getMedicalDataIntegrityContract from '../utils/contract.js';

export default function vaccinesRoutes(vaccinesDB) {
    const router = Router();
    const contract = getMedicalDataIntegrityContract();

    router.post('/', async (req, res) => {
        try {
            const { patientId, doctorId, name, applicationDate, healthCenter, age, createdAt } = req.body;

            const vaccineDoc = {
                _id: `vaccine-${Date.now()}`,
                patientId,
                doctorId,
                name,
                age,
                applicationDate,
                healthCenter,
                createdAt,
                };

            const vaccineDocToHash = JSON.stringify(vaccineDoc);

            await vaccinesDB.put(vaccineDoc);
            await contract.updateDataHash(vaccineDocToHash, patientId, doctorId);

            res.status(201).send({ 'Vaccine added': vaccineDoc});
        } catch (error) {
            res.status(500).send({ error: error.message })
        }
    });

    router.get('/', async (req, res) => {
        try {
            const vaccines = await vaccinesDB.all();
            res.status(200).send(vaccines);
        } catch (error) {
            res.status(500).send({ message: error.message });
        }
    });

    router.get('/:patientId', async(req, res) => {
        try {
            const patientId = req.params.patientId;
            const patientVaccines = await vaccinesDB.query((doc) => {
                return doc.patientId === patientId;
            });

            res.status(200).send(patientVaccines);

        } catch (error) {
            res.status(500).send({ message: error.message });
        } 
    })

    return router;
}