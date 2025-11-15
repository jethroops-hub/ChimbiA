import React from 'react';

interface ApiKeyPromptProps {
    onSelectApiKey: () => void;
}

const ApiKeyPrompt: React.FC<ApiKeyPromptProps> = ({ onSelectApiKey }) => {
    return (
        <div className="flex flex-col items-center justify-center text-center p-8 max-w-2xl mx-auto">
            <div className="mb-6">
                <div className="w-24 h-24 bg-yellow-500/10 rounded-full flex items-center justify-center border-4 border-yellow-500/20">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H5v-2H3v-2H1v-4a6 6 0 016-6h4a6 6 0 016 6z" />
                    </svg>
                </div>
            </div>
            <h1 className="text-4xl font-extrabold text-white mb-4">Se requiere una Clave de API</h1>
            <p className="text-lg text-slate-400 max-w-xl mx-auto mb-8">
                Para usar esta aplicación, por favor selecciona una clave de API de Gemini. El uso de la API puede incurrir en costos.
            </p>
            <button
                onClick={onSelectApiKey}
                className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-green-600 rounded-full hover:bg-green-500 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-green-500/50 shadow-lg shadow-green-900/40"
            >
                Seleccionar Clave de API
            </button>
            <p className="text-sm text-slate-500 mt-4">
                Para más información sobre los precios, consulta la{' '}
                <a 
                    href="https://ai.google.dev/gemini-api/docs/billing" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-green-400 hover:underline"
                >
                    documentación de facturación
                </a>.
            </p>
        </div>
    );
};

export default ApiKeyPrompt;
