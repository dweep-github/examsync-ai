export interface Topic {
  id: string;
  name: string;
  description?: string;
  startDate?: string; // ISO Date string
  endDate?: string; // ISO Date string
  isWeak: boolean;
  status: 'pending' | 'completed' | 'skipped';
  completedAt?: string; // ISO Date string
}

export interface Exam {
  id: string;
  name: string;
  date: string; // ISO Date string
  subjects: string[];
  topics: Topic[];
  isCompleted: boolean;
  createdAt: string;
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface ChatSession {
  examId: string;
  messages: Message[];
}