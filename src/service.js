import express from 'express';
import cors from 'cors';
import { LevelBlockstore } from 'blockstore-level';
import { createLibp2p } from 'libp2p';
import { createHelia } from 'helia';
import { createOrbitDB } from '@orbitdb/core';
import { Libp2pOptions } from '../config/libp2p.js';

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());

const blockstore = new LevelBlockstore('./ipfs/blocks');
const libp2p = await createLibp2p(Libp2pOptions);
const ipfs = await createHelia({ libp2p, blockstore });
const orbitdb = await createOrbitDB({ ipfs });
const db = await orbitdb.open('my-db', { type: 'keyvalue' });

console.log('my-db address', db.address)

app.post('/items', async (req, res) => {
    try{
        console.log(req.body);
        const { key, nombre, edad } = req.body;
        const value = { nombre, edad };

        const hash = await db.put(key, value);
        res.status(201).send({ message: 'Item added' });
        console.log(`Nuevo registro añadido: { key: "${key}", value: "${value}", hash: "${hash}" }`);
    } catch (error) {
        res.status(500).send({ error: error.message })
    }
});

app.get('/items', async (red, res) => {
    try {
        const items = await db.all();
        res.status(200).send(items);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server running on port: ${port}`);
});