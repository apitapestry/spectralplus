import _ from 'lodash';

export function applyMappers(validationItems, contractFileName) {
    let newValidationItems = validationItems;

    newValidationItems = renameKeysMapper(newValidationItems);
    newValidationItems = addContractFieldMapper(newValidationItems);
    newValidationItems = mapSeverityMapper(newValidationItems);
    newValidationItems = getSchemaPathsMapper(newValidationItems);
    newValidationItems = getStartEndPosMapper(newValidationItems);
    newValidationItems = toUnixPathsMapper(newValidationItems);

    return newValidationItems;
}

export function applyExceptions(validationItems, exceptionFile) {
    const keys= ['ruleId', 'schemaPath'];

    return _.map(validationItems, (item) => {
        const match = _.some(exceptionFile, _.pick(item, keys));
        if (match && item.severity === 'ERROR') {
            return {...item, severity: 'WARNING'};
        } else {
            return item;
        }
    });
}

function renameKeysMapper(validationItems) {
    return validationItems.map(function (currentError) {
        currentError = _.mapKeys(currentError, function (value, key) {
            switch (key) {
                case 'code':
                    return 'ruleId';
                case 'source':
                    return 'contract';
                case 'path':
                    return 'schemaPath';
                default:
                    return key;
            }
        });
        return currentError;
    });
}

function mapSeverityMapper(validationItems) {
    return validationItems.map(function (currentError) {
        currentError = _.mapValues(currentError, (value) => {
            switch (value) {
                case 0:
                    return 'ERROR';
                case 1:
                    return 'WARNING';
                case 2:
                    return 'INFO';
                case 3:
                    return 'HINT';
                default:
                    return value;
            }
        });
        return currentError;
    });
}

function addContractFieldMapper(validationItems, contractFileName) {
    return _.map(validationItems, (item) => {
        if (!item.contract) {
            item.contract = contractFileName;
        } else {
            item.contract = item.contract.split('/').slice(-1).toString();
        }
        return item;
    });
}

function getSchemaPathsMapper(validationItems) {
    const customPath = 'PolyPath: ';
    const pathLen = customPath.length;
    return validationItems.map(function (currentError) {
        if (currentError.message.includes(customPath)){
            const pathIndex = currentError.message.indexOf(customPath);
            currentError.schemaPath = currentError.message.substring(pathIndex + pathLen).split(',');
        }
        currentError.schemaPath = currentError.schemaPath.join('.');
        return currentError;
    })
}

function getStartEndPosMapper(validationItems) {
    return validationItems.map(function (currentError) {
        delete currentError.range;
        return currentError;
    });
}

function toUnixPathsMapper(validationItems) {
    return validationItems.map(function (currentError) {
        let message = currentError.message;
        if (!message.includes('no such file or directory') && !message.includes('\\')) {
            return currentError;
        }
        message = message.replace(/\\/g, '/');
        message = message.replaceAll('H:', '');
        message = message.replace("/APIUtilities/utilities", "../..");
        currentError.message = message;

        return currentError;
    });
}