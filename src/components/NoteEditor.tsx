import React, { useState, useEffect } from 'react';
import {
  TextField,
  Button,
  Box,
  Paper,
  Typography,
  IconButton,
  Chip,
  Menu,
  MenuItem,
  CircularProgress,
  Tooltip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Checkbox
} from '@mui/material';
import {
  ColorLens as ColorLensIcon,
  Label as LabelIcon,
  AutoAwesome as AutoAwesomeIcon,
  PushPin as PushPinIcon,
  Delete as DeleteIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { useNotes, Note, ChecklistItem } from '../contexts/NotesContext';

const COLORS = [
  '#ffffff', '#f28b82', '#fbbc04', '#fff475',
  '#ccff90', '#a7ffeb', '#cbf0f8', '#aecbfa',
  '#d7aefb', '#fdcfe8', '#e6c9a8', '#e8eaed'
];

interface NoteEditorProps {
  note?: Note;
  onCancel: () => void;
}

const NoteEditor: React.FC<NoteEditorProps> = ({ note, onCancel }) => {
  const { addNote, updateNote, generateAISummary, generateAISuggestions } = useNotes();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [color, setColor] = useState('#ffffff');
  const [labels, setLabels] = useState<string[]>([]);
  const [isPinned, setIsPinned] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [colorMenuOpen, setColorMenuOpen] = useState(false);
  const [labelMenuOpen, setLabelMenuOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSummary, setAiSummary] = useState<string>('');
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
  const [newChecklistItem, setNewChecklistItem] = useState('');

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setColor(note.color);
      setLabels(note.labels || []);
      setIsPinned(note.isPinned);
      setAiSummary(note.aiSummary || '');
      setAiSuggestions(note.aiSuggestions || []);
      setChecklistItems(note.checklistItems || []);
    }
  }, [note]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    if (note) {
      await updateNote(note.id, title, content, color, labels, isPinned);
    } else {
      await addNote(title, content, color, labels);
    }
    onCancel();
  };

  const handleColorSelect = (selectedColor: string) => {
    setColor(selectedColor);
    setColorMenuOpen(false);
  };

  const handleAddLabel = () => {
    if (newLabel.trim() && !labels.includes(newLabel.trim())) {
      setLabels([...labels, newLabel.trim()]);
    }
    setNewLabel('');
    setLabelMenuOpen(false);
  };

  const handleRemoveLabel = (labelToRemove: string) => {
    setLabels(labels.filter(label => label !== labelToRemove));
  };

  const handleAddChecklistItem = () => {
    if (newChecklistItem.trim()) {
      const newItem: ChecklistItem = {
        id: crypto.randomUUID(),
        text: newChecklistItem.trim(),
        isCompleted: false
      };
      setChecklistItems([...checklistItems, newItem]);
      setNewChecklistItem('');
    }
  };

  const handleToggleChecklistItem = (itemId: string) => {
    setChecklistItems(checklistItems.map(item =>
      item.id === itemId ? { ...item, isCompleted: !item.isCompleted } : item
    ));
  };

  const handleDeleteChecklistItem = (itemId: string) => {
    setChecklistItems(checklistItems.filter(item => item.id !== itemId));
  };

  const handleGenerateAI = async () => {
    setAiLoading(true);
    try {
      const [summary, suggestions] = await Promise.all([
        generateAISummary(content),
        generateAISuggestions(content)
      ]);
      setAiSummary(summary);
      setAiSuggestions(suggestions);
    } catch (error) {
      console.error('Error generating AI content:', error);
    }
    setAiLoading(false);
  };

  return (
    <Paper elevation={3} sx={{ p: 3, backgroundColor: color }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          {note ? 'Edit Note' : 'New Note'}
        </Typography>
        <Box>
          <Tooltip title="Pin note">
            <IconButton onClick={() => setIsPinned(!isPinned)}>
              <PushPinIcon sx={{ transform: isPinned ? 'rotate(45deg)' : 'none' }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Change color">
            <IconButton onClick={() => setColorMenuOpen(true)}>
              <ColorLensIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Add label">
            <IconButton onClick={() => setLabelMenuOpen(true)}>
              <LabelIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Generate AI suggestions">
            <IconButton onClick={handleGenerateAI} disabled={aiLoading}>
              {aiLoading ? <CircularProgress size={24} /> : <AutoAwesomeIcon />}
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Box component="form" onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          margin="normal"
          required
        />
        <TextField
          fullWidth
          label="Content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          margin="normal"
          multiline
          rows={4}
          required
        />

        {labels.length > 0 && (
          <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {labels.map((label) => (
              <Chip
                key={label}
                label={label}
                onDelete={() => handleRemoveLabel(label)}
              />
            ))}
          </Box>
        )}

        <Divider sx={{ my: 2 }} />

        <Typography variant="h6" sx={{ mb: 2 }}>
          Checklist
        </Typography>

        <List>
          {checklistItems.map((item) => (
            <ListItem key={item.id} dense>
              <Checkbox
                edge="start"
                checked={item.isCompleted}
                onChange={() => handleToggleChecklistItem(item.id)}
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
                  onClick={() => handleDeleteChecklistItem(item.id)}
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
            value={newChecklistItem}
            onChange={(e) => setNewChecklistItem(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleAddChecklistItem();
              }
            }}
          />
          <Button
            variant="contained"
            onClick={handleAddChecklistItem}
            disabled={!newChecklistItem.trim()}
          >
            <AddIcon />
          </Button>
        </Box>

        {aiSummary && (
          <Paper sx={{ mt: 2, p: 2, backgroundColor: 'rgba(255, 255, 255, 0.9)' }}>
            <Typography variant="subtitle2" color="text.secondary">
              AI Summary:
            </Typography>
            <Typography variant="body2">{aiSummary}</Typography>
          </Paper>
        )}

        {aiSuggestions.length > 0 && (
          <Paper sx={{ mt: 2, p: 2, backgroundColor: 'rgba(255, 255, 255, 0.9)' }}>
            <Typography variant="subtitle2" color="text.secondary">
              AI Suggestions:
            </Typography>
            <Box sx={{ mt: 1 }}>
              {aiSuggestions.map((suggestion, index) => (
                <Typography key={index} variant="body2" sx={{ mb: 1 }}>
                  • {suggestion}
                </Typography>
              ))}
            </Box>
          </Paper>
        )}

        <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
          >
            {note ? 'Update' : 'Create'}
          </Button>
          <Button
            variant="outlined"
            onClick={onCancel}
          >
            Cancel
          </Button>
        </Box>
      </Box>

      <Menu
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={colorMenuOpen}
        onClose={() => setColorMenuOpen(false)}
      >
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, p: 1 }}>
          {COLORS.map((c) => (
            <MenuItem
              key={c}
              onClick={() => handleColorSelect(c)}
              sx={{
                width: 30,
                height: 30,
                backgroundColor: c,
                border: '1px solid #ccc',
                '&:hover': {
                  backgroundColor: c,
                },
              }}
            />
          ))}
        </Box>
      </Menu>

      <Menu
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={labelMenuOpen}
        onClose={() => setLabelMenuOpen(false)}
      >
        <Box sx={{ p: 2, minWidth: 200 }}>
          <TextField
            fullWidth
            size="small"
            label="New Label"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleAddLabel();
              }
            }}
          />
          <Button
            fullWidth
            variant="contained"
            onClick={handleAddLabel}
            sx={{ mt: 1 }}
          >
            Add Label
          </Button>
        </Box>
      </Menu>
    </Paper>
  );
};

export default NoteEditor; 