import { Adapter, GithubResponse, Parameter, Result, TextSource } from '../models';
import { DownloadError, DownloadHelper } from '../helpers/download-helper';
import { GithubFile } from '../models/github-file';

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
            const url = result.info.repository.url.replace(/(^git\+|\.git$)/g, '');
            console.log(`try to download license for ${result.package} from github: ${url}`);
            license.text = await this.downloadLicenseGithub(url, result);
            if (license.text) {
                license.textSource = TextSource.repository;
            }
            // .catch(() => mapping.packages[license.package] = {url: todoPlaceholder, "not-found-repository": url, ...mapped})
        }
        return success;
    }

    private downloadLicenseGithub(url: string, result: Result): Promise<string | undefined> {
        const treeUrl = url.replace('github.com/', 'api.github.com/repos/') + '/git/trees/master';
        console.log(`Search license for '${result.package}' on github: '${treeUrl}'`);
        return DownloadHelper.downloadJson<GithubResponse>({ url: treeUrl, token: this.parameters.authToken }).then(response => {
            const files = response.tree.filter(x => x.type === 'blob' && x.path.toLowerCase().startsWith('license'));
            if (files.length === 0) {
                return;
            }
            console.log('File found. Download content from github: ' + files[0].url);
            return DownloadHelper.downloadJson<GithubFile>({ url: files[0].url, token: this.parameters.authToken }).then(licenseFile => {
                console.log(`license for ${result.package} found on github`);
                return Buffer.from(licenseFile.content, licenseFile.encoding).toString();
            });
        }).catch((error: DownloadError) => {
            if (error.statusCode === 401) {
                console.error(`You are not allowed to access '${result.package}' github repository. Maybe the repository is private or your auth-token is invalid. Github responded with: ${error.message}`);
                return;
            }
            if (error.statusCode === 403 && error.statusMessage.includes('rate limit exceeded')) {
                console.error('Reached githubs request per hour limit. Wait a bit or try to specify a github auth token \'-auth-token=<token-code>\'');
                return;
            }
            const message = `Could not load license for ${result.package}. Can not find repository (error: ${error.message}).`;
            error.isWarning ? console.warn(message) : console.error(message);
            throw error;
        });
    }

}
