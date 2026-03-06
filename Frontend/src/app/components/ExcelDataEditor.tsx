import { useState, useEffect } from 'react';
import {
  getCourseFiles,
  getStationFiles,
  updateExcelFileData,
  downloadBackup,
} from '../utils/excelStorage';
import type { ExcelFile } from '../utils/excelStorage';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import {
  AlertCircle,
  Plus,
  Trash2,
  Save,
  X,
  Edit2,
  Check,
  Download,
  Search,
} from 'lucide-react';
import { toast } from 'sonner';

interface ExcelDataEditorProps {
  type: 'course' | 'station';
}

export function ExcelDataEditor({ type }: ExcelDataEditorProps) {
  const [files, setFiles] = useState<ExcelFile[]>([]);
  const [selectedFileId, setSelectedFileId] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<ExcelFile | null>(null);
  const [editedData, setEditedData] = useState<any[][]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [editingRowIndex, setEditingRowIndex] = useState<number | null>(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteRowIndex, setDeleteRowIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadFiles();
  }, [type]);

  const loadFiles = () => {
    const loadedFiles = type === 'course' ? getCourseFiles() : getStationFiles();
    setFiles(loadedFiles);
  };

  const handleFileSelect = (fileId: string) => {
    const file = files.find((f) => f.id === fileId);
    if (file) {
      setSelectedFileId(fileId);
      setSelectedFile(file);
      setEditedData(JSON.parse(JSON.stringify(file.data))); // Deep clone
      setHasChanges(false);
      setSearchQuery('');
      setEditingRowIndex(null);
    }
  };

  const handleCellEdit = (rowIndex: number, colIndex: number, value: any) => {
    const newData = [...editedData];
    newData[rowIndex] = [...newData[rowIndex]];
    newData[rowIndex][colIndex] = value;
    setEditedData(newData);
    setHasChanges(true);
  };

  const handleAddRow = () => {
    if (!selectedFile) return;

    // Create empty row with same number of columns
    const emptyRow = new Array(selectedFile.headers.length).fill('');
    setEditedData([emptyRow, ...editedData]);
    setHasChanges(true);
    setEditingRowIndex(0);
    toast.success('New row added (not saved yet)');
  };

  const handleDeleteRow = (index: number) => {
    setDeleteRowIndex(index);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (deleteRowIndex === null) return;

    const newData = editedData.filter((_, idx) => idx !== deleteRowIndex);
    setEditedData(newData);
    setHasChanges(true);
    setShowDeleteDialog(false);
    setDeleteRowIndex(null);
    setEditingRowIndex(null);
    toast.success('Row deleted (not saved yet)');
  };

  const handleSave = () => {
    if (!selectedFile) return;

    // Validate that at least one row exists
    if (editedData.length === 0) {
      toast.error('Cannot save empty table');
      return;
    }

    setShowSaveDialog(true);
  };

  const confirmSave = () => {
    if (!selectedFile) return;

    try {
      updateExcelFileData(selectedFile.id, selectedFile.headers, editedData);

      setHasChanges(false);
      setShowSaveDialog(false);
      setEditingRowIndex(null);
      toast.success('Data updated successfully');

      // Reload files
      loadFiles();
      const updatedFile = (type === 'course' ? getCourseFiles() : getStationFiles()).find(
        (f) => f.id === selectedFile.id
      );
      if (updatedFile) {
        setSelectedFile(updatedFile);
        setEditedData(JSON.parse(JSON.stringify(updatedFile.data)));
      }
    } catch (error: any) {
      toast.error(`Failed to save changes: ${error.message}`);
    }
  };

  const handleCancel = () => {
    if (selectedFile) {
      setEditedData(JSON.parse(JSON.stringify(selectedFile.data)));
      setHasChanges(false);
      setEditingRowIndex(null);
      toast.info('Changes cancelled');
    }
  };

  const handleDownloadExcel = () => {
    if (!selectedFile) return;

    try {
      downloadBackup(selectedFile);
      toast.success('Excel file downloaded');
    } catch (error) {
      toast.error('Failed to download file');
    }
  };

  const getFilteredData = () => {
    if (!searchQuery || !selectedFile) return editedData;

    return editedData.filter((row) => {
      return row.some((cell) =>
        String(cell).toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  };

  if (files.length === 0) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          No {type} files available. Please upload {type} files first.
        </AlertDescription>
      </Alert>
    );
  }

  const filteredData = getFilteredData();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <Label htmlFor={`${type}-select`}>
            Select {type === 'course' ? 'Course' : 'Station'} File
          </Label>
          <Select value={selectedFileId} onValueChange={handleFileSelect}>
            <SelectTrigger id={`${type}-select`}>
              <SelectValue placeholder="Choose a file..." />
            </SelectTrigger>
            <SelectContent>
              {files.map((file) => (
                <SelectItem key={file.id} value={file.id}>
                  {file.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {selectedFile && (
        <>
          <div className="flex items-center gap-2 justify-between">
            <div className="flex gap-2 flex-1">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search in table..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleDownloadExcel}>
                <Download className="w-4 h-4 mr-2" />
                Download Excel
              </Button>
              <Button variant="outline" size="sm" onClick={handleAddRow}>
                <Plus className="w-4 h-4 mr-2" />
                Add Row
              </Button>
              <Button onClick={handleCancel} variant="outline" disabled={!hasChanges}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={!hasChanges}>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="border rounded-lg overflow-auto max-h-[600px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12 sticky left-0 bg-background z-10">
                        #
                      </TableHead>
                      {selectedFile.headers.map((header, idx) => (
                        <TableHead key={idx} className="min-w-[150px]">
                          {header}
                        </TableHead>
                      ))}
                      <TableHead className="w-24 sticky right-0 bg-background">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredData.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={selectedFile.headers.length + 2}
                          className="text-center text-muted-foreground py-8"
                        >
                          {searchQuery
                            ? `No results found for "${searchQuery}"`
                            : 'No data available. Click "Add Row" to create one.'}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredData.map((row, rowIdx) => {
                        // Find original index for editing
                        const originalIdx = editedData.indexOf(row);

                        return (
                          <TableRow key={rowIdx}>
                            <TableCell className="sticky left-0 bg-background font-medium">
                              {originalIdx + 1}
                            </TableCell>
                            {row.map((cell, colIdx) => (
                              <TableCell key={colIdx}>
                                <Input
                                  value={cell || ''}
                                  onChange={(e) =>
                                    handleCellEdit(originalIdx, colIdx, e.target.value)
                                  }
                                  className="h-8"
                                />
                              </TableCell>
                            ))}
                            <TableCell className="sticky right-0 bg-background">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="text-destructive hover:text-destructive h-8 w-8"
                                onClick={() => handleDeleteRow(originalIdx)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {selectedFile && (
            <div className="text-sm text-muted-foreground">
              Total rows: {editedData.length} • Columns: {selectedFile.headers.length}
              {searchQuery && ` • Showing: ${filteredData.length} filtered rows`}
            </div>
          )}
        </>
      )}

      <AlertDialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Save Changes</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to save these changes? A backup of the current data will
              be created automatically before saving.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmSave}>Save Changes</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Row</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this row? This action will be applied when you
              save changes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
