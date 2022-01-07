import { Adapter, Parameter, Result, TextSource } from '../models';
import { SpdxLicense } from '../models/spdx-license';
import { DownloadHelper } from '../helpers/download-helper';
import { SpdxResult } from '../models/spdx-result';
import { SpdxDetails } from '../models/spdx-details';

export class SpdxAdapter implements Adapter {
    private first = true;
    private cache: Promise<SpdxResult> | undefined;

    public constructor(
        private readonly parameters: Parameter
    ) {
    }

    public async execute(result: Result): Promise<boolean> {
        if (!this.parameters.useSpdx || result.licenses.every(x => x.text)) {
            return true;
        }
        const list = await this.getList();
        for (const license of result.licenses) {
            if (license.text) {
                continue;
            }
            const spdxLicense = list.find(entry => entry.licenseId.toLocaleLowerCase() === license.type.toLocaleLowerCase());
            if (spdxLicense) {
                license.text = await this.getText(spdxLicense);
                license.textSource = TextSource.spdx;
            }
        }
        if (this.first) {
            this.first = false;
            console.info('HINT: To disable common licenses information from SPDX use \'-no-spdx\'.');
        }
        return true;
    }

    private async getList(): Promise<SpdxLicense[]> {
        if (!this.cache) {
            console.log('Download license information from SPDX (github.com)...');
            this.cache = DownloadHelper.downloadJson<SpdxResult>({ url: 'https://raw.githubusercontent.com/spdx/license-list-data/master/json/licenses.json' });
        }
        return (await this.cache).licenses;
    }

    private async getText(license: SpdxLicense): Promise<string> {
        if (license.text) {
            return license.text;
        }
        const details = await DownloadHelper.downloadJson<SpdxDetails>({ url: `https://raw.githubusercontent.com/spdx/license-list-data/master/json/details/${license.licenseId}.json` });
        license.title = details.name;
        license.text = details.licenseText;
        return license.text;
    }
}
