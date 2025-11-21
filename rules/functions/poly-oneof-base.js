import YAML from 'yaml';
import _ from 'lodash';

export default (oneOf, _opts, {document}) => {
    const errors = [];
    if (!oneOf || oneOf.length === 0) {
        return errors;
    }

    let childFirstRef;
    let currBaseObject;
    let childrenObjects;
    let childrenKeys = [];
    let checkedBaseObjects = [];
    let schemas = YAML.parse(document.input)?.components?.schemas;
    Object.values(oneOf).forEach((child) => {
        if (child.hasOwnProperty('$ref')) {
            childrenKeys.push(child['$ref'].split('/').pop())
        }
    });
    childrenObjects = _.pick(schemas, childrenKeys);
    Object.keys(childrenObjects).forEach((child) => {
        if (childrenObjects[child].allOf) {
            childFirstRef = childrenObjects[child].allOf[0];
            if (Object.keys(childFirstRef).includes('$ref')) {
                currBaseObject = childFirstRef['$ref'].split('/').pop();
                if (!checkedBaseObjects.includes(currBaseObject)) {
                    if (!schemas.hasOwnProperty(currBaseObject) || !schemas[currBaseObject].discriminator || !schemas[currBaseObject].discriminator.mapping) {
                        errors.push({message: `Base object ${currBaseObject} not found`, path: []})
                    }
                    checkedBaseObjects.push(currBaseObject);
                }
            }
        }
    })

    return errors;
};
