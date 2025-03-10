
import { useState, useCallback, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Upload, File, X, Table, FileCheck, FileWarning, FileSpreadsheet, FileJson, FileBarChart2 } from 'lucide-react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

interface FileUploadAreaProps {
  onFilesUploaded?: (files: UploadedFile[]) => void;
  allowedFileTypes?: string[];
  maxFileSize?: number; // in MB
  multiple?: boolean;
}

export interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  data: any;
  preview?: any;
}

const FileUploadArea = ({
  onFilesUploaded,
  allowedFileTypes = ['.csv', '.xlsx', '.xls', '.json'],
  maxFileSize = 10, // 10MB default
  multiple = true
}: FileUploadAreaProps) => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activePreviewFile, setActivePreviewFile] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('csv')) return <FileBarChart2 className="h-5 w-5 text-green-500" />;
    if (fileType.includes('sheet') || fileType.includes('excel') || fileType.endsWith('xls')) 
      return <FileSpreadsheet className="h-5 w-5 text-blue-500" />;
    if (fileType.includes('json')) return <FileJson className="h-5 w-5 text-amber-500" />;
    return <File className="h-5 w-5 text-gray-500" />;
  };

  const isFileTypeAllowed = (fileType: string): boolean => {
    const extension = fileType.split('.').pop()?.toLowerCase();
    return allowedFileTypes.some(type => 
      type.toLowerCase().includes(extension || '')
    );
  };

  const parseCSV = (file: File): Promise<any> => {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => resolve(results.data),
        error: (err) => reject(err)
      });
    });
  };

  const parseExcel = async (file: File): Promise<any> => {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    return XLSX.utils.sheet_to_json(worksheet);
  };

  const parseJSON = async (file: File): Promise<any> => {
    const text = await file.text();
    return JSON.parse(text);
  };

  const processFiles = async (files: FileList) => {
    if (!files.length) return;
    
    setIsProcessing(true);
    const newFiles: UploadedFile[] = [];
    const failedFiles: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Check file type
      if (!isFileTypeAllowed(file.name)) {
        failedFiles.push(`${file.name} (unsupported file type)`);
        continue;
      }
      
      // Check file size
      if (file.size > maxFileSize * 1024 * 1024) {
        failedFiles.push(`${file.name} (exceeds ${maxFileSize}MB size limit)`);
        continue;
      }

      try {
        let parsedData;
        
        if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
          parsedData = await parseCSV(file);
        } else if (file.type.includes('sheet') || file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
          parsedData = await parseExcel(file);
        } else if (file.type === 'application/json' || file.name.endsWith('.json')) {
          parsedData = await parseJSON(file);
        } else {
          // Unsupported file type - should be caught by isFileTypeAllowed but just in case
          failedFiles.push(`${file.name} (parsing error)`);
          continue;
        }
        
        newFiles.push({
          id: `file-${Date.now()}-${i}`,
          name: file.name,
          type: file.type,
          size: file.size,
          data: parsedData,
          preview: Array.isArray(parsedData) ? parsedData.slice(0, 5) : parsedData
        });
        
      } catch (error) {
        console.error(`Error processing file ${file.name}:`, error);
        failedFiles.push(`${file.name} (processing error)`);
      }
    }

    if (newFiles.length > 0) {
      const updatedFiles = multiple ? [...uploadedFiles, ...newFiles] : newFiles;
      setUploadedFiles(updatedFiles);
      if (onFilesUploaded) {
        onFilesUploaded(updatedFiles);
      }
      toast({
        title: "Files Uploaded Successfully",
        description: `${newFiles.length} file(s) have been processed and are ready for use.`
      });
    }
    
    if (failedFiles.length > 0) {
      toast({
        title: "Some Files Failed to Upload",
        description: failedFiles.join(', '),
        variant: "destructive"
      });
    }
    
    setIsProcessing(false);
  };

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    processFiles(files);
  }, [processFiles]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  const handleBrowseClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleRemoveFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
    if (activePreviewFile === fileId) {
      setActivePreviewFile(null);
    }
    toast({
      title: "File Removed",
      description: "The file has been removed from your uploads."
    });
  };

  const toggleFilePreview = (fileId: string) => {
    setActivePreviewFile(prev => prev === fileId ? null : fileId);
  };

  const renderDataPreview = (file: UploadedFile) => {
    if (!file.preview || !Array.isArray(file.preview)) {
      return (
        <div className="p-4 bg-gray-50 rounded-md">
          <p className="text-sm text-gray-500">Preview not available for this file type</p>
        </div>
      );
    }
    
    // For array data like CSV or Excel
    const columns = file.preview.length > 0 ? Object.keys(file.preview[0]) : [];
    
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column, idx) => (
                <th 
                  key={idx}
                  className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {file.preview.map((row, rowIdx) => (
              <tr key={rowIdx} className={rowIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                {columns.map((column, colIdx) => (
                  <td key={colIdx} className="px-3 py-2 text-xs text-gray-500">
                    {row[column] !== undefined && row[column] !== null ? String(row[column]) : ''}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="space-y-4">
      <div 
        className={`border-2 border-dashed rounded-lg p-6 transition-all duration-200 ${
          isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-indigo-300'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="p-3 bg-indigo-50 rounded-full">
            <Upload className="h-8 w-8 text-indigo-500" />
          </div>
          <h3 className="text-lg font-medium">Upload Data Files</h3>
          <p className="text-sm text-center text-gray-500 max-w-md">
            Drag and drop your data files here, or click to browse.
            <br />
            Supports {allowedFileTypes.join(', ')} files up to {maxFileSize}MB.
          </p>
          <Button 
            onClick={handleBrowseClick} 
            variant="outline"
            className="mt-2"
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-gray-300 border-t-indigo-500 animate-spin mr-2"></div>
                Processing...
              </>
            ) : (
              <>Browse Files</>
            )}
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileChange}
            accept={allowedFileTypes.join(',')}
            multiple={multiple}
            disabled={isProcessing}
          />
        </div>
      </div>

      {uploadedFiles.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium flex items-center">
            <Table className="h-5 w-5 mr-2 text-indigo-600" />
            Uploaded Files ({uploadedFiles.length})
          </h3>
          <div className="space-y-3">
            {uploadedFiles.map(file => (
              <div key={file.id} className="border rounded-md overflow-hidden">
                <div className="flex items-center justify-between p-3 bg-gray-50">
                  <div className="flex items-center space-x-3">
                    {getFileIcon(file.type)}
                    <div>
                      <h4 className="text-sm font-medium">{file.name}</h4>
                      <p className="text-xs text-gray-500">{formatFileSize(file.size)} • {Array.isArray(file.data) ? `${file.data.length} rows` : 'JSON data'}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => toggleFilePreview(file.id)}
                      className="text-gray-500 hover:text-indigo-600"
                    >
                      {activePreviewFile === file.id ? 'Hide Preview' : 'Preview'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveFile(file.id)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {activePreviewFile === file.id && (
                  <div className="border-t p-3 max-h-80 overflow-auto">
                    {renderDataPreview(file)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploadArea;
