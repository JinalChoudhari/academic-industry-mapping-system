import { useState, useEffect } from 'react';
import { getCourseFiles, addStorageChangeListener, excelToJson } from '../utils/excelStorage';
import type { ExcelFile } from '../utils/excelStorage';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { BookOpen, AlertCircle, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Search } from 'lucide-react';

export function Curriculum() {
  const [courseFiles, setCourseFiles] = useState<ExcelFile[]>([]);
  const [expandedCourses, setExpandedCourses] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadCourses();
    
    // Listen for storage changes
    const unsubscribe = addStorageChangeListener(loadCourses);
    return unsubscribe;
  }, []);

  const loadCourses = () => {
    setCourseFiles(getCourseFiles());
  };

  const toggleCourse = (courseId: string) => {
    setExpandedCourses(prev => {
      const newSet = new Set(prev);
      if (newSet.has(courseId)) {
        newSet.delete(courseId);
      } else {
        newSet.add(courseId);
      }
      return newSet;
    });
  };

  const expandAll = () => {
    const allCourses = new Set(courseFiles.map(c => c.id));
    setExpandedCourses(allCourses);
  };

  const collapseAll = () => {
    setExpandedCourses(new Set());
  };

  const filterData = (course: ExcelFile) => {
    if (!searchQuery) return excelToJson(course.headers, course.data);
    
    const query = searchQuery.toLowerCase();
    return excelToJson(course.headers, course.data).filter(row =>
      Object.values(row).some(val =>
        String(val).toLowerCase().includes(query)
      )
    );
  };

  if (courseFiles.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2">Curriculum</h1>
          <p className="text-muted-foreground">
            View all academic course data and curriculum details
          </p>
        </div>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No curriculum data available. Please upload course files in the Admin Panel.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="mb-2">Curriculum</h1>
          <p className="text-muted-foreground">
            View all academic course data and curriculum details
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={expandAll}>
            Expand All
          </Button>
          <Button variant="outline" size="sm" onClick={collapseAll}>
            Collapse All
          </Button>
        </div>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search curriculum data..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="space-y-4">
        {courseFiles.map((course) => {
          const isExpanded = expandedCourses.has(course.id);
          const filteredRows = filterData(course);

          if (searchQuery && filteredRows.length === 0) {
            return null;
          }

          return (
            <Card key={course.id}>
              <CardHeader 
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => toggleCourse(course.id)}
              >
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-primary" />
                    <span>{course.name}</span>
                    <span className="text-sm font-normal text-muted-foreground">
                      ({filteredRows.length} row{filteredRows.length !== 1 ? 's' : ''})
                    </span>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5" />
                  ) : (
                    <ChevronRight className="w-5 h-5" />
                  )}
                </CardTitle>
              </CardHeader>

              {isExpanded && (
                <CardContent className="pt-0">
                  <div className="border rounded-lg overflow-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="px-4 py-3 text-left font-medium">#</th>
                          {course.headers.map((header, idx) => (
                            <th key={idx} className="px-4 py-3 text-left font-medium min-w-[150px]">
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredRows.length === 0 ? (
                          <tr>
                            <td 
                              colSpan={course.headers.length + 1} 
                              className="px-4 py-8 text-center text-muted-foreground"
                            >
                              No data available
                            </td>
                          </tr>
                        ) : (
                          filteredRows.map((row, rowIdx) => (
                            <tr key={rowIdx} className="border-t hover:bg-muted/30">
                              <td className="px-4 py-3 font-medium text-muted-foreground">
                                {rowIdx + 1}
                              </td>
                              {course.headers.map((header, colIdx) => (
                                <td key={colIdx} className="px-4 py-3">
                                  {String(row[header] || '')}
                                </td>
                              ))}
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
