
export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export interface User {
  name: string;
  email: string;
  avatar: string;
}

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface TaskLocation {
  latitude: number;
  longitude: number;
  name: string;
  radius: number; // in meters
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate?: string; // ISO string
  priority: Priority;
  projectId: string;
  tags: string[];
  completed: boolean;
  subTasks: SubTask[];
  locationReminders?: TaskLocation[];
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export interface VaultItem {
  id: string;
  type: 'image' | 'video';
  url: string; // Base64 or Blob URL
  name: string;
  createdAt: string;
}

export interface AppState {
  tasks: Task[];
  projects: Project[];
  activeProjectId: string;
  searchQuery: string;
  isDarkMode: boolean;
  view: 'list' | 'calendar' | 'vault';
  user: User | null;
}

export interface NLPParseResult {
  title: string;
  dueDate?: string;
  priority?: Priority;
  tags?: string[];
  projectName?: string;
}
