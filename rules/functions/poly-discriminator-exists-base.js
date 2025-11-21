export default (schema, _opts) => {
    const errors = [];
    if (!schema || !schema.discriminator || !schema.discriminator.propertyName || !schema.properties) {
        return errors;
    }

    let found = false;
    let propertyName = schema.discriminator.propertyName;
    Object.keys(schema.properties).forEach((property) => {
        if (property === propertyName) {
            found = true;
        }
    });

    if (!found) {
        errors.push({message: 'Discriminatory property not found in object'});
    }

    return errors;
};
