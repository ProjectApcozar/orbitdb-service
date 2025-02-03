import express from 'express';
import cors from 'cors';
import dotenv from '../config/env.js';
import { initOrbitDB } from '../db/orbitdb.js';
import permissionsRoutes from './routes/permissions.js';
import usersRoutes from './routes/users.js';
import dataIntegrityRoutes from './routes/dataIntegrity.js';
import vaccinesRoutes from './routes/vaccines.js';
import medicationsRoutes from './routes/medication.js';

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());
dotenv.config();

const { permissionsDB, usersDB, medicationsDB, vaccinesDB } = await initOrbitDB();

console.log('UserDB',usersDB.address.toString());
console.log('PermissionsDB',permissionsDB.address.toString());
console.log('VaccinesDB', vaccinesDB.address.toString());
console.log('MedicationsDB', medicationsDB.address.toString());

app.use('/permissions', permissionsRoutes(permissionsDB, usersDB));
app.use('/users', usersRoutes(usersDB));
app.use('/data-integrity', dataIntegrityRoutes());
app.use('/vaccines', vaccinesRoutes(vaccinesDB));
app.use('/medications', medicationsRoutes(medicationsDB));

app.listen(port, () => {
    console.log(`Server running on port: ${port}`);
});
