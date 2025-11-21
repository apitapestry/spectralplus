export default (baseObject, _opts) => {
    const errors = [];
    if (!baseObject || !baseObject.discriminator.propertyName) {
        return errors;
    }

    const baseObjectPropertyName = baseObject.discriminator.propertyName;
    const baseObjectPropertyNameObject = baseObject.properties[baseObjectPropertyName];

    if (baseObjectPropertyNameObject) {
        const baseObjectPropertyNameObjectkeys = Object.keys(baseObjectPropertyNameObject);
        if (baseObjectPropertyNameObjectkeys.length !== 1 || baseObjectPropertyNameObjectkeys[0] !== '$ref') {
            errors.push({message: baseObjectPropertyName, path: []});
        }
    }

    return errors;
};
