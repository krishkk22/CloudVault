import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { 
  Container, 
  CssBaseline, 
  AppBar, 
  Toolbar, 
  Typography, 
  Button,
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton
} from '@mui/material';
import { 
  Note as NoteIcon,
  Folder as FolderIcon,
  Star as StarIcon,
  Menu as MenuIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotesProvider } from './contexts/NotesContext';
import { FileProvider } from './contexts/FileContext';
import Login from './components/Login';
import NoteList from './components/NoteList';
import NoteEditor from './components/NoteEditor';
import FileBrowser from './components/FileBrowser';
import DocumentEditor from './components/DocumentEditor';
import MediaViewer from './components/MediaViewer';
import { Note } from './contexts/NotesContext';

const DRAWER_WIDTH = 240;

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  return currentUser ? <>{children}</> : <Navigate to="/login" />;
};

const Dashboard: React.FC = () => {
  const { logout } = useAuth();
  const [editingNote, setEditingNote] = useState<Note | undefined>();
  const [isCreating, setIsCreating] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [activeView, setActiveView] = useState<'notes' | 'files' | 'starred'>('files');

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setIsCreating(false);
  };

  const handleCancel = () => {
    setEditingNote(undefined);
    setIsCreating(false);
  };

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleViewChange = (view: 'notes' | 'files' | 'starred') => {
    setActiveView(view);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={toggleDrawer}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Cloud Drive
          </Typography>
          <Button color="inherit" onClick={logout} startIcon={<LogoutIcon />}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="persistent"
        anchor="left"
        open={drawerOpen}
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            <ListItemButton 
              onClick={() => handleViewChange('files')}
              selected={activeView === 'files'}
            >
              <ListItemIcon>
                <FolderIcon />
              </ListItemIcon>
              <ListItemText primary="My Drive" />
            </ListItemButton>
            <ListItemButton 
              onClick={() => handleViewChange('notes')}
              selected={activeView === 'notes'}
            >
              <ListItemIcon>
                <NoteIcon />
              </ListItemIcon>
              <ListItemText primary="Notes" />
            </ListItemButton>
            <ListItemButton 
              onClick={() => handleViewChange('starred')}
              selected={activeView === 'starred'}
            >
              <ListItemIcon>
                <StarIcon />
              </ListItemIcon>
              <ListItemText primary="Starred" />
            </ListItemButton>
          </List>
          <Divider />
        </Box>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        {activeView === 'notes' ? (
          <Container maxWidth="md">
            {editingNote || isCreating ? (
              <NoteEditor
                note={editingNote}
                onCancel={handleCancel}
              />
            ) : (
              <>
                <Box sx={{ mb: 4, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => setIsCreating(true)}
                  >
                    New Note
                  </Button>
                </Box>
                <NoteList onEditNote={handleEditNote} />
              </>
            )}
          </Container>
        ) : activeView === 'starred' ? (
          <FileBrowser showStarredOnly={true} />
        ) : (
          <FileBrowser />
        )}
      </Box>
    </Box>
  );
};

const DocumentEditorRoute: React.FC = () => {
  const { fileId } = useParams<{ fileId: string }>();
  return fileId ? <DocumentEditor fileId={fileId} /> : <Navigate to="/files" />;
};

const MediaViewerRoute: React.FC = () => {
  const { fileId } = useParams<{ fileId: string }>();
  return fileId ? <MediaViewer fileId={fileId} /> : <Navigate to="/files" />;
};

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <NotesProvider>
          <FileProvider>
            <CssBaseline />
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                path="/"
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/files"
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/document/:fileId"
                element={
                  <PrivateRoute>
                    <DocumentEditorRoute />
                  </PrivateRoute>
                }
              />
              <Route
                path="/media/:fileId"
                element={
                  <PrivateRoute>
                    <MediaViewerRoute />
                  </PrivateRoute>
                }
              />
            </Routes>
          </FileProvider>
        </NotesProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
