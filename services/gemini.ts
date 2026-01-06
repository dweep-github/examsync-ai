import { GoogleGenAI, Content } from "@google/genai";
import { Exam, Message } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper to calculate days remaining
const getDaysLeft = (examDate: string): number => {
  const today = new Date();
  const exam = new Date(examDate);
  const diffTime = exam.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const formatSystemPrompt = (exam: Exam): string => {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const daysLeft = getDaysLeft(exam.date);
  
  const completed = exam.topics.filter(t => t.status === 'completed').map(t => t.name).join(', ');
  const weak = exam.topics.filter(t => t.isWeak && t.status !== 'completed').map(t => t.name).join(', ');
  const pending = exam.topics.filter(t => t.status === 'pending' && !t.isWeak).map(t => t.name).join(', ');
  const skipped = exam.topics.filter(t => t.status === 'skipped').map(t => t.name).join(', ');

  return `
    You are ExamSync, a highly intelligent, date-aware study strategist.
    
    CURRENT CONTEXT:
    - Today's Date: ${today}
    - Target Exam: ${exam.name}
    - Exam Date: ${exam.date}
    - Days Remaining: ${daysLeft}
    
    STUDY STATUS:
    - Weak Topics (PRIORITY): ${weak || 'None identified'}
    - Pending Topics: ${pending || 'None'}
    - Completed: ${completed || 'None'}
    - Skipped/Wasted: ${skipped || 'None'}

    RULES:
    1. STRICTLY adapt to the timeline.
       - If daysLeft > 30: Focus on deep understanding and weak topics.
       - If daysLeft < 7: Switch to high-yield revision, past papers, and stopping new learning.
       - If daysLeft < 1: Panic control, sleep advice, quick formula sheets only.
    2. Prioritize WEAK topics immediately.
    3. If the user marks a topic as completed, congratulate briefly and suggest the next logical step.
    4. If the user says they wasted time, be firm but forgiving. Recalculate the plan.
    5. Be concise. Do not write generic "eat healthy" tips unless specifically asked about stress.
    6. Maintain a calm, professional, yet motivating persona.
    7. If the exam is in the past (daysLeft < 0), ask how it went and suggest archiving this exam.

    FORMATTING & TONE:
    - Use **bold** for key topics, dates, or action items.
    - Use emojis generously to keep the vibe friendly and encouraging 📅 🚀 🧠.
    - Use bullet points for lists.
    - Keep paragraphs short and readable.
  `;
};

export const generateAIResponse = async (
  history: Message[], 
  exam: Exam, 
  userMessage: string
): Promise<string> => {
  try {
    const systemInstruction = formatSystemPrompt(exam);
    
    // 1. Convert existing history to Gemini Content format
    const chatHistory: Content[] = history.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.text }]
    }));

    // 2. THE FIX: Add system instructions as a "User" message manually.
    // This bypasses the error because we are not using the 'systemInstruction' config field.
    const augmentedHistory: Content[] = [
      {
        role: 'user',
        parts: [{ text: systemInstruction + "\n\n(Acknowledge this context and wait for my query.)" }]
      },
      {
        role: 'model',
        parts: [{ text: "Understood. I am ExamSync, ready to help you study." }]
      },
      ...chatHistory
    ];

    const chat = ai.chats.create({
      model: 'gemma-3-27b-it',
      history: augmentedHistory,
      config: {
        // systemInstruction removed to prevent "Developer instruction not enabled" error
        temperature: 0.7,
      }
    });

    const result = await chat.sendMessage({ message: userMessage });
    return result.text || "I'm having trouble thinking of a study plan right now. Try again? 🤔";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I couldn't connect to the study brain 🔌. Please check your internet or API key.";
  }
};