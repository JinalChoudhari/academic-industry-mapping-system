import { useState } from "react";
import { uploadFile } from "../../api/fileApi";
import { readExcelFile, saveExcelFile } from "../utils/excelStorage";

import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

import { Upload, X, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";

interface FileUploadSectionProps {
  type: "course" | "station";
  onFileUploaded: () => void;
}

export function FileUploadSection({
  type,
  onFileUploaded,
}: FileUploadSectionProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Select Excel files
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);

    const validFiles = selected.filter(
      (file) =>
        file.name.endsWith(".xlsx") ||
        file.name.endsWith(".xls")
    );

    setFiles(validFiles);
  };

  // Remove file
  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Upload file to backend
  const handleUpload = async () => {
    if (files.length === 0) {
      toast.error("Please select a file");
      return;
    }

    setIsUploading(true);

    try {
      for (const file of files) {
        await uploadFile(file);
        const { headers, data, binary } = await readExcelFile(file);
        const fileNameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
        saveExcelFile(fileNameWithoutExt, file.name, type, headers, data, binary);
      }

      toast.success(`${type} file uploaded successfully`);

      setFiles([]);

      onFileUploaded();
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload size={18} />
          Upload Excel File
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">

        <div>
          <Label>Select Excel File</Label>

          <Input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
          />
        </div>

        {/* Selected Files */}
        {files.map((file, index) => (
          <div
            key={index}
            className="flex items-center justify-between border p-2 rounded"
          >
            <div className="flex items-center gap-2">
              <FileSpreadsheet size={18} />
              {file.name}
            </div>

            <Button
              variant="destructive"
              size="sm"
              onClick={() => removeFile(index)}
            >
              <X size={14} />
            </Button>
          </div>
        ))}

        <Button
          onClick={handleUpload}
          disabled={isUploading}
        >
          {isUploading ? "Uploading..." : "Upload"}
        </Button>

      </CardContent>
    </Card>
  );
}
