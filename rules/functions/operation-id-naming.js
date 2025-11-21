import _ from "lodash";
import pluralize from "pluralize";

export default (operation, _opts, {path}) => {
  const errors = [];
  if (operation === null || typeof operation !== 'object' || !operation.operationId) {
    return [];
  }
  const verb = path[path.length - 1];
  const operationId = operation.operationId;
    let properOperationId;
    let alternativeOperationId;
    let opPath = path[path.length - 2];
    let lastSegment = opPath.split('/').slice(-1).toString();

    addPluralizeExceptions();

    if (opPath) {
        let pathArr = [];
        opPath.split('/').forEach(segment => {
            if (segment != "api" && !segment.match(/^v\d$/)) {
                pathArr.push(segment);
            }
        })
        opPath = pathArr.join('/');
    }

    let prefix = "get";
    if (verb === "post") {
        prefix = "create";
    }
    if (verb === "post" && lastSegment === "query") {
        prefix = "get";
    }
    if (verb === "patch") {
        prefix = "update";
    }
    if (verb === "put") {
        prefix = "ambiguous";
    }
    if (verb === "delete") {
        prefix = "delete";
    }

    properOperationId = processPath(prefix, verb, opPath);
    if (prefix === "ambiguous") {
        properOperationId = processPath("replace", verb, opPath);
        alternativeOperationId = processPath("upsert", verb, opPath);
    }

    if (operationId !== properOperationId && operationId !== alternativeOperationId) {
        if (alternativeOperationId) {
          errors.push({message: [properOperationId, alternativeOperationId].toString()})
          } else errors.push({message: properOperationId})
    }

    return errors;
}

//The prefixes in singularPrefixes will always be singular
//POST without query keyword present will always be singular
//GET paths that end with a path parameter will always be singular
function processPath(prefix, verb, opPath) {
    let properOperationId = prefix;
    let segments = opPath.substring(1).split('/');
    const endsWithPathParm = opPath.endsWith('}');
    const singularPrefixes = ["put", "patch", "delete", "post"];


    if ((singularPrefixes.includes(verb) && !opPath.endsWith('query')) || (prefix === "get" && endsWithPathParm)) {
        for (let i in segments) {
            if (!segments[i].startsWith('{') && !segments[i].endsWith('}')) {
                if (segments[i].includes('-')) {
                    properOperationId += camelCase(_.capitalize(segments[i]), true);
                } else properOperationId += _.capitalize(pluralize.singular(segments[i]), true);
            }
        }
    } else {
        let i = segments.indexOf('query');
        if (i >= 0) {
            segments.splice(i, 1);
        }
        for (let i in segments) {
            if (segments[i].startsWith('{') && segments[i].endsWith('}')) {
                continue;
            }
            if (endsWithPathParm) {
                properOperationId += camelCase(_.capitalize(pluralize.singular(segments[i])), true);
            } else if (i < segments.length - 1) {
                properOperationId += camelCase(_.capitalize(pluralize.singular(segments[i])));
            } else properOperationId += camelCase(_.capitalize(segments[i]));
        }
    }

    if (properOperationId.includes("Action")) {
        properOperationId = properOperationId.replace("create", "execute");
    }
    return properOperationId;
}

function camelCase(segment, singular) {
    if (!segment.includes('-')) {
        return segment;
    }

    let subStrings = segment.split('-');
    let processSegment = "";
    subStrings.forEach(subString => {
        if (subString.toLowerCase() === "actions" || subString.toLowerCase() === "action") {
            processSegment += 'Action'
        } else if (singular) {
            processSegment += _.capitalize(pluralize.singular(subString));
        } else {
            processSegment += _.capitalize(subString);
        }
    })

    return processSegment;
}

function addPluralizeExceptions() {
    pluralize.addUncountableRule('data');
    pluralize.addUncountableRule('sms');
    pluralize.addIrregularRule('agenda', 'agendas');
}
