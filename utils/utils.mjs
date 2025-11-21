import fs from "node:fs"
import path from "node:path"

// import YAML from "yaml";
import YAML from "yaml";

import spectralRuntime from "@stoplight/spectral-runtime";
import {bundleAndLoadRuleset} from "@stoplight/spectral-ruleset-bundler/with-loader";
import {Resolver} from "@stoplight/json-ref-resolver";
import spectralCore from "@stoplight/spectral-core";

const {fetch} = spectralRuntime;
const {Spectral} = spectralCore;
let loadedContractFiles = [];

export function log(leftMsg, rightMsg, padStr) {
    if (!padStr) padStr = ".";
    if (!rightMsg) rightMsg = "";
    const str = leftMsg.padEnd(100 - rightMsg.toString().length, padStr);
    console.log(str + " " + rightMsg);
}


export function getPaths(directory) {
    try {
        const filesInDir = fs.readdirSync(directory);
        for (const file of filesInDir) {
            const fullPath = path.join(directory, file);
            if (fs.statSync(fullPath).isDirectory()) {
                getPaths(fullPath);
            } else {
                loadedContractFiles.push(fullPath);
            }
        }
    } catch (e) {
        console.warn("Error reading directory: " + directory);
        // console.warn(e);
        process.exit(1);
    }
    return loadedContractFiles;
}

export function getSpectralContractMap(contractPaths, includes, excludes) {
    let contractKey;
    let contractDirectories = new Map();
    let spectralExcludes = [...excludes];
    spectralExcludes.splice(spectralExcludes.indexOf("*/global/*"), 1);
    spectralExcludes.splice(spectralExcludes.indexOf("*/shared/*"), 1);

    for (let contractPath of applyFilters(contractPaths, includes, excludes)) {
        contractKey = path.basename(contractPath);
        if (contractDirectories.has(contractKey)) {
            throw new Error(`Duplicate contract name: ${contractKey}`);
        } else contractDirectories.set(contractKey, contractPath);
    }
    return contractDirectories;
}

export function applyFilters(contractPaths, includes, excludes) {
    let files = contractPaths;
    files = files.filter(p => filterMatch(p, includes));
    files = files.filter(p => filterMatchExclude(p, excludes));
    return files;
}

export function writeValidationItems(validationItems, outputDirectory, contractFileName) {
    validationItems.sort((a, b) => a.ruleId.localeCompare(b.ruleId));
    let fileName = contractFileName.replace(".yaml", ".yml");
    try {
        fs.writeFileSync(path.join(outputDirectory, fileName), YAML.stringify(validationItems, null, {"keepUndefined": true, "lineWidth": 0}), {
            encoding: "utf-8", flag: "w+"
        });
    } catch (e) {
        console.warn("Error writing validation items to file: " + fileName);
        console.warn(e)
    }
}

export function writeValidationItemsCsv(validationItems, outputDirectory, contractFileName) {
    validationItems.sort((a, b) => a.ruleId.localeCompare(b.ruleId));
    let fileName = contractFileName.replace(".yaml", ".csv");
    const csv = validationItems.map(o => Object.values(o).map(escapeCsvValue).join(",")).join("\n");
    try {
        fs.writeFileSync(path.join(outputDirectory, fileName), csv, {
            encoding: "utf-8", flag: "w+"
        });
    } catch (e) {
        console.warn("Error writing validation items to file: " + fileName);
        console.warn(e)
    }
}

function escapeCsvValue(value) {
    if (typeof value === 'string') {
        return '"' + value.replace(/"/g, "'") + '"';
    }
    return value;
}

export function createDir(outputDirectory) {
    if (!fs.existsSync(outputDirectory)) {
        fs.mkdirSync(outputDirectory, {recursive: true});
    }
}

export function readExistingValidationItems(exceptionDirectoryPath, contractFileName) {
    let fileName = contractFileName.replace(".yaml", ".yml");
    try {
        const exceptionFile = fs.readFileSync(path.join(exceptionDirectoryPath, fileName), "utf-8");
        return YAML.parse(exceptionFile, {"ToStringOptions": {"keepUndefined": true, "lineWidth": 0}});
    } catch (e) {
        // console.warn("Error reading existing validation items from file: " + fileName);
        // console.warn(e)
        return null;
    }
}

export function getArg(argKey, defaultValue) {
    let args = process.argv;
    let argIndex = args.indexOf(argKey);
    if (argIndex !== -1) {
        let value = args[argIndex + 1];
        if (value == 'true') value = true;
        if (value == 'false') value = false;
        return value;
    } else {
        return defaultValue;
    }
}

export async function setupSpectral(contractDirs, ruleset){
    const customFileResolver = await new Resolver({
        resolvers: {
            file: {
                resolve: ref => {
                    return new Promise((resolve, reject) => {
                        let resolvedPath;
                        let refPath = path.basename(ref.path());

                        resolvedPath = contractDirs.get(refPath);
                        if (!resolvedPath) {
                            throw new Error(`Could not resolve ${resolvedPath}`);
                        }
                        fs.readFile(resolvedPath, 'utf-8', (err, data) => {
                            if (err) {
                                reject(err);
                            } else {
                                resolve(data);
                            }
                        });
                    });
                },
            },
        },
    });

    const spectral = await new Spectral({ resolve: customFileResolver});


    console.info('Loading ruleset...');
    spectral.setRuleset(await bundleAndLoadRuleset(ruleset, {fs, fetch}).catch((error) => {
        if ('errors' in error) {
            console.error(error.errors[0])
        } else console.error(error);
    }));

    return spectral;
}

export function getOasRules(ruleset) {
    let rulesetObj;
    let rules = [];

    try {
        const rulesetFile = fs.readFileSync(ruleset, "utf-8");
        rulesetObj = YAML.parse(rulesetFile, {"ToStringOptions": {"keepUndefined": true, "lineWidth": 0}});
    } catch (e) {
        console.warn("Error reading ruleset file: " + ruleset);
        console.warn(e)
    }

    Object.entries(rulesetObj.rules).forEach(entry => {
        const [rule, severity] = entry;
        if (severity === 'error') rules.push(rule);
    });
    return rules;
}

export function logDocumentationUrl(ruleId) {
    return; // turning off for now.
    if (!ruleId.includes('oas3')) {
        console.log('    documentation: ' + 'defaulturl' + ruleId.substring(0, ruleId.indexOf('-')) + '/' + ruleId + '.md');
        return;
    }
}

export function formatExecutionTime(time) {
    let timeDate = new Date(time);
    return [timeDate.getMinutes(), timeDate.getSeconds(), timeDate.getMilliseconds()].map(s => String(s).padStart(2, '0')).join(':');
}
export function filterMatchExclude(path, filters) {
    if (filters === null || filters.length <0) {
        return true;
    }
    return !filterMatch(path, filters);
}

export function filterMatch(path, filters) {
    if (filters === null || filters.length <0) {
        return true;
    }
    if (path.includes("\\")) {
        path = path.replace(/\\/g, "/");
    }
    for (const filter of filters) {
        let curr = filter;
        curr = curr.replaceAll("*", ".*");
        if (path.match(curr)) {
            return true;
        }
    }
    return false;
}