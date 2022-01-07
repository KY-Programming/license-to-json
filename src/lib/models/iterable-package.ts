import { ResultLicense } from './result-license';

export class IterablePackage {
    public readonly name: string;

    public constructor(
        name: string,
        public readonly licenses: ResultLicense[]
    ) {
        this.name = name;
    }
}
