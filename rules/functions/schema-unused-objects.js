import {JSONPath} from 'jsonpath-plus';
import _ from 'lodash';

export default (contract, _opts) => {
    const errors = [];
    if (contract === null || Object.keys(contract.paths).length === 0) {
        return errors;
    }

    let contractCopy = _.cloneDeep(contract);
    let count;
    do {
        count = removeUnusedObjects(contractCopy);
    } while (count > 0);

    function removeUnusedObjects(contract) {
        let count = 0;
        let refs = JSONPath({path: '$..$ref', json: contract});
        let schemas = new Set(JSONPath({path: '$..components.schema.*~', json: contract}));
        let parameters = new Set(JSONPath({path: '$..components.parameters.*~', json: contract}));
        let models = new Set([...schemas, ...parameters]);

        refs.forEach((ref, index, list) => {
            list[index] = ref.split('/').slice(-1).toString();
        });

        refs = Array.from(new Set(refs));
        models = Array.from(models);

        models.forEach((model) => {
            if (!refs.includes(model)) {
                errors.push({message: model});
                if (contract?.components?.schemas?.[model]) {
                    delete contract.components.schemas[model];
                } else if (contract?.components?.parameters?.[model]) {
                    delete contract.components.parameters[model];
                }
                count++;
            }
        });
        return count;
    }
    return errors;
};
