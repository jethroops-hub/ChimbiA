import React from 'react';
import CameraIcon from './CameraIcon';

interface InitialScreenProps {
  onFileSelect: (file: File) => void;
  onVerificationStart: () => void;
  imagePreviewUrls: string[];
  onRemoveFile: (index: number) => void;
}

const InitialScreen: React.FC<InitialScreenProps> = ({ 
  onFileSelect, 
  onVerificationStart, 
  imagePreviewUrls,
  onRemoveFile 
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleAddPhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
    event.target.value = '';
  };

  return (
    <div className="flex flex-col items-center justify-center text-center p-8 max-w-2xl mx-auto">
      <div className="mb-6">
        <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center border-4 border-green-500/20">
          <svg className="w-12 h-12 text-green-400" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M14 4h-4v6H4v4h6v6h4v-6h6v-4h-6V4z" />
          </svg>
        </div>
      </div>
      <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
        ChimbiApp
      </h1>
      <p className="text-lg text-slate-400 max-w-xl mx-auto mb-10">
        Toma varias fotos del empaque de tu medicamento (frente, reverso, lados) para una verificación completa.
      </p>

      {imagePreviewUrls.length > 0 && (
        <div className="w-full bg-slate-800/50 p-4 rounded-lg mb-6 border border-slate-700">
          <h3 className="text-left text-lg font-bold text-white mb-4">Fotos Capturadas</h3>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
            {imagePreviewUrls.map((url, index) => (
              <div key={index} className="relative group aspect-square">
                <img
                  src={url}
                  alt={`preview ${index + 1}`}
                  className="w-full h-full object-cover rounded-md"
                />
                 <button
                  onClick={() => onRemoveFile(index)}
                  className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100"
                  aria-label={`Remover imagen ${index + 1}`}
                >
                  <span className="text-xl font-bold leading-none">&times;</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <button
          onClick={handleAddPhotoClick}
          className="group relative inline-flex items-center justify-center px-6 py-3 text-lg font-bold text-white bg-slate-700 rounded-full hover:bg-slate-600 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-slate-500/50"
        >
          <CameraIcon className="w-6 h-6 mr-3" />
          Añadir Foto
        </button>
        
        <button
          onClick={onVerificationStart}
          disabled={imagePreviewUrls.length === 0}
          className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-green-600 rounded-full hover:bg-green-500 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-green-500/50 shadow-lg shadow-green-900/40 disabled:bg-slate-600 disabled:shadow-none disabled:cursor-not-allowed"
        >
          Verificar Empaque
        </button>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*"
        capture="environment"
      />
    </div>
  );
};

export default InitialScreen;