
export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  data: any;
  columns?: string[];
  rows?: any[][];
}

export interface FileUploadAreaProps {
  onFilesSelected: (files: FileList) => void;
  onFilesUploaded?: (files: UploadedFile[]) => void;
  allowedFileTypes?: string[];
  maxFileSize?: number;
  multiple?: boolean;
}

export interface DataVisualizationProps {
  data?: any[];
  columns?: string[];
  rows?: any[][];
  file?: UploadedFile;
}
