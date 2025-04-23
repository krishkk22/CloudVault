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
  orderBy
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject,
  listAll
} from 'firebase/storage';
import { db, storage } from '../firebase';
import { useAuth } from './AuthContext';

export interface FileItem {
  id: string;
  name: string;
  type: 'document' | 'image' | 'video' | 'folder';
  url?: string;
  content?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  userId: string;
  parentId?: string;
  size?: number;
  isStarred: boolean;
  isShared: boolean;
  sharedWith?: string[];
  thumbnailUrl?: string;
}

interface FileContextType {
  files: FileItem[];
  currentFolder: string | null;
  breadcrumbs: { id: string; name: string }[];
  uploadFile: (file: File, parentId?: string) => Promise<void>;
  createFolder: (name: string, parentId?: string) => Promise<void>;
  createDocument: (name: string, content: string, parentId?: string) => Promise<void>;
  updateDocument: (id: string, content: string) => Promise<void>;
  deleteFile: (id: string) => Promise<void>;
  navigateToFolder: (folderId: string | null) => void;
  toggleStar: (id: string) => Promise<void>;
  shareFile: (id: string, userEmail: string) => Promise<void>;
  getFileById: (id: string) => FileItem | undefined;
  testFirestoreConnection: () => Promise<boolean>;
  testStorageConnection: () => Promise<boolean>;
}

const FileContext = createContext<FileContextType | null>(null);

export const useFiles = () => {
  const context = useContext(FileContext);
  if (!context) {
    throw new Error('useFiles must be used within a FileProvider');
  }
  return context;
};

export const FileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<{ id: string; name: string }[]>([
    { id: 'root', name: 'My Drive' }
  ]);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) {
      setFiles([]);
      return;
    }

    const q = query(
      collection(db, 'files'),
      where('userId', '==', currentUser.uid),
      where('parentId', '==', currentFolder || null),
      orderBy('type'),
      orderBy('name')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const filesData: FileItem[] = [];
      snapshot.forEach((doc) => {
        filesData.push({ id: doc.id, ...doc.data() } as FileItem);
      });
      setFiles(filesData);
    });

    return () => unsubscribe();
  }, [currentUser, currentFolder]);

  const uploadFile = async (file: File, parentId?: string) => {
    if (!currentUser) {
      console.error('Cannot upload file: User not authenticated');
      return;
    }

    try {
      const fileType = file.type.startsWith('image/') 
        ? 'image' 
        : file.type.startsWith('video/') 
          ? 'video' 
          : 'document';
      
      console.log('Uploading file:', file.name, 'Type:', fileType);
      
      const storageRef = ref(storage, `users/${currentUser.uid}/${Date.now()}_${file.name}`);
      console.log('Storage reference created:', storageRef.fullPath);
      
      await uploadBytes(storageRef, file);
      console.log('File uploaded to storage');
      
      const url = await getDownloadURL(storageRef);
      console.log('Download URL obtained:', url);
      
      const now = Timestamp.now();
      const fileData = {
        name: file.name,
        type: fileType,
        url,
        createdAt: now,
        updatedAt: now,
        userId: currentUser.uid,
        parentId: parentId || currentFolder,
        size: file.size,
        isStarred: false,
        isShared: false
      };
      
      console.log('Adding file document to Firestore:', fileData);
      const docRef = await addDoc(collection(db, 'files'), fileData);
      console.log('File document added with ID:', docRef.id);
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error; // Re-throw to allow UI to handle the error
    }
  };

  const createFolder = async (name: string, parentId?: string) => {
    if (!currentUser) {
      console.error('Cannot create folder: User not authenticated');
      return;
    }

    try {
      console.log('Creating folder:', name, 'Parent ID:', parentId || currentFolder);
      
      const now = Timestamp.now();
      const folderData = {
        name,
        type: 'folder',
        createdAt: now,
        updatedAt: now,
        userId: currentUser.uid,
        parentId: parentId || currentFolder,
        isStarred: false,
        isShared: false
      };
      
      console.log('Adding folder document to Firestore:', folderData);
      const docRef = await addDoc(collection(db, 'files'), folderData);
      console.log('Folder document added with ID:', docRef.id);
    } catch (error) {
      console.error('Error creating folder:', error);
      throw error; // Re-throw to allow UI to handle the error
    }
  };

  const createDocument = async (name: string, content: string, parentId?: string) => {
    if (!currentUser) {
      console.error('Cannot create document: User not authenticated');
      return;
    }

    try {
      console.log('Creating document:', name, 'Parent ID:', parentId || currentFolder);
      
      const now = Timestamp.now();
      const documentData = {
        name,
        type: 'document',
        content,
        createdAt: now,
        updatedAt: now,
        userId: currentUser.uid,
        parentId: parentId || currentFolder,
        isStarred: false,
        isShared: false
      };
      
      console.log('Adding document to Firestore:', documentData);
      const docRef = await addDoc(collection(db, 'files'), documentData);
      console.log('Document added with ID:', docRef.id);
    } catch (error) {
      console.error('Error creating document:', error);
      throw error; // Re-throw to allow UI to handle the error
    }
  };

  const updateDocument = async (id: string, content: string) => {
    const fileRef = doc(db, 'files', id);
    await updateDoc(fileRef, {
      content,
      updatedAt: Timestamp.now()
    });
  };

  const deleteFile = async (id: string) => {
    const file = files.find(f => f.id === id);
    if (!file) return;

    const fileRef = doc(db, 'files', id);
    await deleteDoc(fileRef);

    // If it's a file with a URL (image, video, document), delete from storage
    if (file.url) {
      try {
        // Extract the storage path from the URL
        // The URL format is: https://firebasestorage.googleapis.com/v0/b/[bucket]/o/users%2F[userId]%2F[filename]
        const urlObj = new URL(file.url);
        const pathSegments = urlObj.pathname.split('/o/')[1];
        if (pathSegments) {
          const storagePath = decodeURIComponent(pathSegments);
          const storageRef = ref(storage, storagePath);
          await deleteObject(storageRef);
        }
      } catch (error) {
        console.error('Error deleting file from storage:', error);
      }
    }
  };

  const navigateToFolder = (folderId: string | null) => {
    setCurrentFolder(folderId);
    
    if (folderId === null) {
      setBreadcrumbs([{ id: 'root', name: 'My Drive' }]);
    } else {
      // Find the folder to navigate to
      const folder = files.find(f => f.id === folderId);
      if (folder) {
        // Create a new breadcrumb path starting from root
        const newBreadcrumbs = [{ id: 'root', name: 'My Drive' }];
        
        // If the folder has a parent, we need to find the path to it
        if (folder.parentId) {
          // This is a simplified approach - in a real app, you might need to
          // recursively find the path to the parent folder
          const parentFolder = files.find(f => f.id === folder.parentId);
          if (parentFolder) {
            newBreadcrumbs.push({ id: parentFolder.id, name: parentFolder.name });
          }
        }
        
        // Add the current folder to the path
        newBreadcrumbs.push({ id: folder.id, name: folder.name });
        
        setBreadcrumbs(newBreadcrumbs);
      }
    }
  };

  const toggleStar = async (id: string) => {
    const file = files.find(f => f.id === id);
    if (!file) return;

    const fileRef = doc(db, 'files', id);
    await updateDoc(fileRef, {
      isStarred: !file.isStarred
    });
  };

  const shareFile = async (id: string, userEmail: string) => {
    // This would require a user lookup by email and then updating the file
    // For now, we'll just mark it as shared
    const fileRef = doc(db, 'files', id);
    await updateDoc(fileRef, {
      isShared: true,
      sharedWith: [userEmail]
    });
  };

  const getFileById = (id: string) => {
    return files.find(f => f.id === id);
  };

  // Test function to check Firestore connectivity
  const testFirestoreConnection = async (): Promise<boolean> => {
    if (!currentUser) {
      console.error('Cannot test Firestore: User not authenticated');
      return false;
    }

    try {
      console.log('Testing Firestore connection...');
      const testCollection = collection(db, 'test');
      const testDoc = await addDoc(testCollection, { 
        test: 'test', 
        timestamp: Timestamp.now(),
        userId: currentUser.uid
      });
      console.log('Test document added successfully with ID:', testDoc.id);
      
      // Clean up the test document
      await deleteDoc(doc(db, 'test', testDoc.id));
      console.log('Test document deleted successfully');
      
      return true;
    } catch (error) {
      console.error('Error testing Firestore connection:', error);
      return false;
    }
  };

  // Test function to check Storage connectivity
  const testStorageConnection = async (): Promise<boolean> => {
    if (!currentUser) {
      console.error('Cannot test Storage: User not authenticated');
      return false;
    }

    try {
      console.log('Testing Storage connection...');
      const testRef = ref(storage, `users/${currentUser.uid}/test.txt`);
      const testBlob = new Blob(['test'], { type: 'text/plain' });
      await uploadBytes(testRef, testBlob);
      console.log('Test file uploaded successfully');
      
      const url = await getDownloadURL(testRef);
      console.log('Test file URL:', url);
      
      // Clean up the test file
      await deleteObject(testRef);
      console.log('Test file deleted successfully');
      
      return true;
    } catch (error) {
      console.error('Error testing Storage connection:', error);
      return false;
    }
  };

  const value = {
    files,
    currentFolder,
    breadcrumbs,
    uploadFile,
    createFolder,
    createDocument,
    updateDocument,
    deleteFile,
    navigateToFolder,
    toggleStar,
    shareFile,
    getFileById,
    testFirestoreConnection,
    testStorageConnection
  };

  return (
    <FileContext.Provider value={value}>
      {children}
    </FileContext.Provider>
  );
}; 