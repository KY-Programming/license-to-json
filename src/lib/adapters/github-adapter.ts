import { Adapter, GithubTreeResult, Parameter, Result, TextSource } from '../models';
import { DownloadError, DownloadHelper } from '../helpers/download-helper';
import { GithubFile } from '../models/github-file';
import { GithubRepository } from '../models/github-repository';

declare const Buffer: any;

export class GithubAdapter implements Adapter {
    private first = true;

    public constructor(
        private readonly parameters: Parameter
    ) {
    }

    public async execute(result: Result): Promise<boolean> {
        if (!this.parameters.useRepository || result.licenses.length !== 1) {
            return true;
        }
        let success = true;
        for (const license of result.licenses) {
            if (!result.info?.repository?.type || license.text) {
                continue;
            }
            if (result.info?.repository?.type !== 'git' || !result.info.repository.url.includes('github.com')) {
                console.warn(`Could not check repository for license. ${result.info?.repository?.type} is currently not supported. We currently support only github`);
                continue;
            }
            // success &&= this.readGithub(license);
            if (this.first) {
                this.first = false;
                console.info('HINT: To disable searching for licenses on github.com use \'-no-repository\'.');
            }
            const repository = await this.getRepository(result);
            if (!repository) {
                return false;
            }
            license.text = await this.findLicenseFiles(repository, result);
            if (license.text) {
                license.textSource = TextSource.repository;
            }
        }
        return success;
    }

    private extractRepositoryName(result: Result): string | undefined {
        if (!result?.info?.repository?.url) {
            return undefined;
        }
        const match = /^(git\+)?(https|git):\/\/github\.com\/(?<name>.+)$/i.exec(result.info.repository.url);
        return match?.groups?.['name']?.replace(/\.git$/, '');
    }

    private async getRepository(result: Result): Promise<GithubRepository | undefined> {
        try {
            const repositoryName = this.extractRepositoryName(result);
            if (!repositoryName) {
                console.error(`Can not parse repository url '${result?.info?.repository}'. Please contact support@ky-programming.de`);
                return undefined;
            }
            const url = `https://api.github.com/repos/${repositoryName}`;
            return await this.downloadJson<GithubRepository>(url, result);
        }
        catch (rawError) {
            const error = rawError as DownloadError;
            const message = `Could not find repository for ${result.package}. Error: ${error.message}).`;
            error.isWarning ? console.warn(message) : console.error(message);
            return undefined;
        }
    }

    private async findLicenseFiles(repository: GithubRepository, result: Result): Promise<string | undefined> {
        try {
            const url = repository.trees_url.replace('{/sha}', '/' + repository.default_branch);
            console.log(`Search license for '${result.package}' on github: '${url}'`);
            const treeResult = await this.downloadJson<GithubTreeResult>(url, result);
            const files = treeResult?.tree.filter(x => x.type === 'blob' && x.path.toLowerCase().startsWith('license'));
            if (!files?.length) {
                return undefined;
            }
            console.log('File found. Download content from github: ' + files[0].url);
            const file = await this.downloadJson<GithubFile>(files[0].url, result);
            if (!file) {
                return undefined;
            }
            console.log(`license for ${result.package} found on github`);
            return Buffer.from(file.content, file.encoding).toString();
        }
        catch (rawError) {
            const error = rawError as DownloadError;
            const message = `Could not load license for ${result.package}. Can not find repository (error: ${error.message}).`;
            error.isWarning ? console.warn(message) : console.error(message);
            throw error;
        }
    }

    private async downloadJson<T>(url: string, result: Result): Promise<T | undefined> {
        try {
            return await DownloadHelper.downloadJson<T>({ url, token: this.parameters.authToken });
        }
        catch (raw) {
            const error = raw as DownloadError;
            if (error.statusCode === 401) {
                console.error(`You are not allowed to access '${result.package}' github repository. Maybe the repository is private or your auth-token is invalid. Github responded with: ${error.message}`);
                return undefined;
            }
            if (error.statusCode === 403 && error.statusMessage.includes('rate limit exceeded')) {
                console.error('Reached githubs request per hour limit. Wait a bit or try to specify a github auth token \'-auth-token=<token-code>\'');
                return undefined;
            }
            throw error;
        }
    }

}
