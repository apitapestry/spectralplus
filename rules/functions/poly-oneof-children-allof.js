import YAML from 'yaml';
import _ from 'lodash';

export default (oneOf, _opts, {document, path}) => {
    const errors = [];
    if (!oneOf || oneOf.length === 0) {
        return errors;
    }

    const childrenKeys = [];

    Object.values(oneOf).forEach(child => {
        let childRef = child['$ref'];
        if (childRef) {
            childrenKeys.push(child[$ref].split('/').pop())
        }
    });

    let children = _.pick(YAML.parse(document.input)?.components?.schemas, childrenKeys)
    childrenKeys.forEach(child => {
        if (!children?.[child]?.allOf) {
            errors.push({message: path[2]})
        }
    });

    return errors;
};
