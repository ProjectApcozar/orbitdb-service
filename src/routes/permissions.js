import { Router } from 'express';

export default function permissionsRoutes(patientDB, doctorDB) {
    const router = Router();

    router.post('/', async (req, res) => {
        try {
            const { patient, doctor } = req.body;
            
            if (!patient || !doctor) {
                return res.status(400).send({
                    message: 'Patient and doctor are required'
                });
            }
    
            const patientDoctors = (await patientDB.get(patient)) || [];
            if (!patientDoctors.includes(doctor)){
                patientDoctors.push(doctor);
                await patientDB.put(patient, patientDoctors);
            }
    
            const doctorPatients = (await doctorDB.get(doctor)) || [];
            if (!doctorPatients.includes(patient)) {
                doctorPatients.push(patient);
                await doctorDB.put(doctor, doctorPatients);
            }
    
            res.status(201).send({ message: 'Relation added'});
        } catch (error) {
            res.status(500).send({ message: error.message });
        };
    });

    router.get('/patient/:patient', async (req, res) =>{
        try {
            const doctors = (await patientDB.get(req.params.patient)) || [];
            res.status(200).send(doctors);
        } catch (error) {
            res.status(500).send({ message: error.message });
        }
    });

    router.get('/doctor/:doctor', async(req, res) => {
        try {
            const patients = (await doctorDB.get(req.params.doctor)) || [];
            res.status(200).send(patients);
        } catch (error) {   
            res.status(500).send({ message: error.message });
        }
    });

    router.delete('/', async(req, res) => {
        try {
            const { patient, doctor } = req.body;
            if (!patient || !doctor) {
                return res.status(400).send({
                    message: 'Patient and Doctor are necessary'
                });
            }
    
            const patientDoctors = (await patientDB.get(patient)) || [];
            await patientDB.put(patient, patientDoctors.filter((d) => d !== doctor));
    
            const doctorPatients = (await doctorDB.get(doctor)) || [];
            await doctorDB.put(doctor, doctorPatients.filter((p) => p !== patient));
    
            res.status(200).send(({ message: 'Relation removed' }));
        } catch (error) {
            res.status(500).send({ message: error.message });
        };
    });

    return router;
}