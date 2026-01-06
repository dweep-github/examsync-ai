import { Exam, ChatSession, Topic, Message } from '../types';

const STORAGE_KEY_EXAM = 'examsync_active_exam';
const STORAGE_KEY_CHAT = 'examsync_chat_history';

export const saveExam = (exam: Exam): void => {
  localStorage.setItem(STORAGE_KEY_EXAM, JSON.stringify(exam));
};

export const getActiveExam = (): Exam | null => {
  const data = localStorage.getItem(STORAGE_KEY_EXAM);
  return data ? JSON.parse(data) : null;
};

// --- Topic Operations ---

export const addTopic = (topic: Topic): Exam | null => {
  const exam = getActiveExam();
  if (!exam) return null;
  
  const updatedExam = { 
    ...exam, 
    topics: [...exam.topics, topic] 
  };
  saveExam(updatedExam);
  return updatedExam;
};

export const editTopic = (updatedTopic: Topic): Exam | null => {
  const exam = getActiveExam();
  if (!exam) return null;

  const updatedTopics = exam.topics.map(t => 
    t.id === updatedTopic.id ? updatedTopic : t
  );

  const updatedExam = { ...exam, topics: updatedTopics };
  saveExam(updatedExam);
  return updatedExam;
};

export const deleteTopic = (topicId: string): Exam | null => {
  const exam = getActiveExam();
  if (!exam) return null;

  const updatedTopics = exam.topics.filter(t => t.id !== topicId);
  const updatedExam = { ...exam, topics: updatedTopics };
  saveExam(updatedExam);
  return updatedExam;
};

export const updateTopicStatus = (topicId: string, status: Topic['status']): Exam | null => {
  const exam = getActiveExam();
  if (!exam) return null;

  const updatedTopics = exam.topics.map(t => {
    if (t.id === topicId) {
      return {
        ...t,
        status,
        completedAt: status === 'completed' ? new Date().toISOString() : undefined
      };
    }
    return t;
  });

  const updatedExam = { ...exam, topics: updatedTopics };
  saveExam(updatedExam);
  return updatedExam;
};

// --- Chat Operations ---

export const saveMessage = (message: Message): void => {
  const history = getChatHistory();
  const updatedHistory = [...history, message];
  localStorage.setItem(STORAGE_KEY_CHAT, JSON.stringify(updatedHistory));
};

export const getChatHistory = (): Message[] => {
  const data = localStorage.getItem(STORAGE_KEY_CHAT);
  return data ? JSON.parse(data) : [];
};

export const clearData = () => {
  localStorage.removeItem(STORAGE_KEY_EXAM);
  localStorage.removeItem(STORAGE_KEY_CHAT);
};