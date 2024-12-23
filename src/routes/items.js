import { Router } from 'express';

export default function itemsRoutes(dataDB) {
    const router = Router();

    router.post('/', async (req, res) => {
        try{
            console.log(req.body);
            const { key, nombre, edad, telefono } = req.body;
            const value = { nombre, edad, telefono };
    
            const hash = await dataDB.put(key, value);
            res.status(201).send({ message: 'Item added' });
            console.log(`Nuevo registro añadido: { key: "${key}", value: "${value}", hash: "${hash}" }`);
        } catch (error) {
            res.status(500).send({ error: error.message })
        }
    });

    router.get('/', async (req, res) => {
        try {
            const items = await dataDB.all();
            res.status(200).send(items);
        } catch (error) {
            res.status(500).send({ error: error.message });
        }
    });

    router.get("/:key", async (req, res) => {
        try {
            const key = req.params.key;
            const item = await dataDB.get(key);
    
            if (!item) {
                return res.status(404).send({ message: 'Item not found' });
            }
    
            res.status(200).send(item);
        } catch (error) {
            res.status(500).send({ error: error.message });
        }
    });

    router.patch('/:key', async (req, res) => {
        try {
            const key = req.params.key;
            const updates = req.body;
            const existingValue = await dataDB.get(key);
    
            if (!existingValue) {
                return res.status(404).send({ message: 'Item not found'});
            }
    
            const updatedValue = { ...existingValue, ...updates };
            const hash = await dataDB.put(key, updatedValue);
    
            res.status(200).send({ message: 'Item updated', hash });
            console.log(`Registro actualizado: { key: "${key}", value: "${JSON.stringify(updatedValue)}", hash: "${hash}" }`);
        } catch (error) {
            res.status(500).send({ error: error.message });
        }
    });

    return router;
}