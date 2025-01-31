export const generatePermissionsId = (patient, doctor) => {
    return `${patient}_${doctor}`;
};

export const selectFields = (data, dto) => {
    return Object.fromEntries(
        Object.entries(data).filter(([key]) => dto.includes(key))
    );
};
