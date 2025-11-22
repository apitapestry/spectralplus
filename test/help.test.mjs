import { describe, it, expect } from 'vitest';
import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const spectralPlusPath = path.join(__dirname, '../src/spectralplus.mjs');

describe('Commander Help Screen Tests', () => {
    it('should display help when --help flag is used', () => {
        const output = execSync(`node ${spectralPlusPath} --help`, {
            encoding: 'utf-8'
        });

        expect(output).toContain('Options:');
        expect(output).toContain('--help');
    });

    it('should display --errors option in help', () => {
        const output = execSync(`node ${spectralPlusPath} --help`, {
            encoding: 'utf-8'
        });

        expect(output).toContain('--errors');
        expect(output).toContain('Path to errors directory');
        expect(output).toContain('target/contract-linter-errors');
    });

    it('should display --exceptions option in help', () => {
        const output = execSync(`node ${spectralPlusPath} --help`, {
            encoding: 'utf-8'
        });

        expect(output).toContain('--exceptions');
        expect(output).toContain('Path to exceptions directory');
        expect(output).toContain('../contract-linter-exceptions');
    });

    it('should display --excludes option in help', () => {
        const output = execSync(`node ${spectralPlusPath} --help`, {
            encoding: 'utf-8'
        });

        expect(output).toContain('--excludes');
        expect(output).toContain('Comma-separated exclude patterns');
        expect(output).toContain('*wip*');
    });

    it('should display --includes option in help', () => {
        const output = execSync(`node ${spectralPlusPath} --help`, {
            encoding: 'utf-8'
        });

        expect(output).toContain('--includes');
        expect(output).toContain('Comma-separated include patterns');
        expect(output).toContain('*.yaml');
    });

    it('should display --rules option in help', () => {
        const output = execSync(`node ${spectralPlusPath} --help`, {
            encoding: 'utf-8'
        });

        expect(output).toContain('--rules');
        expect(output).toContain('Path to rule set file');
        expect(output).toContain('contract-rule-set.yml');
    });

    it('should display --silent option in help', () => {
        const output = execSync(`node ${spectralPlusPath} --help`, {
            encoding: 'utf-8'
        });

        expect(output).toContain('--silent');
        expect(output).toContain('Silent mode');
        expect(output).toContain('false');
    });

    it('should display --csv option in help', () => {
        const output = execSync(`node ${spectralPlusPath} --help`, {
            encoding: 'utf-8'
        });

        expect(output).toContain('--csv');
        expect(output).toContain('Output CSV format');
        expect(output).toContain('false');
    });

    it('should display help with -h short flag', () => {
        const output = execSync(`node ${spectralPlusPath} -h`, {
            encoding: 'utf-8'
        });

        expect(output).toContain('Options:');
        expect(output).toContain('-h, --help');
    });

    it('should show all 7 custom options plus help option', () => {
        const output = execSync(`node ${spectralPlusPath} --help`, {
            encoding: 'utf-8'
        });

        const optionCount = (output.match(/--\w+/g) || []).length;
        expect(optionCount).toBeGreaterThanOrEqual(8);
    });

    it('should format help output properly with descriptions and defaults', () => {
        const output = execSync(`node ${spectralPlusPath} --help`, {
            encoding: 'utf-8'
        });

        const lines = output.split('\n');
        const optionLines = lines.filter(line => line.trim().startsWith('--'));

        expect(optionLines.length).toBeGreaterThanOrEqual(7);

        optionLines.forEach(line => {
            const hasDescription = line.includes('Path to') ||
                                  line.includes('Comma-separated') ||
                                  line.includes('Silent') ||
                                  line.includes('Output') ||
                                  line.includes('display help');
            expect(hasDescription).toBe(true);
        });
    });
});

