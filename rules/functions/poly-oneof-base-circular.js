import YAML from 'yaml';
import _ from 'lodash';

export default (oneOf, _opts, {document}) => {
    const errors = [];
    if (!oneOf || oneOf.length === 0) {
        return errors;
    }

    let baseObject;
    let childFirstRef;
    let childrenObjects;
    let childrenKeys = [];
    let schemas = YAML.parse(document.input)?.components?.schemas;

    Object.values(oneOf).forEach((child) => {
        if (child.hasOwnProperty('$ref')) {
            childrenKeys.push(child['$ref'].split('/').pop())
        }
    });
    childrenObjects = _.pick(schemas, childrenKeys);
    if (childrenObjects && Object.keys(childrenObjects).length !== 0) {
        Object.keys(childrenObjects).forEach((child) => {
            if (childrenObjects[child].allOf) {
                childFirstRef = childrenObjects[child].allOf[0];
                if (Object.keys(childFirstRef).includes('$ref')) {
                    baseObject = childFirstRef['$ref'].split('/').pop();
                    if (schemas.hasOwnProperty(baseObject)
                        && schemas[baseObject].discriminator
                        && schemas[baseObject].discriminator.mapping
                        && !Object.values(schemas[baseObject].discriminator.mapping).includes("#/components/schemas/" + child)) {
                            errors.push({message: baseObject, path: []})
                    }
                }
            }
        })
    }

    return errors;
};
