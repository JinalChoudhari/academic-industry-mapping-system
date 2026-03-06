import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Search, Filter } from 'lucide-react';
import type { ExcelFile } from '../utils/excelStorage';

interface SearchFiltersProps {
  courses: ExcelFile[];
  onSearch: (filters: SearchFilters) => void;
}

export interface SearchFilters {
  courseId: string;
  semester: string;
  subject?: string;
}

export function SearchFilters({ courses, onSearch }: SearchFiltersProps) {
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [selectedSemester, setSelectedSemester] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  
  const [semesters, setSemesters] = useState<string[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);

  // Extract semesters when course is selected
  useEffect(() => {
    if (selectedCourse) {
      const course = courses.find(c => c.id === selectedCourse);
      if (course) {
        // Find semester column
        const semesterIdx = course.headers.findIndex(h => 
          h.toLowerCase().includes('semester')
        );
        
        if (semesterIdx !== -1) {
          // Extract unique semester values
          const uniqueSemesters = [...new Set(
            course.data
              .map(row => String(row[semesterIdx]))
              .filter(s => s && s.trim() !== '')
          )];
          setSemesters(uniqueSemesters);
        } else {
          setSemesters([]);
        }
      }
      setSelectedSemester('');
      setSelectedSubject('');
      setSubjects([]);
    } else {
      setSemesters([]);
      setSubjects([]);
    }
  }, [selectedCourse, courses]);

  // Extract subjects when semester is selected
  useEffect(() => {
    if (selectedSemester && selectedCourse) {
      const course = courses.find(c => c.id === selectedCourse);
      if (course) {
        const semesterIdx = course.headers.findIndex(h => 
          h.toLowerCase().includes('semester')
        );
        const subjectIdx = course.headers.findIndex(h => 
          h.toLowerCase().includes('subject')
        );
        
        if (semesterIdx !== -1 && subjectIdx !== -1) {
          // Filter rows by semester and extract unique subjects
          const uniqueSubjects = [...new Set(
            course.data
              .filter(row => String(row[semesterIdx]) === selectedSemester)
              .map(row => String(row[subjectIdx]))
              .filter(s => s && s.trim() !== '')
          )];
          setSubjects(uniqueSubjects);
        } else {
          setSubjects([]);
        }
      }
      setSelectedSubject('');
    } else {
      setSubjects([]);
    }
  }, [selectedSemester, selectedCourse, courses]);

  const handleSearch = () => {
    if (!selectedCourse || !selectedSemester) return;
    
    onSearch({
      courseId: selectedCourse,
      semester: selectedSemester,
      subject: selectedSubject || undefined,
    });
  };

  const isSearchDisabled = !selectedCourse || !selectedSemester;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="w-5 h-5" />
          Search Filters
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Course Selection */}
          <div className="space-y-2">
            <Label htmlFor="course-select">Select Course *</Label>
            <Select value={selectedCourse} onValueChange={setSelectedCourse}>
              <SelectTrigger id="course-select">
                <SelectValue placeholder="Choose a course" />
              </SelectTrigger>
              <SelectContent>
                {courses.length === 0 ? (
                  <div className="p-2 text-sm text-muted-foreground">
                    No courses available
                  </div>
                ) : (
                  courses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Semester Selection */}
          <div className="space-y-2">
            <Label htmlFor="semester-select">Select Semester *</Label>
            <Select 
              value={selectedSemester} 
              onValueChange={setSelectedSemester}
              disabled={!selectedCourse || semesters.length === 0}
            >
              <SelectTrigger id="semester-select">
                <SelectValue placeholder="Choose a semester" />
              </SelectTrigger>
              <SelectContent>
                {semesters.map((semester, index) => (
                  <SelectItem key={`semester-${index}-${semester}`} value={semester}>
                    {semester}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Subject Selection (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="subject-select">Select Subject (Optional)</Label>
            <Select 
              value={selectedSubject} 
              onValueChange={setSelectedSubject}
              disabled={!selectedSemester || subjects.length === 0}
            >
              <SelectTrigger id="subject-select">
                <SelectValue placeholder="Choose a subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem key="__all__" value="__all__">
                  <span className="font-semibold">All Subjects</span>
                </SelectItem>
                {subjects.map((subject, index) => (
                  <SelectItem key={`subject-${index}-${subject}`} value={subject}>
                    {subject}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button 
          onClick={handleSearch} 
          disabled={isSearchDisabled}
          className="w-full"
        >
          <Search className="w-4 h-4 mr-2" />
          Search Matching Stations
        </Button>
      </CardContent>
    </Card>
  );
}