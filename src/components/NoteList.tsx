import React from 'react';
import { 
  List, 
  ListItem, 
  ListItemText, 
  IconButton, 
  Paper, 
  Typography,
  Box
} from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import { useNotes, Note } from '../contexts/NotesContext';

interface NoteListProps {
  onEditNote: (note: Note) => void;
}

const NoteList: React.FC<NoteListProps> = ({ onEditNote }) => {
  const { notes, deleteNote } = useNotes();

  if (notes.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Typography variant="body1" color="text.secondary">
          No notes yet. Create your first note!
        </Typography>
      </Box>
    );
  }

  return (
    <List>
      {notes.map((note) => (
        <Paper 
          key={note.id} 
          elevation={1} 
          sx={{ mb: 2, p: 2 }}
        >
          <ListItem
            secondaryAction={
              <Box>
                <IconButton 
                  edge="end" 
                  aria-label="edit"
                  onClick={() => onEditNote(note)}
                  sx={{ mr: 1 }}
                >
                  <EditIcon />
                </IconButton>
                <IconButton 
                  edge="end" 
                  aria-label="delete"
                  onClick={() => deleteNote(note.id)}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            }
          >
            <ListItemText
              primary={note.title}
              secondary={
                <>
                  <Typography
                    component="span"
                    variant="body2"
                    color="text.primary"
                    sx={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {note.content}
                  </Typography>
                  <Typography
                    component="span"
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: 'block', mt: 1 }}
                  >
                    Last updated: {note.updatedAt.toDate().toLocaleString()}
                  </Typography>
                </>
              }
            />
          </ListItem>
        </Paper>
      ))}
    </List>
  );
};

export default NoteList; 