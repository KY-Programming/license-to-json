import { PackageLockDependency } from './package-lock-dependency';

export interface PackageLockJson {
    name: string,
    version: string,
    lockfileVersion: number,
    requires: boolean,
    dependencies: Record<string, PackageLockDependency>
}

