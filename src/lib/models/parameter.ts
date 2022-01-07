import { PathHelper } from '../helpers';

export class Parameter {
    public readonly raw: string[] = [];
    public readonly list: string[] = [];
    public readonly map: Record<string, string> = {};

    public readonly useAutoDetect: boolean = true;
    public readonly useRepository: boolean = true;
    public readonly useSpdx: boolean = true;
    public readonly useCache: boolean = true;
    public readonly useCleanup: boolean = true;
    public readonly useIgnoredFiles: boolean = true;
    public readonly path: string = '.';
    public readonly packageLockPath: string = '';
    public readonly nodeModulesPath: string = '';
    public readonly unlicense: string = 'unlicense';
    public readonly output: string = '3d-party-licenses.json';
    public readonly authToken: string | undefined;

    public constructor(parameters: string[]){
        this.raw.push(...parameters);
        this.list.push(...parameters.map(parameter => parameter.replace(/^-+/, '')));

        for (const parameter of this.list) {
            const [name, ...values] = parameter.split('=');
            this.map[name.toLocaleLowerCase()] = values.join('=');
        }

        this.path = this.map['path'] ?? this.path;
        this.nodeModulesPath = PathHelper.ensurePostfix(this.map['node-modules'] ?? this.path, 'node_modules');
        this.packageLockPath = PathHelper.ensurePostfix(this.map['package-lock'] ?? this.path, 'package-lock.json');
        this.unlicense = this.map['unlicense'] ?? this.unlicense;
        this.output = this.map['output'] ?? this.output;
        this.useAutoDetect = this.map['no-auto-detect'] === undefined;
        this.useRepository = this.map['no-repository'] === undefined;
        this.useSpdx = this.map['no-spdx'] === undefined;
        this.useCache = this.map['no-cache'] === undefined;
        this.useCleanup = this.map['no-cleanup'] === undefined;
        this.useIgnoredFiles = this.map['no-ignored-files'] === undefined;
        this.authToken = this.map['auth-token'];
    }
}
