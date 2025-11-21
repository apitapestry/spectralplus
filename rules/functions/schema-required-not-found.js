import _ from 'lodash';

export default (schema, _opts) => {
    const errors = [];
    if (schema === null || !schema.hasOwnProperty("required") || !schema.hasOwnProperty("properties")) {
        return errors;
    }

    let requird = schema.required;
    let properties = Object.keys(schema.properties);
    let diff = _.difference(requird, properties);

    if (diff && diff.length !== 0) {
        errors.push({message: diff.toString()});
    }
    return errors;
};
