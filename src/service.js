import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { LevelBlockstore } from 'blockstore-level';
import { createLibp2p } from 'libp2p';
import { createHelia } from 'helia';
import { createOrbitDB } from '@orbitdb/core';
import { Libp2pOptions } from '../config/libp2p.js';

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());
dotenv.config();

const blockstore = new LevelBlockstore('./ipfs/blocks');
const libp2p = await createLibp2p(Libp2pOptions);
const ipfs = await createHelia({ libp2p, blockstore });
const orbitdb = await createOrbitDB({ipfs});
const db_address = process.env.DB_ADDRESS;

let db = null;

if (db_address) {
    db = await orbitdb.open(db_address, {
        type: 'keyvalue'
    });
} else {
    db = await orbitdb.open('my-db', { 
        type: 'keyvalue',
        create: true,
        overwrite: false,
        accessController: {
            write: ['*']
        }
    });
}

console.log('my-db address', db.address)

app.post('/items', async (req, res) => {
    try{
        console.log(req.body);
        const { key, nombre, edad, telefono } = req.body;
        const value = { nombre, edad, telefono };

        const hash = await db.put(key, value);
        res.status(201).send({ message: 'Item added' });
        console.log(`Nuevo registro añadido: { key: "${key}", value: "${value}", hash: "${hash}" }`);
    } catch (error) {
        res.status(500).send({ error: error.message })
    }
});

app.get('/items', async (req, res) => {
    try {
        const items = await db.all();
        res.status(200).send(items);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

app.get("/items/:key", async (req, res) => {
    try {
        const key = req.params.key;
        const item = await db.get(key);

        if (!item) {
            return res.status(404).send({ message: 'Item not found' });
        }

        res.status(200).send(item);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

app.patch('/items/:key', async (req, res) => {
    try {
        const key = req.params.key;
        const updates = req.body;
        const existingValue = await db.get(key);

        if (!existingValue) {
            return res.status(404).send({ message: 'Item not found'});
        }

        const updatedValue = { ...existingValue, ...updates };
        const hash = await db.put(key, updatedValue);

        res.status(200).send({ message: 'Item updated', hash });
        console.log(`Registro actualizado: { key: "${key}", value: "${JSON.stringify(updatedValue)}", hash: "${hash}" }`);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

app.delete('/items/:key', async (req, res) => {
    try {
        const key = req.params.key;
        const existingValue = await db.get(key);

        if (!existingValue) {
            return res.status(404).send({ message: 'Item not found' });
        }

        await db.del(key);

        res.status(200).send({ message: 'Item deleted'});
        console.log(`Registro eliminado: { key: "${key}" }`);

    } catch {
        res.status(500).send({ error: error.message });
    }
})

app.listen(port, () => {
    console.log(`Server running on port: ${port}`);
});

process.on('SIGINT', async () => {
    console.log('Cerrando el servidor...');
  
    try {
      // Cierra la base de datos
      if (db) {
        await db.close();
        console.log('Base de datos cerrada correctamente.');
      }
  
      // Cierra libp2p
      if (libp2p) {
        await libp2p.stop();
        console.log('Libp2p detenido.');
      }
  
      // Sal del proceso
      process.exit(0);
    } catch (error) {
      console.error('Error al cerrar el servidor:', error);
      process.exit(1);
    }
});
  