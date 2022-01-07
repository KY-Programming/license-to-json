import { Result } from './result';

export interface Adapter {
    execute(result: Result): Promise<boolean>;
}
