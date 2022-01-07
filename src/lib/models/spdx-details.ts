export interface SpdxDetails {
    isDeprecatedLicenseId: boolean;
    isFsfLibre: boolean;
    licenseText: string;
    standardLicenseTemplate: string;
    name: string;
    licenseId: string;
    crossRef: {
        match: string;
        url: string;
        isValid: boolean;
        isLive: boolean;
        timestamp: string;
        isWayBackLink: boolean;
        order: 0
    }[];
    seeAlso: string[];
    isOsiApproved: boolean;
    licenseTextHtml: string
}
