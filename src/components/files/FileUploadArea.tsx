
import React, { useState, useRef } from "react";
import { Upload, Files, FileSpreadsheet, FileJson } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { FileUploadAreaProps } from "@/types/file-types";

const FileUploadArea: React.FC<FileUploadAreaProps> = ({ 
  onFilesSelected, 
  allowedFileTypes = [".csv", ".xlsx", ".xls", ".json"],
  maxFileSize = 10, // MB
  multiple = false
}) => {
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
    const filesArray = Array.from(files);
    const invalidFiles = filesArray.filter(file => {
      const extension = `.${file.name.split(".").pop()?.toLowerCase()}`;
      return !allowedFileTypes.includes(extension);
    });

    if (invalidFiles.length > 0) {
      toast({
        title: "Unsupported file format",
        description: `Please upload only ${allowedFileTypes.join(", ")} files.`,
        variant: "destructive",
      });
      return;
    }

    // Check file size
    const oversizedFiles = filesArray.filter(file => file.size > maxFileSize * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      toast({
        title: "File too large",
        description: `Maximum file size is ${maxFileSize}MB.`,
        variant: "destructive",
      });
      return;
    }

    // Show success toast
    toast({
      title: "File uploaded successfully",
      description: `Processing ${files.length > 1 ? 'files' : files[0].name}...`,
      variant: "default",
    });

    // Call the parent handler
    onFilesSelected(files);
  };

  return (
    <div
      className={`p-6 border-2 border-dashed ${
        isDragging ? "border-indigo-400 bg-indigo-50" : "border-gray-300 bg-gray-50"
      } rounded-lg transition-colors duration-200 text-center cursor-pointer`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleButtonClick}
    >
      <Upload className="h-16 w-16 mx-auto text-gray-300 mb-4" />
      <p className="text-gray-500 mb-2">Drag and drop files here, or click to select files</p>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileInputChange}
        accept={allowedFileTypes.join(",")}
        multiple={multiple}
      />
      <Button 
        variant="outline" 
        className="mx-auto hover:bg-gray-100"
        onClick={(e) => {
          e.stopPropagation();
          handleButtonClick();
        }}
      >
        <Upload className="h-4 w-4 mr-2" />
        Upload Files
      </Button>
      <p className="text-xs text-gray-400 mt-2">Supported formats: {allowedFileTypes.join(", ")}</p>
    </div>
  );
};

export default FileUploadArea;
