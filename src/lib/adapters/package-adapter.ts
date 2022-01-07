import { Adapter, Parameter, Result } from '../models';
import { PathHelper, toLicense } from '../helpers';
import * as fs from 'fs';
import * as path from 'path';

export class PackageAdapter implements Adapter {

    public constructor(
        private readonly parameters: Parameter
    ) {
    }

    public async execute(result: Result): Promise<boolean> {
        const packagePath = PathHelper.getPackagePath(result, this.parameters);
        const packageJsonPath = path.join(packagePath, 'package.json');
        if (!fs.existsSync(packageJsonPath)) {
            console.error(`Can not read dependency '${result.package}'. '${packageJsonPath}' not found.`);
            return false;
        }
        result.info = JSON.parse(fs.readFileSync(packageJsonPath, { encoding: 'utf-8' }));
        if (result.info?.license && result.licenses.every(x => x.type !== result.info?.license)) {
            let license: string;
            if (typeof result.info.license === 'string') {
                license = result.info.license;
            } else {
                license = result.info.license?.type ?? this.parameters.unlicense;
            }
            const chunks = license.replace(/[()]+/g, '').split(/\s(?:OR|AND)+\s/i);
            for (const chunk of chunks) {
                result.licenses.push(toLicense(result.package, this.parameters, chunk));
            }
        }
        if (result.info?.licenses?.length) {
            for (const packageLicense of result.info.licenses) {
                if (result.licenses.some(x => x.type == result.info?.license)) {
                    continue;
                }
                const license = toLicense(result.package, this.parameters, packageLicense.type);
                license.url = packageLicense.url;
                result.licenses.push(license);
            }
        }
        if (result.licenses.length === 0) {
            result.licenses.push(toLicense(result.package, this.parameters));
        }
        return true;
    }

}
