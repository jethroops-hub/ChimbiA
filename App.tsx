import React, { useState, useCallback, useEffect } from 'react';
import { AppStatus, VerificationReport, GroundingSource } from './types';
import { verifyMedicinePackage } from './services/geminiService';
import InitialScreen from './components/InitialScreen';
import Spinner from './components/Spinner';
import ResultDisplay from './components/ResultDisplay';

const App: React.FC = () => {
    const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
    const [report, setReport] = useState<VerificationReport | null>(null);
    const [sources, setSources] = useState<GroundingSource[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
    
    const loadingMessages = [
        "Analizando imágenes con IA...",
        "Extrayendo texto y códigos de todas las fotos...",
        "Consultando registro INVIMA en tiempo real...",
        "Verificando código de barras en bases de datos...",
        "Comparando empaque con droguerías online...",
        "Compilando informe final...",
    ];
    const [loadingMessage, setLoadingMessage] = useState(loadingMessages[0]);

    const addFile = useCallback((file: File) => {
        setSelectedFiles(prevFiles => [...prevFiles, file]);
        const previewUrl = URL.createObjectURL(file);
        setImagePreviewUrls(prevUrls => [...prevUrls, previewUrl]);
    }, []);

    const removeFile = useCallback((indexToRemove: number) => {
        const urlToRemove = imagePreviewUrls[indexToRemove];
        URL.revokeObjectURL(urlToRemove);

        setImagePreviewUrls(prevUrls => prevUrls.filter((_, index) => index !== indexToRemove));
        setSelectedFiles(prevFiles => prevFiles.filter((_, index) => index !== indexToRemove));
    }, [imagePreviewUrls]);

    const handleVerificationStart = useCallback(async () => {
        if (selectedFiles.length === 0) return;

        setStatus(AppStatus.LOADING);
        setError(null);
        setReport(null);
        setSources([]);

        let messageIndex = 0;
        const intervalId = setInterval(() => {
            messageIndex = (messageIndex + 1) % loadingMessages.length;
            setLoadingMessage(loadingMessages[messageIndex]);
        }, 2500);

        try {
            const { report: result, sources: groundingSources } = await verifyMedicinePackage(selectedFiles);
            setReport(result);
            setSources(groundingSources);
            setStatus(AppStatus.SUCCESS);
        } catch (err) {
            setError('Ocurrió un error al verificar el empaque. Por favor, intenta de nuevo con fotos más claras y de todos los lados del empaque. Asegúrate de tener una buena conexión a internet.');
            setStatus(AppStatus.ERROR);
        } finally {
            clearInterval(intervalId);
        }
    }, [selectedFiles, loadingMessages]);

    const handleReset = () => {
        setStatus(AppStatus.IDLE);
        setReport(null);
        setError(null);
        setSources([]);
        
        imagePreviewUrls.forEach(url => URL.revokeObjectURL(url));
        setImagePreviewUrls([]);
        setSelectedFiles([]);
    };

    // Cleanup object URLs on unmount
    useEffect(() => {
        return () => {
            imagePreviewUrls.forEach(url => URL.revokeObjectURL(url));
        };
    }, [imagePreviewUrls]);


    const renderContent = () => {
        switch (status) {
            case AppStatus.LOADING:
                return (
                    <div className="flex flex-col items-center justify-center text-center p-8">
                        <Spinner className="w-16 h-16 text-green-400 animate-spin mb-6" />
                        <h2 className="text-2xl font-bold text-white mb-2">Procesando...</h2>
                        <p className="text-slate-400 transition-opacity duration-500">{loadingMessage}</p>
                    </div>
                );
            case AppStatus.SUCCESS:
                return <ResultDisplay report={report} imagePreviewUrls={imagePreviewUrls} onReset={handleReset} sources={sources} />;
            case AppStatus.ERROR:
                return (
                    <div className="flex flex-col items-center justify-center text-center p-8 text-white">
                        <div className="w-16 h-16 flex items-center justify-center bg-red-500/10 rounded-full mb-4 border-2 border-red-500/20">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <h2 className="text-2xl font-bold text-red-400 mb-2">Error</h2>
                        <p className="text-slate-400 max-w-md mb-6">{error}</p>
                        <button onClick={handleReset} className="px-6 py-2 bg-slate-600 rounded-full hover:bg-slate-500 transition-colors">Intentar de Nuevo</button>
                    </div>
                );
            case AppStatus.IDLE:
            default:
                return <InitialScreen 
                           onFileSelect={addFile}
                           onRemoveFile={removeFile}
                           onVerificationStart={handleVerificationStart}
                           imagePreviewUrls={imagePreviewUrls}
                       />;
        }
    };

    return (
        <main className="bg-slate-900 min-h-screen text-white flex flex-col items-center justify-center transition-all duration-500">
             <div className="absolute top-0 left-0 w-full h-full bg-grid-slate-800/40 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
            <div className="relative z-10 w-full">
                {renderContent()}
            </div>
            <footer className="absolute bottom-4 text-center text-slate-500 text-xs w-full px-4">
              <p>Higiene Ocupacional</p>
              <p>Programa de Gestión Integral de Riesgo Químico 2025</p>
            </footer>
        </main>
    );
};

export default App;