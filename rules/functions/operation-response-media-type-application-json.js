export default (response, _opts) => {
    const errors = [];
    if (response === null || typeof response !== 'object') return [];

    if (!Object.keys(response).map(res => res.includes('application/json'))) {
        errors.push({message: response, path: []});
    }

    return errors;
}