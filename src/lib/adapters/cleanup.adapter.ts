import { Adapter, Parameter, Result, ResultLicense, TextSource } from '../models';

export class CleanupAdapter implements Adapter {
    private first = true;

    public constructor(
        private readonly parameters: Parameter
    ) {
    }

    public async execute(result: Result): Promise<boolean> {
        if (!this.parameters.useCleanup) {
            return true;
        }
        let cleanedUp = false;
        for (const license of result.licenses) {
            cleanedUp = this.cleanWrapped(license, result, cleanedUp);
        }
        cleanedUp = this.mergeSpdxAndAutoDetect(result, cleanedUp);

        if (this.first && cleanedUp) {
            this.first = false;
            console.info('HINT: To disable cleanup use \'-no-cleanup\'.');
        }
        return true;
    }

    // Check for wrapped licenses (e.g. zone.js LICENSE.wrapped)
    private cleanWrapped(license: ResultLicense, result: Result, cleanedUp: boolean): boolean {
        if (license.type === this.parameters.unlicense && license.text) {
            const trimmed = license.text.trim();
            if (trimmed.startsWith('/**') && trimmed.endsWith('*/')) {
                result.licenses.splice(result.licenses.indexOf(license), 1);
                console.log(`Cleanup removed one out commented license from '${result.package}'.`);
                return true;
            }
        }
        return cleanedUp;
    }

    private mergeSpdxAndAutoDetect(result: Result, cleanedUp: boolean): boolean {
        if (result.licenses.length !== 2) {
            return cleanedUp;
        }
        const spdxLicense = result.licenses.find(x => x.textSource === TextSource.spdx);
        const packageLicense = result.licenses.find(x => x.textSource === TextSource.package);
        if (!spdxLicense || !packageLicense) {
            return cleanedUp;
        }
        result.licenses.splice(result.licenses.indexOf(packageLicense), 1);
        spdxLicense.text = packageLicense.text;
        spdxLicense.textSource = packageLicense.textSource;
        console.log(`Cleanup merge SPDX and auto-detected license from '${result.package}'.`);
        return true;
    }
}
