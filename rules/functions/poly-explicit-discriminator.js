import {JSONPath} from 'jsonpath-plus';

export default (oneOf, _opts, {document, path}) => {
    const errors = [];
    if (!oneOf || oneOf.length === 0) {
        return errors;
    }

    let requiredList = [];
    let requiredSet = new Set();

    Object.keys(oneOf).forEach((child) => {
        let allOf = oneOf[child].allOf;
        let inlineRequired = oneOf[child].required;
        let childRequiredList = [];
        if (inlineRequired) {
            childRequiredList.push(inlineRequired.flat().sort());
        }
        if (allOf) {
            childRequiredList.push(JSONPath({path: '$..required', json: allOf}).flat().sort());
        }
        requiredList.push(childRequiredList.flat().sort());
    });
    requiredList.forEach(child => {
        child = child.join(',');
        requiredSet.add(child);
    });
    if (requiredSet.size !== requiredList.length) {
        errors.push({message: path.join('.')});
    }
    return errors;
};
