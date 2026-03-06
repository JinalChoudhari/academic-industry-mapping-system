// Storage utility for managing course and station files in localStorage

export interface CourseFile {
  id: string;
  name: string;
  filename: string;
  data: any;
  uploadedAt: string;
}

export interface StationFile {
  id: string;
  name: string;
  filename: string;
  data: any;
  uploadedAt: string;
}

const COURSES_KEY = 'academic_industry_courses';
const STATIONS_KEY = 'academic_industry_stations';

// Generate unique ID with timestamp + random component
const generateUniqueId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Event emitter for storage changes
const storageChangeListeners: Set<() => void> = new Set();

export const addStorageChangeListener = (listener: () => void) => {
  storageChangeListeners.add(listener);
  return () => storageChangeListeners.delete(listener);
};

const notifyStorageChange = () => {
  storageChangeListeners.forEach(listener => listener());
};

// Course file operations
export const getCourseFiles = (): CourseFile[] => {
  const stored = localStorage.getItem(COURSES_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const saveCourseFile = (name: string, filename: string, data: any): CourseFile => {
  const courses = getCourseFiles();
  const newCourse: CourseFile = {
    id: generateUniqueId(),
    name,
    filename,
    data,
    uploadedAt: new Date().toISOString(),
  };
  courses.push(newCourse);
  localStorage.setItem(COURSES_KEY, JSON.stringify(courses));
  notifyStorageChange();
  return newCourse;
};

export const deleteCourseFile = (id: string): void => {
  const courses = getCourseFiles().filter(c => c.id !== id);
  localStorage.setItem(COURSES_KEY, JSON.stringify(courses));
  notifyStorageChange();
};

export const replaceCourseFile = (id: string, filename: string, data: any): void => {
  const courses = getCourseFiles().map(c => 
    c.id === id ? { ...c, filename, data, uploadedAt: new Date().toISOString() } : c
  );
  localStorage.setItem(COURSES_KEY, JSON.stringify(courses));
  notifyStorageChange();
};

// Station file operations
export const getStationFiles = (): StationFile[] => {
  const stored = localStorage.getItem(STATIONS_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const saveStationFile = (name: string, filename: string, data: any): StationFile => {
  const stations = getStationFiles();
  const newStation: StationFile = {
    id: generateUniqueId(),
    name,
    filename,
    data,
    uploadedAt: new Date().toISOString(),
  };
  stations.push(newStation);
  localStorage.setItem(STATIONS_KEY, JSON.stringify(stations));
  notifyStorageChange();
  return newStation;
};

export const deleteStationFile = (id: string): void => {
  const stations = getStationFiles().filter(s => s.id !== id);
  localStorage.setItem(STATIONS_KEY, JSON.stringify(stations));
  notifyStorageChange();
};

export const replaceStationFile = (id: string, filename: string, data: any): void => {
  const stations = getStationFiles().map(s => 
    s.id === id ? { ...s, filename, data, uploadedAt: new Date().toISOString() } : s
  );
  localStorage.setItem(STATIONS_KEY, JSON.stringify(stations));
  notifyStorageChange();
};