import React from 'react';
import { VerificationReport, OverallAssessmentStatus, VerificationStatus, GroundingSource } from '../types';
import ReportCard from './ReportCard';

interface ResultDisplayProps {
    report: VerificationReport | null;
    imagePreviewUrls: string[];
    onReset: () => void;
    sources?: GroundingSource[];
}

const CheckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>;
const WarningIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>;
const QuestionIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.546-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;

const getOverallStyles = (status: OverallAssessmentStatus) => {
    switch (status) {
        case OverallAssessmentStatus.AUTHENTIC:
            return { bg: 'bg-green-500/20', text: 'text-green-300', border: 'border-green-500/30', icon: <CheckIcon /> };
        case OverallAssessmentStatus.POTENTIALLY_COUNTERFEIT:
            return { bg: 'bg-red-500/20', text: 'text-red-300', border: 'border-red-500/30', icon: <WarningIcon /> };
        case OverallAssessmentStatus.INCONCLUSIVE:
        default:
            return { bg: 'bg-yellow-500/20', text: 'text-yellow-300', border: 'border-yellow-500/30', icon: <QuestionIcon /> };
    }
};

const getIconForStatus = (status: VerificationStatus) => {
    switch (status) {
        case VerificationStatus.VERIFIED:
        case VerificationStatus.AUTHENTIC:
            return <CheckIcon />;
        case VerificationStatus.SUSPICIOUS:
            return <WarningIcon />;
        case VerificationStatus.NOT_FOUND:
        case VerificationStatus.UNABLE_TO_VERIFY:
            return <QuestionIcon />;
        default:
            return <QuestionIcon />;
    }
};


const ResultDisplay: React.FC<ResultDisplayProps> = ({ report, imagePreviewUrls, onReset, sources }) => {
    if (!report) return null;

    const { invimaRegistration, barcode, visualAuthenticity, overallAssessment } = report;
    const overallStyles = getOverallStyles(overallAssessment.status);

    return (
        <div className="w-full max-w-4xl mx-auto p-4 md:p-6 animate-fade-in">
            <h1 className="text-3xl md:text-4xl font-extrabold text-white text-center mb-6">Informe de Verificación</h1>

            <div className={`p-6 rounded-xl border mb-8 ${overallStyles.border} ${overallStyles.bg}`}>
                <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className={`w-16 h-16 rounded-full flex-shrink-0 flex items-center justify-center text-3xl ${overallStyles.bg} border-4 ${overallStyles.border} ${overallStyles.text}`}>
                        {overallStyles.icon}
                    </div>
                    <div>
                        <h2 className={`text-2xl font-bold ${overallStyles.text}`}>{overallAssessment.status.replace(/_/g, ' ')}</h2>
                        <p className="text-slate-300 mt-1">{overallAssessment.summary}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                    <h3 className="font-bold text-lg text-white mb-3">Imágenes Analizadas</h3>
                    <div className="flex overflow-x-auto space-x-2 rounded-lg bg-slate-900/50 p-2">
                        {imagePreviewUrls.map((url, index) => (
                            <img 
                                key={index}
                                src={url} 
                                alt={`Medicine package image ${index + 1}`} 
                                className="rounded-md object-cover h-48 w-auto flex-shrink-0 shadow-lg"
                            />
                        ))}
                    </div>
                </div>
                <div className="lg:col-span-2 space-y-4">
                    <ReportCard
                        title="Registro INVIMA"
                        status={invimaRegistration.status}
                        notes={invimaRegistration.notes}
                        details={`Nº: ${invimaRegistration.number || 'N/A'}`}
                        icon={getIconForStatus(invimaRegistration.status)}
                    />
                    <ReportCard
                        title="Código de Barras"
                        status={barcode.status}
                        notes={barcode.notes}
                        details={`Nº: ${barcode.number || 'N/A'}`}
                        icon={getIconForStatus(barcode.status)}
                    />
                    <details className="p-4 rounded-lg border border-slate-700 bg-slate-800/50 transition-all duration-300">
                      <summary className="font-bold text-lg text-white cursor-pointer">Análisis Visual de Autenticidad</summary>
                      <div className="mt-4 space-y-4">
                        <ReportCard title="Colores" status={visualAuthenticity.colors.status} notes={visualAuthenticity.colors.notes} icon={getIconForStatus(visualAuthenticity.colors.status)} />
                        <ReportCard title="Tipografía" status={visualAuthenticity.typography.status} notes={visualAuthenticity.typography.notes} icon={getIconForStatus(visualAuthenticity.typography.status)} />
                        <ReportCard title="Calidad de Impresión" status={visualAuthenticity.printQuality.status} notes={visualAuthenticity.printQuality.notes} icon={getIconForStatus(visualAuthenticity.printQuality.status)} />
                      </div>
                    </details>
                </div>
            </div>

            {sources && sources.length > 0 && (
                <div className="mt-8">
                    <h3 className="font-bold text-lg text-white mb-3 text-center">Fuentes de Verificación</h3>
                    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 max-h-40 overflow-y-auto">
                        <ul className="space-y-2">
                            {sources.map((source, index) => (
                                <li key={index}>
                                    <a 
                                        href={source.web.uri} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-green-400 hover:text-green-300 hover:underline text-sm truncate block"
                                        title={source.web.uri}
                                    >
                                        {source.web.title || source.web.uri}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
            
            <div className="text-center mt-10">
                <button
                    onClick={onReset}
                    className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-slate-700 rounded-full hover:bg-slate-600 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-slate-500/50"
                >
                    Escanear Otro
                </button>
            </div>
        </div>
    );
};

export default ResultDisplay;