export interface PackageLockDependency {
    version: string,
    resolved: string,
    integrity: string,
    dev: boolean,
    requires: Record<string, string>
}
