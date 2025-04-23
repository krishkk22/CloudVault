import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  AppBar, 
  Toolbar, 
  IconButton, 
  Tooltip,
  Paper,
  Divider,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import { 
  Save as SaveIcon, 
  ArrowBack as ArrowBackIcon,
  FormatBold as FormatBoldIcon,
  FormatItalic as FormatItalicIcon,
  FormatUnderlined as FormatUnderlinedIcon,
  FormatListBulleted as FormatListBulletedIcon,
  FormatListNumbered as FormatListNumberedIcon,
  FormatAlignLeft as FormatAlignLeftIcon,
  FormatAlignCenter as FormatAlignCenterIcon,
  FormatAlignRight as FormatAlignRightIcon,
  Image as ImageIcon,
  Link as LinkIcon,
  MoreVert as MoreVertIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  Print as PrintIcon
} from '@mui/icons-material';
import { useFiles, FileItem } from '../contexts/FileContext';
import { useNavigate } from 'react-router-dom';
import debounce from 'lodash/debounce';

interface DocumentEditorProps {
  fileId: string;
}

const DocumentEditor: React.FC<DocumentEditorProps> = ({ fileId }) => {
  const { getFileById, updateDocument } = useFiles();
  const navigate = useNavigate();
  const [document, setDocument] = useState<FileItem | null>(null);
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [formatAnchorEl, setFormatAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedText, setSelectedText] = useState('');
  const [showSaveAlert, setShowSaveAlert] = useState(false);

  useEffect(() => {
    const file = getFileById(fileId);
    if (file && file.type === 'document') {
      setDocument(file);
      setContent(file.content || '');
    } else {
      navigate('/files');
    }
  }, [fileId, getFileById, navigate]);

  const debouncedSave = useCallback(
    debounce(async (docId: string, newContent: string) => {
      try {
        setIsSaving(true);
        setSaveStatus('saving');
        await updateDocument(docId, newContent);
        setSaveStatus('saved');
        setShowSaveAlert(true);
      } catch (error) {
        console.error('Error saving document:', error);
        setSaveStatus('error');
      } finally {
        setIsSaving(false);
      }
    }, 1000),
    [updateDocument]
  );

  const handleContentChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = event.target.value;
    setContent(newContent);
    if (document) {
      debouncedSave(document.id, newContent);
    }
  };

  const handleBack = () => {
    navigate('/files');
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleFormatMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setFormatAnchorEl(event.currentTarget);
  };

  const handleFormatMenuClose = () => {
    setFormatAnchorEl(null);
  };

  const handleTextSelection = () => {
    const selection = window.getSelection();
    setSelectedText(selection?.toString() || '');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    if (!document) return;
    
    const element = window.document.createElement('a');
    const file = new Blob([content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${document.name || 'document'}.txt`;
    window.document.body.appendChild(element);
    element.click();
    window.document.body.removeChild(element);
  };

  if (!document) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={handleBack} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {document.name}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="caption" color="text.secondary">
              {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'All changes saved' : 'Error saving'}
            </Typography>
            <Tooltip title="Print">
              <IconButton onClick={handlePrint}>
                <PrintIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Download">
              <IconButton onClick={handleDownload}>
                <DownloadIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Share">
              <IconButton>
                <ShareIcon />
              </IconButton>
            </Tooltip>
            <IconButton onClick={handleMenuOpen}>
              <MoreVertIcon />
            </IconButton>
          </Box>
        </Toolbar>
        <Divider />
        <Toolbar variant="dense">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title="Bold">
              <IconButton size="small" onClick={handleFormatMenuOpen}>
                <FormatBoldIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Italic">
              <IconButton size="small" onClick={handleFormatMenuOpen}>
                <FormatItalicIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Underline">
              <IconButton size="small" onClick={handleFormatMenuOpen}>
                <FormatUnderlinedIcon />
              </IconButton>
            </Tooltip>
            <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
            <Tooltip title="Bullet List">
              <IconButton size="small" onClick={handleFormatMenuOpen}>
                <FormatListBulletedIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Numbered List">
              <IconButton size="small" onClick={handleFormatMenuOpen}>
                <FormatListNumberedIcon />
              </IconButton>
            </Tooltip>
            <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
            <Tooltip title="Align Left">
              <IconButton size="small" onClick={handleFormatMenuOpen}>
                <FormatAlignLeftIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Align Center">
              <IconButton size="small" onClick={handleFormatMenuOpen}>
                <FormatAlignCenterIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Align Right">
              <IconButton size="small" onClick={handleFormatMenuOpen}>
                <FormatAlignRightIcon />
              </IconButton>
            </Tooltip>
            <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
            <Tooltip title="Insert Image">
              <IconButton size="small">
                <ImageIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Insert Link">
              <IconButton size="small">
                <LinkIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      <Box sx={{ flexGrow: 1, p: 3, overflow: 'auto' }}>
        <Paper 
          elevation={0} 
          sx={{ 
            maxWidth: '850px', 
            margin: '0 auto',
            minHeight: '100%',
            p: 4
          }}
        >
          <TextField
            multiline
            fullWidth
            value={content}
            onChange={handleContentChange}
            onSelect={handleTextSelection}
            variant="standard"
            InputProps={{
              disableUnderline: true,
              sx: {
                fontSize: '1.1rem',
                lineHeight: 1.6,
                '& .MuiInputBase-input': {
                  padding: 0
                }
              }
            }}
          />
        </Paper>
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleDownload}>
          <ListItemIcon>
            <DownloadIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Download</ListItemText>
        </MenuItem>
        <MenuItem onClick={handlePrint}>
          <ListItemIcon>
            <PrintIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Print</ListItemText>
        </MenuItem>
        <MenuItem>
          <ListItemIcon>
            <ShareIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Share</ListItemText>
        </MenuItem>
      </Menu>

      <Menu
        anchorEl={formatAnchorEl}
        open={Boolean(formatAnchorEl)}
        onClose={handleFormatMenuClose}
      >
        <MenuItem>
          <ListItemIcon>
            <FormatBoldIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Bold</ListItemText>
        </MenuItem>
        <MenuItem>
          <ListItemIcon>
            <FormatItalicIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Italic</ListItemText>
        </MenuItem>
        <MenuItem>
          <ListItemIcon>
            <FormatUnderlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Underline</ListItemText>
        </MenuItem>
      </Menu>

      <Snackbar
        open={showSaveAlert}
        autoHideDuration={3000}
        onClose={() => setShowSaveAlert(false)}
      >
        <Alert 
          onClose={() => setShowSaveAlert(false)} 
          severity="success"
          sx={{ width: '100%' }}
        >
          All changes saved
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DocumentEditor; 