
import { useState, useCallback, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Upload, File, X, Table, FileCheck, FileWarning, FileSpreadsheet, FileCsv, FileJson } from 'lucide-react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

interface FileUploadAreaProps {
  onFilesProcessed?: (data: any, fileType: string) => void;
  allowedFileTypes?: string[];
  maxSize?: number; // in MB
}

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  error?: string;
  previewData?: any;
}

const FileUploadArea = ({ 
  onFilesProcessed, 
  allowedFileTypes = ['.csv', '.xlsx', '.xls', '.json'], 
  maxSize = 10
}: FileUploadAreaProps) => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('csv')) return <FileCsv className="h-5 w-5 text-green-500" />;
    if (fileType.includes('sheet') || fileType.includes('excel') || fileType.endsWith('xls')) 
      return <FileSpreadsheet className="h-5 w-5 text-blue-500" />;
    if (fileType.includes('json')) return <FileJson className="h-5 w-5 text-amber-500" />;
    return <File className="h-5 w-5 text-gray-500" />;
  };

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);
  
  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const validateFile = (file: File): { valid: boolean; error?: string } => {
    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      return { valid: false, error: `File is too large. Maximum size is ${maxSize}MB.` };
    }
    
    // Check file type
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!allowedFileTypes.includes(fileExtension)) {
      return { 
        valid: false, 
        error: `Unsupported file type. Allowed types: ${allowedFileTypes.join(', ')}.` 
      };
    }
    
    return { valid: true };
  };

  const parseFile = async (file: File): Promise<any> => {
    return new Promise((resolve, reject) => {
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      
      if (fileExtension === 'csv') {
        Papa.parse(file, {
          header: true,
          complete: (results) => {
            resolve({
              data: results.data,
              headers: results.meta.fields,
              type: 'csv'
            });
          },
          error: (error) => {
            reject(error);
          }
        });
      } else if (['xlsx', 'xls'].includes(fileExtension || '')) {
        const reader = new FileReader();
        reader.onload = (e: ProgressEvent<FileReader>) => {
          try {
            const data = e.target?.result;
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);
            
            resolve({
              data: jsonData,
              headers: Object.keys(jsonData[0] || {}),
              type: 'excel',
              sheets: workbook.SheetNames
            });
          } catch (error) {
            reject(error);
          }
        };
        reader.readAsArrayBuffer(file);
      } else if (fileExtension === 'json') {
        const reader = new FileReader();
        reader.onload = (e: ProgressEvent<FileReader>) => {
          try {
            const jsonData = JSON.parse(e.target?.result as string);
            resolve({
              data: jsonData,
              type: 'json'
            });
          } catch (error) {
            reject(error);
          }
        };
        reader.readAsText(file);
      } else {
        reject(new Error('Unsupported file type'));
      }
    });
  };

  const processFile = async (file: File) => {
    const fileId = `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Validate file
    const validation = validateFile(file);
    if (!validation.valid) {
      setFiles(prev => [
        ...prev, 
        {
          id: fileId,
          name: file.name,
          size: file.size,
          type: file.type,
          progress: 100,
          status: 'error',
          error: validation.error
        }
      ]);
      
      toast({
        title: "Upload Error",
        description: validation.error,
        variant: "destructive"
      });
      
      return;
    }
    
    // Add file to list with uploading status
    setFiles(prev => [
      ...prev,
      {
        id: fileId,
        name: file.name,
        size: file.size,
        type: file.type,
        progress: 0,
        status: 'uploading'
      }
    ]);
    
    // Simulate upload progress
    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress > 95) {
        clearInterval(progressInterval);
        progress = 95;
      }
      
      setFiles(prev => 
        prev.map(f => 
          f.id === fileId ? { ...f, progress: Math.min(progress, 95) } : f
        )
      );
    }, 300);
    
    try {
      // Parse file content
      const parsedData = await parseFile(file);
      
      // File successfully processed
      clearInterval(progressInterval);
      
      setFiles(prev => 
        prev.map(f => 
          f.id === fileId 
            ? { 
                ...f, 
                progress: 100, 
                status: 'success',
                previewData: parsedData
              } 
            : f
        )
      );
      
      if (onFilesProcessed) {
        onFilesProcessed(parsedData, file.type);
      }
      
      toast({
        title: "File Uploaded",
        description: `${file.name} has been successfully processed.`
      });
    } catch (error) {
      clearInterval(progressInterval);
      
      setFiles(prev => 
        prev.map(f => 
          f.id === fileId 
            ? { 
                ...f, 
                progress: 100, 
                status: 'error',
                error: 'Failed to process file. It may be corrupted or in an unsupported format.'
              } 
            : f
        )
      );
      
      toast({
        title: "Processing Error",
        description: "Failed to process file. It may be corrupted or in an unsupported format.",
        variant: "destructive"
      });
    }
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      droppedFiles.forEach(file => processFile(file));
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      selectedFiles.forEach(file => processFile(file));
    }
  };

  const handleBrowseFiles = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const renderFilePreview = (file: UploadedFile) => {
    if (!file.previewData || file.status !== 'success') return null;
    
    const data = file.previewData.data;
    if (!Array.isArray(data) || data.length === 0) return null;
    
    const headers = file.previewData.headers || Object.keys(data[0]);
    const previewRows = data.slice(0, 5); // Show first 5 rows
    
    return (
      <div className="mt-4 bg-gray-50 rounded-md p-3 border border-gray-200 overflow-x-auto">
        <div className="flex items-center mb-2">
          <Table className="h-4 w-4 mr-2 text-gray-500" />
          <span className="text-xs font-medium">Data Preview (first 5 rows)</span>
        </div>
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-gray-100">
              {headers.map((header: string, idx: number) => (
                <th key={idx} className="px-2 py-1.5 text-left font-medium text-gray-700 border border-gray-200">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {previewRows.map((row: any, rowIdx: number) => (
              <tr key={rowIdx} className={rowIdx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                {headers.map((header: string, colIdx: number) => (
                  <td key={colIdx} className="px-2 py-1.5 border border-gray-200 truncate max-w-[150px]">
                    {row[header]?.toString() || ""}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {data.length > 5 && (
          <div className="text-xs text-gray-500 mt-2 italic">
            {data.length - 5} more rows not shown...
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full">
      <div 
        className={`border-2 ${isDragging ? 'border-indigo-400 bg-indigo-50' : 'border-dashed border-gray-300 bg-gray-50'} rounded-lg p-8 text-center transition-colors duration-200 ease-in-out hover:bg-gray-100`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileChange}
          accept={allowedFileTypes.join(',')}
          multiple
        />
        
        <div className="mx-auto flex flex-col items-center">
          <div className="mb-4 p-3 bg-indigo-100 rounded-full">
            <Upload className="h-6 w-6 text-indigo-600" />
          </div>
          <h3 className="text-lg font-semibold mb-1">
            {isDragging ? 'Drop your files here' : 'Upload your data files'}
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Drag and drop files here, or click to browse
          </p>
          <Button 
            onClick={handleBrowseFiles} 
            className="bg-indigo-600 hover:bg-indigo-700"
            variant="default"
          >
            Browse Files
          </Button>
          <div className="mt-2 text-xs text-gray-500">
            Supported formats: {allowedFileTypes.join(', ')}. Max size: {maxSize}MB
          </div>
        </div>
      </div>

      {files.length > 0 && (
        <div className="mt-6 space-y-4">
          <h4 className="font-medium text-sm">Uploaded Files</h4>
          <div className="space-y-3">
            {files.map(file => (
              <div key={file.id} className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="p-4 bg-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {file.status === 'success' ? (
                        <FileCheck className="h-5 w-5 text-green-500 mr-3" />
                      ) : file.status === 'error' ? (
                        <FileWarning className="h-5 w-5 text-red-500 mr-3" />
                      ) : (
                        getFileIcon(file.type)
                      )}
                      <div>
                        <div className="font-medium text-sm truncate max-w-md">{file.name}</div>
                        <div className="text-xs text-gray-500">{formatFileSize(file.size)}</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      {file.status === 'uploading' && (
                        <div className="text-xs text-indigo-600 mr-3">{Math.round(file.progress)}%</div>
                      )}
                      <button 
                        onClick={() => removeFile(file.id)}
                        className="p-1 rounded-full hover:bg-gray-100"
                      >
                        <X className="h-4 w-4 text-gray-500" />
                      </button>
                    </div>
                  </div>
                  
                  {file.status === 'uploading' && (
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                      <div 
                        className="bg-indigo-600 h-1.5 rounded-full" 
                        style={{ width: `${file.progress}%` }}
                      ></div>
                    </div>
                  )}
                  
                  {file.status === 'error' && file.error && (
                    <div className="mt-2 text-xs text-red-500">
                      {file.error}
                    </div>
                  )}
                
                  {renderFilePreview(file)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploadArea;
