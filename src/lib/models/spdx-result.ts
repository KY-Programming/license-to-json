import { SpdxLicense } from './spdx-license';

export interface SpdxResult {
    licenseListVersion: string;
    licenses: SpdxLicense[];
}
