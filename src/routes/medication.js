import { Router } from 'express';
import getMedicalDataIntegrityContract from '../utils/contract.js';

export default function medicationsRoutes(medicationsDB) {
    const router = Router();
    const contract = getMedicalDataIntegrityContract();

    router.post('/', async (req, res) => {
        try {
            const { patientId, doctorId, name, dosage, frequency, startDate, duration, notes, createdAt } = req.body;

            const medicineDoc = {
                _id: `medicine-${Date.now()}`,
                patientId,
                doctorId,
                name,
                dosage,
                frequency,
                startDate,
                duration,
                notes,
                createdAt,
            };

            const medicineDocToHash = JSON.stringify(medicineDoc);

            await medicationsDB.put(medicineDoc);
            await contract.updateDataHash(medicineDocToHash, patientId, doctorId);

            res.status(201).send({ 'Vaccine added': medicineDoc});
        } catch (error) {
            res.status(500).send({ error: error.message })
        }
    });

    router.get('/', async (req, res) => {
        try {
            const medicines = await medicationsDB.all();
            res.status(200).send(medicines);
        } catch (error) {
            res.status(500).send({ message: error.message });
        }
    });

    router.get('/:patientId', async(req, res) => {
        try {
            const patientId = req.params.patientId;
            const patientMedicines = await medicationsDB.query((doc) => {
                return doc.patientId === patientId;
            });
            
            res.status(200).send(patientMedicines);
        } catch (error) {
            res.status(500).send({ message: error.message });
        } 
    });

    return router;
}