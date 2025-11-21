import YAML from 'yaml';

export default (children, _opts, {document, path}) => {
    const errors = [];
    if (!children || children.length === 0) {
        return errors;
    }

    let childrenNames = [];
    let baseObject = path[2];
    let schemas = YAML.parse(document.input)?.components?.schemas;

    Object.values(children).forEach((child) => childrenNames.push(child.split('/').pop()));
    childrenNames.forEach((child) => {
        let missingParent = true;
        schemas[child].allOf?.forEach((property) => {
            if (property.hasOwnProperty('$ref') && property['$ref'].includes(baseObject)) {
                missingParent = false;
            }
        });
        if (missingParent) {
            errors.push({message: baseObject})
        }
    });

    return errors;
};
