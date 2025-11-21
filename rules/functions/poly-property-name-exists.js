export default (oneOf, _opts, {path}) => {
    const errors = [];
    if (!oneOf || !oneOf.discriminator || !oneOf.discriminator.propertyName || !oneOf.oneOf) {
        return errors;
    }

    let currBaseObject;
    let baseObjectPropertyName;
    let baseObjectPropertyNameObject;

    const checkedBaseObjects = [];
    const childrenObjects = oneOf.oneOf;
    const oneOfPropertyName = oneOf.discriminator.propertyName;

    console.log('childrenObjects: ', childrenObjects);

    Object.keys(childrenObjects).forEach(child => {
        console.log('childrenObjects: ', childrenObjects[child]);
        currBaseObject = childrenObjects[child].allOf[0];
        if (Object.keys(currBaseObject).includes('discriminator')) {
            if (!checkedBaseObjects.includes(currBaseObject)) {
                baseObjectPropertyName = currBaseObject.discriminator?.propertyName;
                baseObjectPropertyNameObject = currBaseObject.properties?.[baseObjectPropertyName];
                if (baseObjectPropertyName !== oneOfPropertyName || !baseObjectPropertyNameObject?.enum) {
                    errors.push({message: 'PropertyName: ' + oneOfPropertyName + ' PolyPath: ' + path.join('.'), path: []})
                }
                checkedBaseObjects.push(currBaseObject);
            }
        }
    })

    return errors;
};
