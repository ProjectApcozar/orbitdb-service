export const doctorDTO = ["id","name", "type", "hospital", "phoneNumber"];
export const patientDTO = [
    "id",
    "name", 
    "dateOfBirth", 
    "phoneNumber", 
    "dni", 
    "hospital",
    "residence",
    "email",
    "permissionDate",
];

export const patientPermissionDTO = [
    "id",
    "patientId",
    "name", 
    "dateOfBirth", 
    "phoneNumber", 
    "dni", 
    "hospital",
    "residence",
    "email",
    "permissionDate",
    "doctorEncryptedPrivateKey",
    "encryptedCipherKey",
];

export const medicationDTO = [
    "patientId",
    "doctorId",
    "name",
    "dosage",
    "frequency",
    "startDate",
    "duration",
    "notes",
    "createdAt",
]