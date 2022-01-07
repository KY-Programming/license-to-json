import { ResultLicense } from './result-license';
import { Package } from './package';

export interface Result {
    package: string;
    info?: Package;
    licenses: ResultLicense[];
}
