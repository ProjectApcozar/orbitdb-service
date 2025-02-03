import { LevelBlockstore } from 'blockstore-level'
import { createLibp2p } from "libp2p";
import { Libp2pOptions } from "../config/libp2p.js";
import { createHelia } from "helia";
import { createOrbitDB } from "@orbitdb/core";

export async function initOrbitDB() {
    const blockstore = new LevelBlockstore('./ipfs/blocks');
    const libp2p = await createLibp2p(Libp2pOptions);
    const ipfs = await createHelia({ libp2p, blockstore });
    const orbitDB = await createOrbitDB({ ipfs });

    console.log('Initializing databases... ');

    const accessController = {
        type: 'orbitdb',
        write: ['*'],
    };

    const USERS_DB_ADDRESS = process.env.USERS_DB_ADDRESS || 'users';
    const PERMISSIONS_DB_ADDRESS = process.env.PERMISSIONS_DB_ADDRESS || 'permissions';
    const VACCINES_DB_ADDRESS = process.env.VACCINES_DB_ADDRESS || 'vaccines';
    const MEDICATIONS_DB_ADDRESS = process.env.MEDICATIONS_DB_ADDRESS || 'medications';

    const usersDB = await orbitDB.open(USERS_DB_ADDRESS, {
        type: 'keyvalue',
        accessController,
    });

    const permissionsDB = await orbitDB.open(PERMISSIONS_DB_ADDRESS, {
        type: 'documents',
        accessController,
    });

    const medicationsDB = await orbitDB.open(MEDICATIONS_DB_ADDRESS, {
        type: 'documents',
        accessController,
    });

    const vaccinesDB = await orbitDB.open(VACCINES_DB_ADDRESS, {
        type: 'documents',
        accessController,
    });

    return {
        usersDB,
        medicationsDB,
        permissionsDB,
        vaccinesDB,
    };
}