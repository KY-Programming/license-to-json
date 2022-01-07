import { Adapter, Parameter, Result, TextSource } from '../models';
import { PathHelper } from '../helpers';
import * as fs from 'fs';
import * as path from 'path';

export class FileAdapter implements Adapter {
    private readonly seeLicenseInTag = 'see license in ';

    public constructor(
        private readonly parameters: Parameter
    ) {}

    public async execute(result: Result): Promise<boolean> {
        let success = true;
        const packagePath = PathHelper.getPackagePath(result, this.parameters);
        for (const license of result.licenses) {
            if (license.type.toLocaleLowerCase().startsWith(this.seeLicenseInTag)) {
                const relativeLicenseFilePath = license.type.toLocaleLowerCase().replace(this.seeLicenseInTag, '');
                const licensePath = path.join(packagePath, relativeLicenseFilePath);
                if (!fs.existsSync(licensePath)) {
                    console.error(`Could not read license from file. '${licensePath}' not found`);
                    success = false;
                    continue;
                }
                license.text = fs.readFileSync(licensePath, { encoding: 'utf-8' });
                license.textSource = TextSource.package;
            }
        }
        return success;
    }

}
