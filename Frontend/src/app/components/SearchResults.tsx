import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { Badge } from './ui/badge';
import { Building2, Settings, Briefcase } from 'lucide-react';

export interface MatchResult {
  station: string;
  department: string;
  skill: string;
  description: string;
  matchScore?: number;
}

interface SearchResultsProps {
  results: MatchResult[];
  loading?: boolean;
}

export function SearchResults({ results, loading }: SearchResultsProps) {
  if (loading) {
    return (
      <Card>
        <CardContent className="py-12">
          <p className="text-center text-muted-foreground">Searching...</p>
        </CardContent>
      </Card>
    );
  }

  if (results.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <p className="text-center text-muted-foreground">
            No matching stations found. Try different filter criteria.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>
            Search Results ({results.length} matching station{results.length !== 1 ? 's' : ''})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Table View for larger screens */}
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Station</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Skill Used</TableHead>
                  <TableHead>Work Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((result, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{result.station}</TableCell>
                    <TableCell>{result.department}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{result.skill}</Badge>
                    </TableCell>
                    <TableCell>{result.description}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Card View for mobile screens */}
          <div className="md:hidden space-y-3">
            {results.map((result, index) => (
              <Card key={index} className="border">
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-start gap-2">
                    <Building2 className="w-4 h-4 mt-1 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Station</p>
                      <p className="font-medium">{result.station}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Briefcase className="w-4 h-4 mt-1 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Department</p>
                      <p>{result.department}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Settings className="w-4 h-4 mt-1 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Skill Matched</p>
                      <Badge variant="secondary">{result.skill}</Badge>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Description</p>
                    <p className="text-sm">{result.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
