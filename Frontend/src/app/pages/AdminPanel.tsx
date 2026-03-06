import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { FileUploadSection } from '../components/FileUploadSection';
import { FileList } from '../components/FileList';
import { DataManagement } from '../components/DataManagement';
import { CorrelationSearch } from '../components/CorrelationSearch';
import { getCourseFiles, getStationFiles } from '../utils/excelStorage';
import { clearAuth, checkAuth } from './AdminLogin';
import type { ExcelFile } from '../utils/excelStorage';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Trash2, Upload, Edit, Search, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';

export function AdminPanel() {
  const [courseFiles, setCourseFiles] = useState<ExcelFile[]>([]);
  const [stationFiles, setStationFiles] = useState<ExcelFile[]>([]);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication
    if (!checkAuth()) {
      toast.error('Please login to access the admin panel');
      navigate('/admin/login');
    }
  }, [navigate]);

  const loadFiles = () => {
    setCourseFiles(getCourseFiles());
    setStationFiles(getStationFiles());
  };

  useEffect(() => {
    loadFiles();
  }, []);

  const handleClearAllData = () => {
    localStorage.clear();
    toast.success('All data cleared successfully');
    loadFiles();
    setClearDialogOpen(false);
  };

  const handleLogout = () => {
    clearAuth();
    toast.success('Logged out successfully');
    navigate('/admin/login');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="mb-2">Admin Panel</h1>
            <p className="text-muted-foreground">
              Manage course and station data files for the mapping system
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={handleLogout} 
              variant="outline"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
            <Button 
              onClick={() => setClearDialogOpen(true)} 
              variant="destructive"
              disabled={courseFiles.length === 0 && stationFiles.length === 0}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All Data
            </Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="upload">
            <Upload className="w-4 h-4 mr-2" />
            File Management
          </TabsTrigger>
          <TabsTrigger value="edit">
            <Edit className="w-4 h-4 mr-2" />
            Data Management
          </TabsTrigger>
          <TabsTrigger value="search">
            <Search className="w-4 h-4 mr-2" />
            Search & Correlate
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Upload Sections */}
            <div className="space-y-6">
              <FileUploadSection type="course" onFileUploaded={loadFiles} />
              <FileUploadSection type="station" onFileUploaded={loadFiles} />
            </div>

            {/* Right Column - File Lists */}
            <div className="space-y-6">
              <FileList 
                type="course" 
                files={courseFiles} 
                onFileDeleted={loadFiles}
                onFileReplaced={loadFiles}
              />
              <FileList 
                type="station" 
                files={stationFiles} 
                onFileDeleted={loadFiles}
                onFileReplaced={loadFiles}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="edit">
          <DataManagement />
        </TabsContent>

        <TabsContent value="search">
          <CorrelationSearch courseFiles={courseFiles} stationFiles={stationFiles} />
        </TabsContent>
      </Tabs>

      <AlertDialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear All Data?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all course and station files from the system. 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearAllData}>Clear All</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
