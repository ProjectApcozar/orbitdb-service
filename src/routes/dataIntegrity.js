import { Router } from 'express';
import getMedicalDataIntegrityContract from '../utils/contract.js';

export default function dataIntegrityRoutes() {
    const router = Router();
    const contract = getMedicalDataIntegrityContract();

    router.get('/', async (req, res) => {
        try {
            const filter = contract.filters.DataHashUpdated();
            const logs = await contract.queryFilter(filter);

            logs.forEach((log) => {
                console.log(log.args.dataHash);
                console.log(log.args.timestamp.toString());
                console.log(log.args.owner);
                console.log(log.args.updatedBy);
            });

            res.status(200).send(logs);
        } catch (error) {
            res.status(500).send({ error: error.message });
        }
    });

    router.post('/', async (req, res) => {
        try {
            const { data } = req.body;
            const tx = await contract.updateDataHash(data);

            res.status(201).send({ message: 'Event added', tx });

        } catch (error) {
            res.status(500).send({ error: error.message });
        }
    });

    return router;
}