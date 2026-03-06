import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
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
import { Search, FileSpreadsheet, ArrowRight } from 'lucide-react';
import type { ExcelFile } from '../utils/excelStorage';
import type { CorrelationResult } from '../utils/excelCorrelation';
import { correlateFiles } from '../utils/excelCorrelation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { Badge } from './ui/badge';

interface CorrelationSearchProps {
  courseFiles: ExcelFile[];
  stationFiles: ExcelFile[];
}

export function CorrelationSearch({ courseFiles, stationFiles }: CorrelationSearchProps) {
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [selectedStationId, setSelectedStationId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<CorrelationResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = () => {
    if (!selectedCourseId || !selectedStationId) {
      return;
    }

    setIsSearching(true);
    setHasSearched(true);

    const courseFile = courseFiles.find((f) => f.id === selectedCourseId);
    const stationFile = stationFiles.find((f) => f.id === selectedStationId);

    if (courseFile && stationFile) {
      const correlationResults = correlateFiles(courseFile, stationFile, searchQuery);
      setResults(correlationResults);
    }

    setIsSearching(false);
  };

  const handleReset = () => {
    setSelectedCourseId('');
    setSelectedStationId('');
    setSearchQuery('');
    setResults([]);
    setHasSearched(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5" />
            Correlation Search
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="course-select">Select Course File</Label>
              <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
                <SelectTrigger id="course-select">
                  <SelectValue placeholder="Choose a course file..." />
                </SelectTrigger>
                <SelectContent>
                  {courseFiles.map((file) => (
                    <SelectItem key={file.id} value={file.id}>
                      {file.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="station-select">Select Station File</Label>
              <Select value={selectedStationId} onValueChange={setSelectedStationId}>
                <SelectTrigger id="station-select">
                  <SelectValue placeholder="Choose a station file..." />
                </SelectTrigger>
                <SelectContent>
                  {stationFiles.map((file) => (
                    <SelectItem key={file.id} value={file.id}>
                      {file.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="search-query">Search Filter (Optional)</Label>
            <Input
              id="search-query"
              placeholder="Filter results by keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleSearch}
              disabled={!selectedCourseId || !selectedStationId || isSearching}
              className="flex-1"
            >
              <Search className="w-4 h-4 mr-2" />
              {isSearching ? 'Searching...' : 'Find Correlations'}
            </Button>
            <Button onClick={handleReset} variant="outline">
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {hasSearched && (
        <Card>
          <CardHeader>
            <CardTitle>
              Correlation Results {results.length > 0 && `(${results.length})`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {results.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No correlations found. Try different files or adjust your search.
              </div>
            ) : (
              <div className="space-y-4">
                <div className="border rounded-lg overflow-auto max-h-[600px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[150px]">Course Info</TableHead>
                        <TableHead className="min-w-[150px]">Station Info</TableHead>
                        <TableHead className="min-w-[200px]">Matching Skills</TableHead>
                        <TableHead className="w-24">Score</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {results.map((result, idx) => (
                        <TableRow key={idx}>
                          <TableCell>
                            <div className="space-y-1">
                              {Object.entries(result.courseRow).map(([key, value]) => (
                                <div key={key} className="text-sm">
                                  <span className="font-medium text-muted-foreground">
                                    {key}:
                                  </span>{' '}
                                  <span>{String(value)}</span>
                                </div>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              {Object.entries(result.stationRow).map(([key, value]) => (
                                <div key={key} className="text-sm">
                                  <span className="font-medium text-muted-foreground">
                                    {key}:
                                  </span>{' '}
                                  <span>{String(value)}</span>
                                </div>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {result.matchingSkills.map((skill, skillIdx) => (
                                <Badge key={skillIdx} variant="default">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="font-bold">
                              {result.matchScore}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div className="text-sm text-muted-foreground">
                  Found {results.length} correlation{results.length !== 1 ? 's' : ''} between{' '}
                  {courseFiles.find((f) => f.id === selectedCourseId)?.name} and{' '}
                  {stationFiles.find((f) => f.id === selectedStationId)?.name}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
