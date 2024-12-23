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

    const DATA_DB_ADDRESS = process.env.DATA_DB_ADDRESS || 'data';
    const PATIENT_DB_ADDRESS = process.env.PATIENT_DB_ADDRESS || 'patients';
    const DOCTOR_DB_ADDRESS = process.env.DOCTOR_DB_ADDRESS || 'doctors';
    const EVENTS_DB_ADDRESS = process.env.EVENTS_DB_ADDRESS || 'events';

    const dataDB = await orbitDB.open(DATA_DB_ADDRESS, {
        type: 'keyvalue',
        accessController,
    });

    const patientDB = await orbitDB.open(PATIENT_DB_ADDRESS, {
        type: 'keyvalue',
        accessController,
    });

    const doctorDB = await orbitDB.open(DOCTOR_DB_ADDRESS, {
        type: 'keyvalue',
        accessController,
    });

    const eventDB = await orbitDB.open(EVENTS_DB_ADDRESS, {
        type: 'events',
        accessController,
    });

    return {
        patientDB,
        doctorDB,
        dataDB,
        eventDB,
    };
}