import express from 'express';
import cors from 'cors';
import dotenv from '../config/env.js';
import { initOrbitDB } from '../db/orbitdb.js';
import relationsRoutes from './routes/relations.js';
import usersRoutes from './routes/users.js';
import dataIntegrityRoutes from './routes/dataIntegrity.js';

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());
dotenv.config();

const { patientDB, doctorDB, usersDB, eventDB } = await initOrbitDB();

console.log('PatientDB',patientDB.address.toString());
console.log('DoctorDB',doctorDB.address.toString());
console.log('DataDB',usersDB.address.toString());
console.log('EventDB',eventDB.address.toString());

app.use('/relations', relationsRoutes(patientDB, doctorDB));
app.use('/users', usersRoutes(usersDB));
app.use('/data-integrity', dataIntegrityRoutes())

app.listen(port, () => {
    console.log(`Server running on port: ${port}`);
});
