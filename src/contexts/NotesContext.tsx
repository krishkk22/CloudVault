import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp,
  arrayUnion
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './AuthContext';

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  userId: string;
  color: string;
  labels: string[];
  isPinned: boolean;
  aiSummary?: string;
  aiSuggestions?: string[];
  viewMode: 'grid' | 'list';
  checklistItems: ChecklistItem[];
}

export interface ChecklistItem {
  id: string;
  text: string;
  isCompleted: boolean;
}

interface NotesContextType {
  notes: Note[];
  addNote: (title: string, content: string, color?: string, labels?: string[]) => Promise<void>;
  updateNote: (id: string, title: string, content: string, color?: string, labels?: string[], isPinned?: boolean) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  togglePin: (id: string) => Promise<void>;
  generateAISummary: (content: string) => Promise<string>;
  generateAISuggestions: (content: string) => Promise<string[]>;
  toggleViewMode: () => void;
  viewMode: 'grid' | 'list';
  addChecklistItem: (noteId: string, text: string) => Promise<void>;
  updateChecklistItem: (noteId: string, itemId: string, updates: Partial<ChecklistItem>) => Promise<void>;
  deleteChecklistItem: (noteId: string, itemId: string) => Promise<void>;
}

const NotesContext = createContext<NotesContextType | null>(null);

export const useNotes = () => {
  const context = useContext(NotesContext);
  if (!context) {
    throw new Error('useNotes must be used within a NotesProvider');
  }
  return context;
};

export const NotesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) {
      setNotes([]);
      return;
    }

    const q = query(
      collection(db, 'notes'),
      where('userId', '==', currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notesData: Note[] = [];
      snapshot.forEach((doc) => {
        notesData.push({ id: doc.id, ...doc.data() } as Note);
      });
      setNotes(notesData.sort((a, b) => {
        if (a.isPinned !== b.isPinned) {
          return a.isPinned ? -1 : 1;
        }
        return b.updatedAt.toMillis() - a.updatedAt.toMillis();
      }));
    });

    return () => unsubscribe();
  }, [currentUser]);

  const addNote = async (title: string, content: string, color = '#ffffff', labels: string[] = []) => {
    if (!currentUser) return;

    const now = Timestamp.now();
    await addDoc(collection(db, 'notes'), {
      title,
      content,
      createdAt: now,
      updatedAt: now,
      userId: currentUser.uid,
      color,
      labels,
      isPinned: false,
      viewMode: 'grid',
      checklistItems: []
    });
  };

  const updateNote = async (
    id: string, 
    title: string, 
    content: string, 
    color?: string, 
    labels?: string[],
    isPinned?: boolean
  ) => {
    const noteRef = doc(db, 'notes', id);
    const updateData: any = {
      title,
      content,
      updatedAt: Timestamp.now()
    };
    
    if (color !== undefined) updateData.color = color;
    if (labels !== undefined) updateData.labels = labels;
    if (isPinned !== undefined) updateData.isPinned = isPinned;
    
    await updateDoc(noteRef, updateData);
  };

  const deleteNote = async (id: string) => {
    const noteRef = doc(db, 'notes', id);
    await deleteDoc(noteRef);
  };

  const togglePin = async (id: string) => {
    const note = notes.find(n => n.id === id);
    if (note) {
      await updateNote(id, note.title, note.content, note.color, note.labels, !note.isPinned);
    }
  };

  const toggleViewMode = () => {
    setViewMode(prev => prev === 'grid' ? 'list' : 'grid');
  };

  const generateAISummary = async (content: string): Promise<string> => {
    // TODO: Implement OpenAI API call for summarization
    return "AI Summary will be implemented here";
  };

  const generateAISuggestions = async (content: string): Promise<string[]> => {
    // TODO: Implement OpenAI API call for suggestions
    return ["Suggestion 1", "Suggestion 2", "Suggestion 3"];
  };

  const addChecklistItem = async (noteId: string, text: string) => {
    // Implementation needed
  };

  const updateChecklistItem = async (noteId: string, itemId: string, updates: Partial<ChecklistItem>) => {
    // Implementation needed
  };

  const deleteChecklistItem = async (noteId: string, itemId: string) => {
    // Implementation needed
  };

  const value = {
    notes,
    addNote,
    updateNote,
    deleteNote,
    togglePin,
    generateAISummary,
    generateAISuggestions,
    toggleViewMode,
    viewMode,
    addChecklistItem,
    updateChecklistItem,
    deleteChecklistItem
  };

  return (
    <NotesContext.Provider value={value}>
      {children}
    </NotesContext.Provider>
  );
}; 