import { Parameter, Result } from '../models';
import * as pathInstance from 'path';

export class PathHelper {
    public static fix(path: string): string {
        return path.replace(/[\\\/]+$/, '');
    }

    public static ensurePostfix(path: string, postfix: string): string {
        const fixedPath = this.fix(path);
        if (fixedPath.endsWith(postfix)) {
            return path;
        }
        return pathInstance.join(fixedPath, postfix);
    }

    public static getPackagePath(packageOrResult: string | Result, parameters: Parameter): string {
        return pathInstance.join(parameters.nodeModulesPath, typeof packageOrResult === 'string' ? packageOrResult : packageOrResult.package);
    }
}
