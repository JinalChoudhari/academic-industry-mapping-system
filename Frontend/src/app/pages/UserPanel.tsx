import { useState, useEffect } from 'react';
import { SearchFilters, type SearchFilters as Filters } from '../components/SearchFilters';
import { SearchResults, type MatchResult } from '../components/SearchResults';
import { WelcomeBanner } from '../components/WelcomeBanner';
import { getCourseFiles, getStationFiles, addStorageChangeListener } from '../utils/excelStorage';
import type { ExcelFile } from '../utils/excelStorage';
import { Alert, AlertDescription } from '../components/ui/alert';
import { AlertCircle } from 'lucide-react';

export function UserPanel() {
  const [courseFiles, setCourseFiles] = useState<ExcelFile[]>([]);
  const [stationFiles, setStationFiles] = useState<ExcelFile[]>([]);
  const [searchResults, setSearchResults] = useState<MatchResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    loadData();
    
    // Listen for storage changes
    const unsubscribe = addStorageChangeListener(loadData);
    return unsubscribe;
  }, []);

  const loadData = () => {
    setCourseFiles(getCourseFiles());
    setStationFiles(getStationFiles());
  };

  const performSearch = (filters: Filters) => {
    setIsSearching(true);
    setHasSearched(true);

    // Find the selected course file
    const courseFile = courseFiles.find(c => c.id === filters.courseId);
    if (!courseFile) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    // Get all skills from course data based on filters
    let skills: string[] = [];
    
    try {
      // Convert Excel data to searchable format
      courseFile.data.forEach(row => {
        // Check if row matches filters
        let matchesFilter = true;
        
        if (filters.semester) {
          const semesterValue = row.find((cell: any, idx: number) => 
            courseFile.headers[idx]?.toLowerCase().includes('semester')
          );
          if (semesterValue && !String(semesterValue).includes(filters.semester)) {
            matchesFilter = false;
          }
        }
        
        if (filters.subject && filters.subject !== '__all__') {
          const subjectValue = row.find((cell: any, idx: number) => 
            courseFile.headers[idx]?.toLowerCase().includes('subject')
          );
          if (subjectValue && !String(subjectValue).toLowerCase().includes(filters.subject.toLowerCase())) {
            matchesFilter = false;
          }
        }
        
        if (matchesFilter) {
          // Extract skills from the skills column
          const skillsIndex = courseFile.headers.findIndex(h => 
            h.toLowerCase().includes('skill')
          );
          
          if (skillsIndex !== -1 && row[skillsIndex]) {
            const skillsText = String(row[skillsIndex]);
            const extractedSkills = skillsText.split(/[,;|]+/).map(s => s.trim()).filter(s => s.length > 0);
            skills.push(...extractedSkills);
          }
        }
      });
    } catch (error) {
      console.error('Error extracting skills:', error);
    }

    // Remove duplicates
    skills = [...new Set(skills)];

    // Search for matching stations based on skills
    const matches: MatchResult[] = [];

    stationFiles.forEach(stationFile => {
      stationFile.data.forEach((stationRow, rowIndex) => {
        // Find station details
        const stationNameIdx = stationFile.headers.findIndex(h => 
          h.toLowerCase().includes('name') || h.toLowerCase().includes('station')
        );
        const departmentIdx = stationFile.headers.findIndex(h => 
          h.toLowerCase().includes('department')
        );
        const skillsIdx = stationFile.headers.findIndex(h => 
          h.toLowerCase().includes('skill')
        );
        
        if (skillsIdx === -1) return;
        
        const stationName = stationNameIdx !== -1 ? String(stationRow[stationNameIdx]) : `Station ${rowIndex + 1}`;
        const department = departmentIdx !== -1 ? String(stationRow[departmentIdx]) : stationFile.name;
        const stationSkillsText = String(stationRow[skillsIdx] || '');
        const stationSkills = stationSkillsText.split(/[,;|]+/).map(s => s.trim()).filter(s => s.length > 0);
        
        // Find matching skills
        const matchingSkills = stationSkills.filter((stationSkill: string) =>
          skills.some(courseSkill => 
            courseSkill.toLowerCase().includes(stationSkill.toLowerCase()) ||
            stationSkill.toLowerCase().includes(courseSkill.toLowerCase())
          )
        );

        // If there are matching skills, add to results
        if (matchingSkills.length > 0) {
          matchingSkills.forEach((skill: string) => {
            matches.push({
              station: stationName,
              department: department,
              skill: skill,
              description: `Matches ${matchingSkills.length} skill(s) from your course`,
              matchScore: matchingSkills.length,
            });
          });
        }
      });
    });

    // Sort by match score (higher first)
    matches.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));

    setSearchResults(matches);
    setIsSearching(false);
  };

  const hasNoData = courseFiles.length === 0 || stationFiles.length === 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2">Search & Correlation</h1>
        <p className="text-muted-foreground">
          Find matching industry stations based on academic courses and skills
        </p>
      </div>

      <WelcomeBanner />

      {hasNoData && (
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {courseFiles.length === 0 && stationFiles.length === 0
              ? 'No course or station data available. Please upload files in the Admin Panel.'
              : courseFiles.length === 0
              ? 'No course data available. Please upload course files in the Admin Panel.'
              : 'No station data available. Please upload station files in the Admin Panel.'}
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-6">
        <SearchFilters courses={courseFiles} onSearch={performSearch} />
        
        {hasSearched && (
          <SearchResults results={searchResults} loading={isSearching} />
        )}
      </div>
    </div>
  );
}