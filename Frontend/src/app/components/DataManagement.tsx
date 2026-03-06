import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Database } from 'lucide-react';
import { ExcelDataEditor } from './ExcelDataEditor';

export function DataManagement() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2">Data Management</h2>
        <p className="text-muted-foreground">
          Edit and manage Excel data directly with Add, Edit, and Delete operations
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Manage Excel Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="courses" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="courses">Manage Courses Data</TabsTrigger>
              <TabsTrigger value="stations">Manage Stations Data</TabsTrigger>
            </TabsList>
            <TabsContent value="courses" className="mt-6">
              <ExcelDataEditor type="course" />
            </TabsContent>
            <TabsContent value="stations" className="mt-6">
              <ExcelDataEditor type="station" />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
