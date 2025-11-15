export enum AppStatus {
    IDLE = 'IDLE',
    LOADING = 'LOADING',
    SUCCESS = 'SUCCESS',
    ERROR = 'ERROR'
}

export enum VerificationStatus {
    VERIFIED = 'VERIFIED',
    AUTHENTIC = 'AUTHENTIC',
    SUSPICIOUS = 'SUSPICIOUS',
    NOT_FOUND = 'NOT_FOUND',
    UNABLE_TO_VERIFY = 'UNABLE_TO_VERIFY'
}

export enum OverallAssessmentStatus {
    AUTHENTIC = 'AUTHENTIC',
    POTENTIALLY_COUNTERFEIT = 'POTENTIALLY_COUNTERFEIT',
    INCONCLUSIVE = 'INCONCLUSIVE'
}

export interface VerificationDetail {
    status: VerificationStatus;
    notes: string;
}

export interface InvimaRegistration extends VerificationDetail {
    number: string;
}

export interface Barcode extends VerificationDetail {
    number: string;
}

export interface VisualAuthenticity {
    colors: VerificationDetail;
    typography: VerificationDetail;
    printQuality: VerificationDetail;
}

export interface VerificationReport {
    invimaRegistration: InvimaRegistration;
    barcode: Barcode;
    visualAuthenticity: VisualAuthenticity;
    overallAssessment: {
        status: OverallAssessmentStatus;
        summary: string;
    };
}

export interface GroundingSource {
    web: {
        uri: string;
        title: string;
    };
}