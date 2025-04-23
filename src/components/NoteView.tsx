import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  TextField,
  Checkbox,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Button,
  Tooltip
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { useNotes, Note, ChecklistItem } from '../contexts/NotesContext';

interface NoteViewProps {
  note: Note;
  onEdit: () => void;
  onDelete: () => void;
}

const NoteView: React.FC<NoteViewProps> = ({ note, onEdit, onDelete }) => {
  const { updateChecklistItem, addChecklistItem, deleteChecklistItem } = useNotes();
  const [newItemText, setNewItemText] = useState('');

  const handleAddItem = async () => {
    if (newItemText.trim()) {
      await addChecklistItem(note.id, newItemText.trim());
      setNewItemText('');
    }
  };

  const handleToggleItem = async (item: ChecklistItem) => {
    await updateChecklistItem(note.id, item.id, { isCompleted: !item.isCompleted });
  };

  const handleDeleteItem = async (itemId: string) => {
    await deleteChecklistItem(note.id, itemId);
  };

  return (
    <Paper elevation={3} sx={{ p: 3, backgroundColor: note.color }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">{note.title}</Typography>
        <Box>
          <Tooltip title="Edit note">
            <IconButton onClick={onEdit}>
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete note">
            <IconButton onClick={onDelete}>
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Typography variant="body1" sx={{ mb: 3, whiteSpace: 'pre-wrap' }}>
        {note.content}
      </Typography>

      {note.labels.length > 0 && (
        <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {note.labels.map((label) => (
            <Typography
              key={label}
              variant="caption"
              sx={{
                backgroundColor: 'rgba(0, 0, 0, 0.1)',
                padding: '2px 8px',
                borderRadius: '12px'
              }}
            >
              {label}
            </Typography>
          ))}
        </Box>
      )}

      <Divider sx={{ my: 2 }} />

      <Typography variant="h6" sx={{ mb: 2 }}>
        Checklist
      </Typography>

      <List>
        {(note.checklistItems || []).map((item) => (
          <ListItem key={item.id} dense>
            <Checkbox
              edge="start"
              checked={item.isCompleted}
              onChange={() => handleToggleItem(item)}
            />
            <ListItemText
              primary={item.text}
              sx={{
                textDecoration: item.isCompleted ? 'line-through' : 'none',
                color: item.isCompleted ? 'text.secondary' : 'text.primary'
              }}
            />
            <ListItemSecondaryAction>
              <IconButton
                edge="end"
                size="small"
                onClick={() => handleDeleteItem(item.id)}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>

      <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Add new item"
          value={newItemText}
          onChange={(e) => setNewItemText(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleAddItem();
            }
          }}
        />
        <Button
          variant="contained"
          onClick={handleAddItem}
          disabled={!newItemText.trim()}
        >
          <AddIcon />
        </Button>
      </Box>

      {note.aiSummary && (
        <Paper sx={{ mt: 3, p: 2, backgroundColor: 'rgba(255, 255, 255, 0.9)' }}>
          <Typography variant="subtitle2" color="text.secondary">
            AI Summary:
          </Typography>
          <Typography variant="body2">{note.aiSummary}</Typography>
        </Paper>
      )}

      {note.aiSuggestions && note.aiSuggestions.length > 0 && (
        <Paper sx={{ mt: 2, p: 2, backgroundColor: 'rgba(255, 255, 255, 0.9)' }}>
          <Typography variant="subtitle2" color="text.secondary">
            AI Suggestions:
          </Typography>
          <Box sx={{ mt: 1 }}>
            {note.aiSuggestions.map((suggestion, index) => (
              <Typography key={index} variant="body2" sx={{ mb: 1 }}>
                • {suggestion}
              </Typography>
            ))}
          </Box>
        </Paper>
      )}
    </Paper>
  );
};

export default NoteView; 