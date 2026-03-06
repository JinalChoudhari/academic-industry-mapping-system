// Correlation utility for Excel data
import type { ExcelFile } from './excelStorage';
import { excelToJson } from './excelStorage';

export interface CorrelationResult {
  courseRow: any;
  stationRow: any;
  matchingSkills: string[];
  matchScore: number;
  courseFile: string;
  stationFile: string;
}

// Find skills column in headers (case-insensitive, flexible matching)
const findSkillsColumn = (headers: string[]): number => {
  const skillKeywords = ['skill', 'skills', 'required skill', 'required skills', 'competenc'];
  return headers.findIndex((h) =>
    skillKeywords.some((keyword) => h.toLowerCase().includes(keyword))
  );
};

// Extract skills from a cell value
const extractSkills = (value: any): string[] => {
  if (!value) return [];

  const str = String(value);
  // Split by common delimiters: comma, semicolon, pipe, or newline
  const skills = str
    .split(/[,;|\n]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  return skills;
};

// Perform correlation between course and station files
export const correlateFiles = (
  courseFile: ExcelFile,
  stationFile: ExcelFile,
  searchQuery?: string
): CorrelationResult[] => {
  const results: CorrelationResult[] = [];

  // Find skills columns
  const courseSkillsIndex = findSkillsColumn(courseFile.headers);
  const stationSkillsIndex = findSkillsColumn(stationFile.headers);

  if (courseSkillsIndex === -1 || stationSkillsIndex === -1) {
    console.warn('Skills column not found in one or both files');
    return results;
  }

  // Convert to JSON for easier handling
  const courseRows = excelToJson(courseFile.headers, courseFile.data);
  const stationRows = excelToJson(stationFile.headers, stationFile.data);

  // Perform correlation
  courseRows.forEach((courseRow) => {
    const courseSkillsValue = courseRow[courseFile.headers[courseSkillsIndex]];
    const courseSkills = extractSkills(courseSkillsValue);

    if (courseSkills.length === 0) return;

    stationRows.forEach((stationRow) => {
      const stationSkillsValue = stationRow[stationFile.headers[stationSkillsIndex]];
      const stationSkills = extractSkills(stationSkillsValue);

      if (stationSkills.length === 0) return;

      // Find matching skills (case-insensitive)
      const matchingSkills = courseSkills.filter((courseSkill) =>
        stationSkills.some((stationSkill) =>
          courseSkill.toLowerCase().includes(stationSkill.toLowerCase()) ||
          stationSkill.toLowerCase().includes(courseSkill.toLowerCase())
        )
      );

      if (matchingSkills.length > 0) {
        // Apply search filter if provided
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          const matchesSearch = Object.values(courseRow).some((val) =>
            String(val).toLowerCase().includes(query)
          ) || Object.values(stationRow).some((val) =>
            String(val).toLowerCase().includes(query)
          );

          if (!matchesSearch) return;
        }

        results.push({
          courseRow,
          stationRow,
          matchingSkills,
          matchScore: matchingSkills.length,
          courseFile: courseFile.name,
          stationFile: stationFile.name,
        });
      }
    });
  });

  // Sort by match score (highest first)
  results.sort((a, b) => b.matchScore - a.matchScore);

  return results;
};

// Search within a single Excel file
export const searchInFile = (
  file: ExcelFile,
  searchQuery: string
): any[] => {
  if (!searchQuery) return [];

  const query = searchQuery.toLowerCase();
  const rows = excelToJson(file.headers, file.data);

  return rows.filter((row) =>
    Object.values(row).some((val) =>
      String(val).toLowerCase().includes(query)
    )
  );
};
