
import React, { useState, useRef } from "react";
import { Upload, Files, FileSpreadsheet, FileJson } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import Papa from "papaparse";
import * as XLSX from "xlsx";

interface FileUploadAreaProps {
  onFilesSelected: (files: FileList) => void;
}

const FileUploadArea: React.FC<FileUploadAreaProps> = ({ onFilesSelected }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    handleFiles(files);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFiles = (files: FileList) => {
    if (files.length === 0) return;

    // Check file extensions
    const file = files[0];
    const extension = file.name.split(".").pop()?.toLowerCase();

    if (!extension) {
      toast({
        title: "Invalid file",
        description: "Cannot determine file type.",
        variant: "destructive",
      });
      return;
    }

    if (!["csv", "xlsx", "xls", "json"].includes(extension)) {
      toast({
        title: "Unsupported file format",
        description: "Please upload a CSV, Excel, or JSON file.",
        variant: "destructive",
      });
      return;
    }

    // Call the parent handler
    onFilesSelected(files);
  };

  // Function to determine icon based on file extension
  const getFileIcon = (fileExtension: string) => {
    switch (fileExtension.toLowerCase()) {
      case "csv":
        return <Files className="h-16 w-16 text-gray-300" />;
      case "xlsx":
      case "xls":
        return <FileSpreadsheet className="h-16 w-16 text-gray-300" />;
      case "json":
        return <FileJson className="h-16 w-16 text-gray-300" />;
      default:
        return <Upload className="h-16 w-16 text-gray-300" />;
    }
  };

  return (
    <div
      className={`mb-6 p-6 border-2 border-dashed ${
        isDragging ? "border-indigo-400 bg-indigo-50" : "border-gray-300 bg-gray-50"
      } rounded-lg transition-colors duration-200 text-center`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <Upload className="h-16 w-16 mx-auto text-gray-300 mb-4" />
      <p className="text-gray-500 mb-2">Drag and drop files here, or click to select files</p>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileInputChange}
        accept=".csv,.xlsx,.xls,.json"
        multiple={false}
      />
      <Button 
        variant="outline" 
        className="mx-auto hover:bg-gray-100"
        onClick={handleButtonClick}
      >
        <Upload className="h-4 w-4 mr-2" />
        Upload Files
      </Button>
      <p className="text-xs text-gray-400 mt-2">Supported formats: .csv, .xlsx, .json</p>
    </div>
  );
};

export default FileUploadArea;
