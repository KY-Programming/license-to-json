import { IncomingMessage } from 'http';
import * as https from 'https';

export declare type DownloadOptions = {
    url: string;
    method?: 'GET' | 'POST';
    token?: string;
    body?: unknown;
}

export class DownloadError extends Error {
    public url: string;
    public statusCode: number;
    public statusMessage: string;

    public constructor(
        response: IncomingMessage,
        public isWarning?: boolean
    ) {
        super(`${response.statusCode} - ${response.statusMessage}`);
        this.url = response.url;
        this.statusCode = response.statusCode;
        this.statusMessage = response.statusMessage;
    }
}

export class DownloadHelper {
    public static download(options: DownloadOptions): Promise<string> {
        let data = '';
        return new Promise((resolve, reject) => {
            const urlInstance = new URL(options.url);
            const requestOptions: https.RequestOptions = {
                host: urlInstance.host,
                path: urlInstance.pathname,
                headers: {
                    'user-agent': 'node.js'
                },
                method: options.method || 'GET'
            };
            if (options.token) {
                requestOptions.headers['Authorization'] = 'token ' + options.token;
            }
            const request = https.request(requestOptions, (response: IncomingMessage) => {
                response.on('data', (chunk: any) => data += chunk);
                response.on('end', () => {
                    switch (response.statusCode) {
                        case 200:
                            resolve(data);
                            break;
                        case 404:
                            reject(new DownloadError(response, true));
                            break;
                        default:
                            response.url ||= options.url;
                            reject(new DownloadError(response));
                            break;
                    }
                });
            });
            request.on('error', (error: Error) => reject(error));
            if (options.body) {
                request.write(options.body);
            }
            request.end();
        });
    }

    public static downloadJson<T>(options: DownloadOptions): Promise<T> {
        return this.download(options).then(response => JSON.parse(response));
    };
}
