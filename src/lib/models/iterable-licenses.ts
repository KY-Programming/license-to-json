import { Licenses } from './licenses';
import { IterablePackage } from './iterable-package';

export class IterableLicenses extends Array<IterablePackage> {
    public constructor(licenses: Licenses) {
        super();
        this.push(...Object.keys(licenses).map(packageName => new IterablePackage(packageName, licenses[packageName])));
    }
}

