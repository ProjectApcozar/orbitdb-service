import getContract from "./contract.js";

export async function setupContractEvents(patientDB, doctorDB, eventDB) {
    const contract = await getContract();

    contract.on('AccessGranted', async (patient, doctor) => {
        console.log(`AccessGranted: Patient ${patient} granted Doctor ${doctor}`);
    
        const patientDoctors = (await patientDB.get(patient)) || [];
        if (!patientDoctors.includes(doctor)) {
            patientDoctors.push(doctor);
            await patientDB.put(patient, patientDoctors);
        }
    
        const doctorPatients = (await doctorDB.get(doctor)) || [];
        if (!doctorPatients.includes(patient)) {
            doctorPatients.push(patient);
            await doctorDB.put(doctor, doctorPatients);
        }
    
        await eventDB.add({ event: 'AccessGranted', patient, doctor});
    });

    contract.on('AccessRevoked', async (patient, doctor) => {
        console.log(`AccessRevoked: Patient ${patient} revoked Doctor ${doctor}`);
    
        const patientDoctors = (await patientDB.get(patient)) || [];
        await patientDB.put(patient, patientDoctors.filter((d) => d !== doctor));
    
        const doctorPatients = (await doctorDB.get(doctor)) || [];
        await doctorDB.put(patient, doctorPatients.filter((p) => p !== patient));
    
        await eventDB.add({ event: 'AccessRevoked', patient, doctor });
    });

    contract.on('AccessRequest', async (patient, doctor) => {
        console.log(`AccessRequest: Patient ${patient} requested Doctor ${doctor}`);
    });
};