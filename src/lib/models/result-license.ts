import { TextSource } from './text-source';

export interface ResultLicense {
    type: string;
    url?: string;
    text?: string;
    textSource?: TextSource;
}

