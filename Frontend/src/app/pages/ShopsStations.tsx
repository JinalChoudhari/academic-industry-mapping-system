import { useState, useEffect } from 'react';
import { getStationFiles, addStorageChangeListener, excelToJson } from '../utils/excelStorage';
import type { ExcelFile } from '../utils/excelStorage';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Factory, AlertCircle, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Search } from 'lucide-react';

export function ShopsStations() {
  const [stationFiles, setStationFiles] = useState<ExcelFile[]>([]);
  const [expandedStations, setExpandedStations] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadStations();
    
    // Listen for storage changes
    const unsubscribe = addStorageChangeListener(loadStations);
    return unsubscribe;
  }, []);

  const loadStations = () => {
    setStationFiles(getStationFiles());
  };

  const toggleStation = (stationId: string) => {
    setExpandedStations(prev => {
      const newSet = new Set(prev);
      if (newSet.has(stationId)) {
        newSet.delete(stationId);
      } else {
        newSet.add(stationId);
      }
      return newSet;
    });
  };

  const expandAll = () => {
    const allStations = new Set(stationFiles.map(s => s.id));
    setExpandedStations(allStations);
  };

  const collapseAll = () => {
    setExpandedStations(new Set());
  };

  const filterData = (station: ExcelFile) => {
    if (!searchQuery) return excelToJson(station.headers, station.data);
    
    const query = searchQuery.toLowerCase();
    return excelToJson(station.headers, station.data).filter(row =>
      Object.values(row).some(val =>
        String(val).toLowerCase().includes(query)
      )
    );
  };

  if (stationFiles.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2">Shops & Stations</h1>
          <p className="text-muted-foreground">
            View all industry stations and workshop data
          </p>
        </div>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No station data available. Please upload station files in the Admin Panel.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="mb-2">Shops & Stations</h1>
          <p className="text-muted-foreground">
            View all industry stations and workshop data
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
            placeholder="Search station data..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="space-y-4">
        {stationFiles.map((station) => {
          const isExpanded = expandedStations.has(station.id);
          const filteredRows = filterData(station);

          if (searchQuery && filteredRows.length === 0) {
            return null;
          }

          return (
            <Card key={station.id}>
              <CardHeader 
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => toggleStation(station.id)}
              >
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Factory className="w-5 h-5 text-primary" />
                    <span>{station.name}</span>
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
                          {station.headers.map((header, idx) => (
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
                              colSpan={station.headers.length + 1} 
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
                              {station.headers.map((header, colIdx) => (
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
