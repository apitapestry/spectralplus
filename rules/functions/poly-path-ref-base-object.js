import YAML from 'yaml';
import _ from 'lodash';
import {JSONPath} from 'jsonpath-plus';

export default (baseObject, _opts, {document, path}) => {
    const errors = [];
    if (!baseObject || !baseObject.discriminator || !baseObject.discriminator.propertyName || !baseObject.properties) {
        return errors;
    }

    let childrenKeys = [];
    let objectKeys = [];
    let baseObjectName = path[path.length - 1];

    if (path[path.length - 1]) {
        Object.values(baseObject.discriminator.mapping).forEach((child) => childrenKeys.push(child.split('/').pop()));
    }

    let schemas = _.omit(YAML.parse(document.input)?.components?.schemas, childrenKeys);
    let parameters = _.omit(YAML.parse(document.input)?.components?.parameters, childrenKeys);
    let paths = YAML.parse(document.input)?.components?.paths;
    if (schemas) objectKeys = Object.keys(schemas);
    findInvalidRef(objectKeys, schemas);
    if (parameters) objectKeys = Object.keys(parameters);
    findInvalidRef(objectKeys, parameters);
    if (paths) objectKeys = Object.keys(paths);
    findInvalidRef(objectKeys, paths);

    return errors;

    function findInvalidRef(keys, objects) {
        let obj;
        keys.forEach(key => {
            obj = JSONPath({path: '$..$ref', json: objects?.[key]});
            obj?.forEach((ref) => {
                ref = ref?.split("/").pop();
                if (ref && ref === baseObjectName) {
                    errors.push({message: key, path: []});
                }
            })
        })
    }
};
