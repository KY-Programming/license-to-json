import { Adapter, Parameter, Result, ResultLicense, TextSource } from '../models';
import * as fs from 'fs';
import { Dirent } from 'fs';
import { PathHelper, toLicense } from '../helpers';
import * as path from 'path';
import { DownloadHelper } from '../helpers/download-helper';
import { IgnoredFiles } from '../models/ignored-files';

export class AutoDetectAdapter implements Adapter {
    private first = true;
    private cache: Promise<IgnoredFiles> | undefined;

    public constructor(
        private readonly parameters: Parameter
    ) {
    }

    public async execute(result: Result): Promise<boolean> {
        if (!this.parameters.useAutoDetect || result.licenses.some(x => x.text)) {
            return true;
        }
        const ignoredFiles = await this.getIgnoredFiles(result.package);
        const packagePath = PathHelper.getPackagePath(result, this.parameters);
        const licenseFiles = (fs.readdirSync(packagePath, { withFileTypes: true }) as Dirent[])
            .filter(x => x.isFile() && x.name.toLowerCase().startsWith('license') && ignoredFiles.every(rule => !rule.exec(x.name)));
        for (let licenseFile of licenseFiles) {
            let license: ResultLicense;
            if (licenseFiles.length === 1 && result.licenses.length === 1) {
                license = result.licenses[0];
            } else {
                license = toLicense(result.package, this.parameters);
                result.licenses.push(license);
            }
            license.text = fs.readFileSync(path.join(packagePath, licenseFile.name), { encoding: 'utf-8' });
            license.textSource = TextSource.package;
            console.log(`Use ${licenseFile.name} file for ${result.package}.`);
        }
        if (this.first && licenseFiles.length > 0) {
            this.first = false;
            console.info('HINT: To disable searching for licenses in package folder use \'-no-auto-detect\'.');
        }
        return true;
    }

    private async getIgnoredFiles(packageName: string): Promise<RegExp[]> {
        const rules = await this.fetchIgnoredFiles();
        const packageRules = (rules[packageName] ?? []).concat(...(rules['*'] ?? []));
        return packageRules.map(rule => {
            if (rule.startsWith('^')) {
                const chunks = rule.split('$');
                const pattern = chunks.slice(0, -1).join('$');
                const flags = chunks.length > 1 ? chunks.slice(-1)[0] : '';
                return new RegExp(pattern, flags);
            }
            return new RegExp(rule.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'));
        });
    }

    private async fetchIgnoredFiles(): Promise<IgnoredFiles> {
        if (!this.parameters.useIgnoredFiles) {
            return {};
        }
        if (!this.cache) {
            console.log('Download ignored files KY-Programming (github.com)...');
            console.info('HINT: To disable ignored files use \'-no-ignored-files\'.');
            this.cache = DownloadHelper.downloadJson<IgnoredFiles>({ url: 'https://raw.githubusercontent.com/KY-Programming/license-to-json/main/ignored-files.json' });
        }
        return await this.cache;
    }
}
