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
    let childProperties = [];
    let baseObjectProperties = [];
    let duplicateProperties = [];
    let schemas = YAML.parse(document.input)?.components?.schemas;

    Object.values(oneOf).forEach((child) => {
        if (child.hasOwnProperty('$ref')) {
            childrenKeys.push(child[$ref].split('/').pop())
        }
    });
    childrenObjects = _.pick(schemas, childrenKeys);
    if (childrenObjects && Object.keys(childrenObjects).length !== 0) {
        Object.keys(childrenObjects).forEach((child) => {
            if (childrenObjects[child].allOf) {
                childProperties = childrenObjects[child].allOf[childrenObjects[child].allOf.length - 1].properties;
                if (childProperties) childProperties = Object.keys(childProperties);
                childFirstRef = childrenObjects[child].allOf[0];
                if (Object.keys(childFirstRef).includes('$ref')) {
                    baseObject = childFirstRef['$ref'].split('/').pop();
                    baseObjectProperties = schemas.hasOwnProperty(baseObject) ? schemas[baseObject].properties : null;
                    if (baseObjectProperties) baseObjectProperties = Object.keys(baseObjectProperties);
                    duplicateProperties = _.intesection(childProperties, baseObjectProperties);
                    if (duplicateProperties.length > 0) {
                        errors.push({message: `Duplicate properties found in ${child} and ${baseObject}`, path: []})
                    }
              }
            }
        })
    }

    return errors;
};
