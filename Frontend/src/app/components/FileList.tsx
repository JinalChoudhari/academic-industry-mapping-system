import { useEffect, useState } from "react";
import { getFiles } from "../../api/fileApi";
import type { ExcelFile } from "../utils/excelStorage";

interface Props {
  type?: "course" | "station";
  files?: ExcelFile[];
  onSelectFile?: (file: string) => void;
  onFileDeleted?: () => void;
  onFileReplaced?: () => void;
}

export function FileList({ type, files, onSelectFile }: Props) {
  const [apiFiles, setApiFiles] = useState<string[]>([]);

  useEffect(() => {
    if (!files) {
      loadFiles();
    }
  }, [files]);

  const loadFiles = async () => {
    try {
      const data = await getFiles();
      setApiFiles(data);
    } catch (error) {
      console.error("Failed to load files:", error);
      setApiFiles([]);
    }
  };

  const displayFiles = files
    ? files.filter((file) => (type ? file.type === type : true)).map((file) => file.filename)
    : apiFiles;

  return (
    <div>
      <h2 className="text-lg font-bold mb-2">
        {type ? `${type[0].toUpperCase()}${type.slice(1)} Files` : "Uploaded Files"}
      </h2>

      {displayFiles.length === 0 && (
        <div className="border p-2 mb-2 text-sm text-muted-foreground">No files found</div>
      )}

      {displayFiles.map((file, index) => (
        <div
          key={index}
          className="border p-2 mb-2 cursor-pointer hover:bg-gray-100"
          onClick={() => onSelectFile?.(file)}
        >
          {file}
        </div>
      ))}
    </div>
  );
}

export default FileList;
