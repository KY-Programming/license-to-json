import { Adapter, PackageLockJson, Parameter, Result, ResultLicense, TextSource } from './models';
import { AutoDetectAdapter, FileAdapter, GithubAdapter, PackageAdapter } from './adapters';
import { SpdxAdapter } from './adapters/spdx-adapter';
import * as fs from 'fs';
import { CleanupAdapter } from './adapters/cleanup.adapter';
import { Licenses } from './models/licenses';

export class Core {
    private readonly parameters: Parameter;
    private readonly adapters: Adapter[] = [];
    private readonly results: Record<string, Result> = {};

    public constructor(parameters: string[]) {
        this.parameters = new Parameter(parameters);
        this.adapters.push(new PackageAdapter(this.parameters));
        this.adapters.push(new FileAdapter(this.parameters));
        this.adapters.push(new AutoDetectAdapter(this.parameters));
        this.adapters.push(new GithubAdapter(this.parameters));
        this.adapters.push(new SpdxAdapter(this.parameters));
        this.adapters.push(new CleanupAdapter(this.parameters));
    }

    public async run(): Promise<void> {
        if (this.parameters.raw.length) {
            console.log(`Read licenses with parameters: ${this.parameters.raw}...`);
        } else {
            console.log('Read licenses...');
        }
        this.readLicenses();
        this.readNodeModules();
        let successful = true;
        const dependencies = this.readDependencies();
        for (const dependency of dependencies) {
            const result: Result = this.results[dependency] ?? { package: dependency, licenses: [] };
            this.results[dependency] = result;
            for (const adapter of this.adapters) {
                successful &&= await adapter.execute(result);
            }
            if (successful) {
                if (result.licenses.length === 0) {
                    console.log(`Found dependency '${dependency}' without license.`);
                } else if (result.licenses.length === 1) {
                    const textSource = result.licenses[0].textSource === TextSource.package ? ' from package'
                        : result.licenses[0].textSource === TextSource.repository ? ' from repository'
                            : result.licenses[0].textSource === TextSource.spdx ? ' from SPDX' : '';
                    console.log(`Found dependency '${dependency}' with license '${result.licenses[0].type}'${textSource}.`);
                } else {
                    console.log(`Found dependency '${dependency}' with ${result.licenses.length} licenses.`);
                }
            }
        }
        this.writeLicenses();
        if (!successful) {
            throw new Error('At least one package could not be found!');
        }
    }

    private readNodeModules(): /*string[]*/void {
        if (!fs.existsSync(this.parameters.nodeModulesPath)) {
            throw new Error(`"${this.parameters.nodeModulesPath}" not exists. Remove the "path" option for auto detection or specify path to "node_modules" folder like: '-node-modules="./dummy/node_modules"`);
        }
        // const directories = fs.readdirSync(this.parameters.nodeModulesPath);
        // console.log('found directories', directories);
        // return directories;
    }

    private readDependencies(): string[] {
        if (!fs.existsSync(this.parameters.packageLockPath)) {
            throw new Error(`"${this.parameters.packageLockPath}" not exists. Remove the "path" option for auto detection or specify path to "package-lock.json" file like: '-package-lock="./dummy/package-lock.json"`);
        }
        const dependencies: string[] = [];
        const packageLock: PackageLockJson = JSON.parse(fs.readFileSync(this.parameters.packageLockPath, { encoding: 'utf-8' }));
        for (const dependencyName in packageLock.dependencies) {
            const dependency = packageLock.dependencies[dependencyName];
            if (dependency.dev) {
                continue;
            }
            dependencies.push(dependencyName);
        }
        return dependencies;
    }

    private readLicenses(): void {
        if (!fs.existsSync(this.parameters.output) || !this.parameters.useCache) {
            return;
        }
        console.log('Read cached licenses...');
        console.info('HINT: To disable loading cache licenses use \'-no-cache\'.');
        try {
            const packages: Licenses = JSON.parse(fs.readFileSync(this.parameters.output, 'utf-8'));
            for (let packageName in packages) {
                this.results[packageName] = {
                    package: packageName,
                    licenses: packages[packageName]
                };
            }
        }
        catch (error) {
            console.error(`Could not parse json from '${this.parameters.output}'. It looks like the json is invalid. Try to delete the file or use '-no-cache' parameter.`);
            throw error;
        }
    }

    private writeLicenses(): void {
        console.log('write licenses to disc...');
        const output: Licenses = {};
        for (const packageName in this.results) {
            const result = this.results[packageName];
            output[result.package] = result.licenses;
        }
        fs.writeFileSync(this.parameters.output, JSON.stringify(output, undefined, 2));
        console.log('DONE');
    }
}
