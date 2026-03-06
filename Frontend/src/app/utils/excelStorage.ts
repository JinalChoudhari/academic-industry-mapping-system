// Storage utility for managing Excel files in localStorage
import * as XLSX from 'xlsx';

export interface ExcelFile {
  id: string;
  name: string;
  filename: string;
  type: 'course' | 'station';
  data: any[][]; // Raw Excel data as 2D array
  headers: string[]; // Column headers
  excelBinary: string; // Base64 encoded Excel file for download
  uploadedAt: string;
}

const EXCEL_FILES_KEY = 'academic_industry_excel_files';

// Generate unique ID with timestamp + random component
const generateUniqueId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Event emitter for storage changes
const storageChangeListeners: Set<() => void> = new Set();

export const addStorageChangeListener = (listener: () => void) => {
  storageChangeListeners.add(listener);
  return () => storageChangeListeners.delete(listener);
};

const notifyStorageChange = () => {
  storageChangeListeners.forEach((listener) => listener());
};

// Get all Excel files
export const getExcelFiles = (): ExcelFile[] => {
  const stored = localStorage.getItem(EXCEL_FILES_KEY);
  return stored ? JSON.parse(stored) : [];
};

// Get files by type
export const getCourseFiles = (): ExcelFile[] => {
  return getExcelFiles().filter((f) => f.type === 'course');
};

export const getStationFiles = (): ExcelFile[] => {
  return getExcelFiles().filter((f) => f.type === 'station');
};

// Read Excel file and convert to structured data
export const readExcelFile = async (
  file: File
): Promise<{ headers: string[]; data: any[][]; binary: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const binaryStr = e.target?.result;
        const workbook = XLSX.read(binaryStr, { type: 'binary' });

        // Get first sheet
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        // Convert to 2D array
        const jsonData: any[][] = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          defval: '',
        });

        if (jsonData.length === 0) {
          reject(new Error('Excel file is empty'));
          return;
        }

        // Extract headers (first row)
        const headers = jsonData[0].map((h: any) => String(h || '').trim());

        // Extract data rows (excluding header)
        const dataRows = jsonData.slice(1).filter((row) => {
          // Filter out completely empty rows
          return row.some((cell) => cell !== '' && cell !== null && cell !== undefined);
        });

        // Convert binary to base64 for storage
        const base64 = btoa(binaryStr as string);

        resolve({
          headers,
          data: dataRows,
          binary: base64,
        });
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsBinaryString(file);
  });
};

// Convert data back to Excel and trigger download
export const downloadExcelFile = (
  headers: string[],
  data: any[][],
  filename: string
) => {
  // Combine headers with data
  const wsData = [headers, ...data];

  // Create worksheet
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Create workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

  // Trigger download
  XLSX.writeFile(wb, filename);
};

// Create backup before modification
export const createBackup = (file: ExcelFile): string => {
  const timestamp = new Date()
    .toISOString()
    .replace(/[:.]/g, '-')
    .substring(0, 19);
  const backupKey = `backup_${file.type}_${file.id}_${timestamp}`;

  localStorage.setItem(backupKey, JSON.stringify(file));
  return backupKey;
};

// Save Excel file
export const saveExcelFile = (
  name: string,
  filename: string,
  type: 'course' | 'station',
  headers: string[],
  data: any[][],
  excelBinary: string
): ExcelFile => {
  const files = getExcelFiles();

  // Check for duplicate names
  const existingFile = files.find(
    (f) => f.type === type && f.name.toLowerCase() === name.toLowerCase()
  );

  if (existingFile) {
    throw new Error(`A ${type} file with this name already exists`);
  }

  const newFile: ExcelFile = {
    id: generateUniqueId(),
    name,
    filename,
    type,
    headers,
    data,
    excelBinary,
    uploadedAt: new Date().toISOString(),
  };

  files.push(newFile);
  localStorage.setItem(EXCEL_FILES_KEY, JSON.stringify(files));
  notifyStorageChange();
  return newFile;
};

// Replace Excel file
export const replaceExcelFile = (
  id: string,
  filename: string,
  headers: string[],
  data: any[][],
  excelBinary: string
): void => {
  const files = getExcelFiles();
  const fileIndex = files.findIndex((f) => f.id === id);

  if (fileIndex === -1) {
    throw new Error('File not found');
  }

  // Create backup before replacing
  createBackup(files[fileIndex]);

  files[fileIndex] = {
    ...files[fileIndex],
    filename,
    headers,
    data,
    excelBinary,
    uploadedAt: new Date().toISOString(),
  };

  localStorage.setItem(EXCEL_FILES_KEY, JSON.stringify(files));
  notifyStorageChange();
};

// Update file data (for Add/Edit/Delete row operations)
export const updateExcelFileData = (
  id: string,
  headers: string[],
  data: any[][]
): void => {
  const files = getExcelFiles();
  const fileIndex = files.findIndex((f) => f.id === id);

  if (fileIndex === -1) {
    throw new Error('File not found');
  }

  // Create backup before updating
  createBackup(files[fileIndex]);

  // Convert updated data back to Excel binary
  const wsData = [headers, ...data];
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

  // Generate binary
  const excelBuffer = XLSX.write(wb, { type: 'binary', bookType: 'xlsx' });
  const excelBinary = btoa(excelBuffer);

  files[fileIndex] = {
    ...files[fileIndex],
    headers,
    data,
    excelBinary,
    uploadedAt: new Date().toISOString(),
  };

  localStorage.setItem(EXCEL_FILES_KEY, JSON.stringify(files));
  notifyStorageChange();
};

// Delete Excel file
export const deleteExcelFile = (id: string): void => {
  const files = getExcelFiles().filter((f) => f.id !== id);
  localStorage.setItem(EXCEL_FILES_KEY, JSON.stringify(files));
  notifyStorageChange();
};

// Convert Excel data to JSON object format (for correlation logic)
export const excelToJson = (headers: string[], data: any[][]): any[] => {
  return data.map((row) => {
    const obj: any = {};
    headers.forEach((header, index) => {
      obj[header] = row[index] !== undefined ? row[index] : '';
    });
    return obj;
  });
};

// Download backup files
export const downloadBackup = (file: ExcelFile) => {
  try {
    // Decode base64 to binary
    const binary = atob(file.excelBinary);

    // Convert to array buffer
    const buffer = new ArrayBuffer(binary.length);
    const view = new Uint8Array(buffer);
    for (let i = 0; i < binary.length; i++) {
      view[i] = binary.charCodeAt(i);
    }

    // Create blob and download
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading file:', error);
    throw new Error('Failed to download file');
  }
};
