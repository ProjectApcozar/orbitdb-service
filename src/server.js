import express from 'express';
import cors from 'cors';
import dotenv from '../config/env.js';
import { initOrbitDB } from '../db/orbitdb.js';
import permissionsRoutes from './routes/permissions.js';
import usersRoutes from './routes/users.js';
import dataIntegrityRoutes from './routes/dataIntegrity.js';

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());
dotenv.config();

const { permissionsDB, usersDB } = await initOrbitDB();

console.log('UserDB',usersDB.address.toString());
console.log('PermissionsDB',permissionsDB.address.toString());

app.use('/permissions', permissionsRoutes(permissionsDB, usersDB));
app.use('/users', usersRoutes(usersDB));
app.use('/data-integrity', dataIntegrityRoutes())

app.listen(port, () => {
    console.log(`Server running on port: ${port}`);
});
