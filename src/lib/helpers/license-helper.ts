import { ResultLicense, PackageLicense, Parameter } from '../models';

export const toLicense = (packageName: string, parameters: Parameter, typeOrPackageLicense?: string | PackageLicense): ResultLicense => {
    const license: ResultLicense = {
        type: parameters.unlicense
    };
    if (typeof typeOrPackageLicense === 'string') {
        license.type = typeOrPackageLicense;
    } else {
        license.type = typeOrPackageLicense?.type ?? parameters.unlicense;
        license.url = typeOrPackageLicense?.url;
    }
    return license;
}
