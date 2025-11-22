import * as fs from 'node:fs';
import * as path from 'node:path';

import * as mapper from './utils/linterMapper.mjs';
import * as utils from './utils/utils.mjs';

import Parsers from '@stoplight/spectral-parsers';
import spectralCore from '@stoplight/spectral-core';
import { program } from 'commander';

const workingDir = process.cwd();
const parentDir = path.dirname(workingDir);
const parentName = path.basename(parentDir);
const moduleName = path.basename(workingDir);
let hasErrors = false;

// Setup commander for CLI argument parsing
program
    .option('--errors <path>', 'Path to errors directory', 'target/contract-linter-errors')
    .option('--exceptions <path>', 'Path to exceptions directory', '../contract-linter-exceptions')
    .option('--excludes <patterns>', 'Comma-separated exclude patterns', '*wip*, */target/*, */global/*')
    .option('--includes <patterns>', 'Comma-separated include patterns', '*.yaml')
    .option('--rules <file>', 'Path to rule set file', 'contract-rule-set.yml')
    .option('--silent <boolean>', 'Silent mode', 'false')
    .option('--csv <boolean>', 'Output CSV format', 'false')
    .parse(process.argv);

const options = program.opts();

const errorsArg = options.errors;
const exceptionsArg = options.exceptions;
const excludesArg = options.excludes.replace(/ /g, '').split(',');
const includesArg = options.includes.replace(/ /g, '').split(',');
const rulesArg = options.rules;
const silentArg = options.silent;
const csvArg = options.csv;

let exceptionsEnv = process.env.CONTRACT_LINTER_EXCEPTIONS;
let rulesEnv = process.env.CONTRACT_LINTER_RULES;

const errorsDir = path.join(workingDir, errorsArg);

let exceptionsDir = exceptionsArg;
if (exceptionsEnv) exceptionsDir = exceptionsEnv;
exceptionsDir.replace(/\{repo\}/g, parentName).replace(/\{module\}/g, moduleName);
if (!exceptionsDir.startsWith('~') && !exceptionsDir.startsWith('/')) {
    exceptionsDir = path.join(workingDir, exceptionsDir);
}

let ruleSet = rulesArg;
if (rulesEnv) ruleSet = rulesEnv;
ruleSet = path.join(path.dirname(process.argv[1]), ruleSet);

utils.log('', '', '-');
console.info('Linter started');
utils.log('', '', '-');
utils.log('Working directory', workingDir, '-');
utils.log('--errors', errorsArg);
utils.log('--exceptions', exceptionsArg);
utils.log('--rules', rulesArg);
utils.log('--includes', includesArg);
utils.log('--excludes', excludesArg);
utils.log('--silent', silentArg);
utils.log('--csv', csvArg);

if (exceptionsEnv || rulesEnv) {
    utils.log('', '', '-');
    console.log('Environment variables');
    utils.log('CONTRACT_LINTER_EXCEPTIONS: ', exceptionsEnv);
    utils.log('CONTRACT_LINTER_RULES: ', rulesEnv);
}
utils.log('', '', '-');

// fail if contractsDir does not exist
if (!fs.existsSync(workingDir)) {
    console.error('Contracts directory does not exist');
    process.exit(1);
}
// fail if exceptionsDir does not exist
if (!fs.existsSync(exceptionsDir)) {
    console.error('Exceptions directory does not exist');
    process.exit(1);
}
// initial cleanup
utils.createDir(errorsDir);

//Call execSync to run the command
execute().then(logs => {
    if (logs) console.log(logs);
    utils.log('', '', '-');
    process.exit(0);
}).catch((error) => {
    if ('errors' in error) {
        error.errors.forEach((e) => {
            utils.log(e.path.join('.'), e.message, 'error');
        });
    } else {
        console.error(error);
        process.exit(1);
    }
});

async function execute() {
    let totalExecutionTime = 0;

    let contractPaths = utils.getPaths(workingDir);
    contractPaths = utils.applyFilters(contractPaths, includesArg, excludesArg);
    let spectralContractMap = utils.getSpectralContractMap(contractPaths, includesArg, excludesArg);
    let spectral = await utils.setupSpectral(spectralContractMap, ruleSet);
    let oasRules = utils.getOasRules(ruleSet);

    if (contractPaths.length === 0) {
        console.error('No contracts found!');
    } else {
        console.log('Rules loaded (' + Object.keys(spectral.ruleset.rules).length + ')');
        utils.log('', '', '-');
        console.log('Linting started');
    }

    //Run sequentially
    const {Document} = spectralCore;
    for (const contractPath of contractPaths) {
        let exceptionFile;
        let errorItems = [];
        let contractFileName = path.basename(contractPath);
        const file = new Document(fs.readFileSync(contractPath, 'utf-8').trim(), Parsers.Yaml, contractFileName);
        let start = performance.now();
        await spectral.run(file).then(async logs => {
            if (logs.length > 0) {
                errorItems = await JSON.parse(JSON.stringify(logs));
                errorItems = await mapper.applyMappers(errorItems, contractFileName);
                exceptionFile = await utils.readExistingValidationItems(exceptionsDir, contractFileName);
                await utils.writeValidationItems(errorItems, errorsDir, contractFileName);
                if (csvArg === 'true') await utils.writeValidationItemsCsv(errorItems, errorsDir, contractFileName);
                if (exceptionFile) errorItems = await mapper.applyExceptions(errorItems, exceptionFile);
            }
            let ruleExecutionTime = performance.now() - start;
            totalExecutionTime += ruleExecutionTime;
            utils.log(contractFileName, 'Issues: (' + errorItems.length + ') in ' + utils.formatExecutionTime(ruleExecutionTime), '.');
            if (silentArg === 'false') {
                errorItems.forEach(error => {
                    if (error.severity === 'ERROR' && !hasErrors) hasErrors = true;
                    if (error.severity === 'ERROR') {
                        console.log('- ' + error.severity + ': ' + error.ruleId + ': ' + error.message);
                        if (!oasRules.includes(error.ruleId)) utils.logDocumentationUrl(error.ruleId);
                        if (!error.message.includes('ref: ')) {
                            console.log('  Path: ' + error.schemaPath);
                        }
                    }
                });
            }
        }).catch((error) => {
            console.log('Error: ', path.basename(contractPath));
            if ('errors' in error) {
                throw error.errors[0]
            } else throw error;
        });
    }
    console.log("Total execution time: " + utils.formatExecutionTime(totalExecutionTime));

    if (hasErrors && silentArg === 'false') {
        utils.log('', '', '-');
        console.log('All Errors must be resolved before merging');
        process.exit(1);
    }
}