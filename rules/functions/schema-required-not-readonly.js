import _ from 'lodash';

export default (schema, _opts) => {
    const errors = [];
    if (schema === null || !schema.hasOwnProperty("required") || !schema.hasOwnProperty("properties")) {
        return errors;
    }

    let requird = schema.required;
    let properties = Object.keys(schema.properties);
    _.intersection(requird, properties).forEach((prop) => {
        let property = schema.properties[prop];
        if (property.hasOwnProperty("readOnly") && property['readOnly'] === true) {
            errors.push({message: `Property ${prop} is required and read-only`});
        }
    });
    return errors;
};
