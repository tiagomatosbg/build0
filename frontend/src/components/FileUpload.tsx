import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import {
  DocumentIcon,
  DocumentTextIcon,
  DocumentArrowUpIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

interface FileUploadProps {
  onChange: (file: File) => void;
  currentFile?: File | null;
  accept?: string;
  maxSize?: number;
  showIcon?: boolean;
  label?: string;
  progress?: number;
  required?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onChange,
  currentFile,
  accept = '*',
  maxSize = 5 * 1024 * 1024, // 5MB default
  showIcon = true,
  label = 'Arraste um arquivo ou clique para selecionar',
  progress = 0,
  required = false,
}) => {
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      setError(null);
      const file = acceptedFiles[0];

      if (!file) {
        setError('Nenhum arquivo selecionado');
        return;
      }

      if (file.size > maxSize) {
        setError(`Arquivo muito grande. Tamanho máximo: ${maxSize / 1024 / 1024}MB`);
        return;
      }

      onChange(file);
    },
    [maxSize, onChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: accept.split(',').reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    maxSize,
    multiple: false,
  });

  const removeFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null as any);
    setError(null);
  };

  const getFileIcon = () => {
    if (!currentFile) return null;

    const extension = currentFile.name.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return <DocumentIcon className="w-8 h-8 text-red-500" />;
      case 'doc':
      case 'docx':
        return <DocumentTextIcon className="w-8 h-8 text-blue-500" />;
      default:
        return <DocumentIcon className="w-8 h-8 text-gray-500" />;
    }
  };

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
          isDragActive
            ? 'border-primary bg-primary/5'
            : error
            ? 'border-red-300 bg-red-50'
            : 'border-gray-300 hover:border-primary/50'
        }`}
      >
        <input {...getInputProps()} required={required} />
        
        <div className="flex flex-col items-center justify-center text-center">
          {showIcon && (
            <div className="mb-4">
              {currentFile ? (
                getFileIcon()
              ) : (
                <DocumentArrowUpIcon className="w-8 h-8 text-gray-400" />
              )}
            </div>
          )}

          {currentFile ? (
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-900">
                {currentFile.name}
              </span>
              <button
                type="button"
                onClick={removeFile}
                className="text-gray-400 hover:text-gray-500"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="text-sm text-gray-600">
              <p className="font-medium">{label}</p>
              <p className="mt-1">
                ou clique para selecionar um arquivo
              </p>
            </div>
          )}

          {error && (
            <p className="mt-2 text-sm text-red-600">{error}</p>
          )}
        </div>

        {progress > 0 && progress < 100 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200">
            <motion.div
              className="h-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        )}
      </div>
    </div>
  );
}; 