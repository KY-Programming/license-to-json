import { PackageLicense } from './package-license';
import { PackageRepository } from './package-repository';

export interface Package {
    name: string;
    license?: string | PackageLicense;
    licenses?: PackageLicense[];
    repository?: PackageRepository;
}
