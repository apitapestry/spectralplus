import YAML from 'yaml';
import _ from 'lodash';

export default (oneOf, _opts, {document, path}) => {
    const errors = [];
    if (!oneOf || oneOf.length === 0) {
        return errors;
    }

    let oneOfName = path[2];

    let childFirstRef;
    let childrenObjects;
    let childrenKeys = [];
    let childFirstRefs = [];

    Object.values(oneOf).forEach((child) => {
        if (child.hasOwnProperty('$ref')) {
            childrenKeys.push(child['$ref'].split('/').pop())
        }
    });
    childrenObjects = _.pick(YAML.parse(document.input)?.components, childrenKeys);
    Object.keys(childrenObjects).forEach((child) => {
        if (childrenObjects[child].allOf) {
            childFirstRef = childrenObjects[child].allOf[0];
            if (Object.keys(childFirstRef).includes('$ref')) {
                childFirstRefs.push(childFirstRef)
            }
        }
    })
    if (errors.length !== 0) {
        return errors;
    }
    childFirstRefs.sort();
    if (childFirstRefs[0]?.$ref !=- childFirstRefs[childFirstRefs.length - 1]?.$ref) {
        errors.push({message: oneOfName})
    }
    return errors;
};
