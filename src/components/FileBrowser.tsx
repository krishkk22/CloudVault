import React, { useState, useRef } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  CardActions, 
  IconButton, 
  Button, 
  TextField, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  Breadcrumbs,
  Link,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Tooltip,
  Alert,
  Snackbar,
  ToggleButton,
  ToggleButtonGroup,
  Paper,
  InputAdornment,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon as MuiListItemIcon,
  ListItemText as MuiListItemText,
  Grid
} from '@mui/material';
import { 
  Folder as FolderIcon, 
  Description as DocumentIcon, 
  Image as ImageIcon, 
  Videocam as VideoIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  MoreVert as MoreVertIcon,
  Share as ShareIcon,
  Delete as DeleteIcon,
  CreateNewFolder as CreateNewFolderIcon,
  Upload as UploadIcon,
  Add as AddIcon,
  Search as SearchIcon,
  ViewModule as GridViewIcon,
  ViewList as ListViewIcon,
  DriveFileRenameOutline as RenameIcon,
  Download as DownloadIcon,
  OpenInNew as OpenInNewIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { useFiles, FileItem } from '../contexts/FileContext';
import { useNavigate } from 'react-router-dom';

interface FileBrowserProps {
  showStarredOnly?: boolean;
}

const FileBrowser: React.FC<FileBrowserProps> = ({ showStarredOnly = false }) => {
  const { 
    files, 
    currentFolder, 
    breadcrumbs, 
    uploadFile, 
    createFolder, 
    createDocument, 
    deleteFile, 
    navigateToFolder,
    toggleStar,
    testFirestoreConnection,
    testStorageConnection
  } = useFiles();
  
  const navigate = useNavigate();
  const [newFolderName, setNewFolderName] = useState('');
  const [newDocumentName, setNewDocumentName] = useState('');
  const [isNewFolderDialogOpen, setIsNewFolderDialogOpen] = useState(false);
  const [isNewDocumentDialogOpen, setIsNewDocumentDialogOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [testResult, setTestResult] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  });

  // Filter files based on showStarredOnly prop and search query
  const displayedFiles = (showStarredOnly 
    ? files.filter(file => file.isStarred) 
    : files
  ).filter(file => 
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleFileClick = (file: FileItem) => {
    if (file.type === 'folder') {
      navigateToFolder(file.id);
    } else if (file.type === 'document') {
      navigate(`/document/${file.id}`);
    } else if (file.type === 'image' || file.type === 'video') {
      navigate(`/media/${file.id}`);
    }
  };

  const handleBreadcrumbClick = (id: string) => {
    if (id === 'root') {
      navigateToFolder(null);
    } else {
      navigateToFolder(id);
    }
  };

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      createFolder(newFolderName.trim());
      setNewFolderName('');
      setIsNewFolderDialogOpen(false);
    }
  };

  const handleCreateDocument = () => {
    if (newDocumentName.trim()) {
      createDocument(newDocumentName.trim(), '');
      setNewDocumentName('');
      setIsNewDocumentDialogOpen(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      Array.from(files).forEach(file => {
        uploadFile(file);
      });
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, file: FileItem) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedFile(file);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedFile(null);
  };

  const handleDelete = () => {
    if (selectedFile) {
      deleteFile(selectedFile.id);
      handleMenuClose();
    }
  };

  const handleToggleStar = () => {
    if (selectedFile) {
      toggleStar(selectedFile.id);
      handleMenuClose();
    }
  };

  const handleViewModeChange = (event: React.MouseEvent<HTMLElement>, newMode: 'grid' | 'list') => {
    if (newMode !== null) {
      setViewMode(newMode);
    }
  };

  const handleCloseTestResult = () => {
    setTestResult({ ...testResult, open: false });
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'folder':
        return <FolderIcon sx={{ fontSize: 40, color: '#FFA000' }} />;
      case 'document':
        return <DocumentIcon sx={{ fontSize: 40, color: '#1976D2' }} />;
      case 'image':
        return <ImageIcon sx={{ fontSize: 40, color: '#4CAF50' }} />;
      case 'video':
        return <VideoIcon sx={{ fontSize: 40, color: '#F44336' }} />;
      default:
        return <DocumentIcon sx={{ fontSize: 40 }} />;
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const formatDate = (timestamp: any) => {
    if (timestamp instanceof Date) {
      return timestamp.toLocaleDateString();
    }
    if (typeof timestamp === 'number') {
      return new Date(timestamp).toLocaleDateString();
    }
    // Handle Firestore Timestamp
    if (timestamp?.toDate) {
      return timestamp.toDate().toLocaleDateString();
    }
    return 'Unknown date';
  };

  const renderGridView = () => (
    <Box sx={{ flexGrow: 1 }}>
      <Grid container spacing={2}>
        {displayedFiles.map((file) => (
          <Box 
            key={file.id}
            sx={{ 
              width: { xs: '100%', sm: '50%', md: '33.33%', lg: '25%' },
              p: 1
            }}
          >
            <Card 
              sx={{ 
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                '&:hover': {
                  boxShadow: 6,
                  '& .file-actions': {
                    opacity: 1
                  }
                }
              }}
              onClick={() => handleFileClick(file)}
            >
              <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  {getFileIcon(file.type)}
                  <Typography variant="h6" component="div" sx={{ ml: 1, flexGrow: 1 }}>
                    {file.name}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {formatFileSize(file.size)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {formatDate(file.updatedAt)}
                </Typography>
              </CardContent>
              <CardActions 
                className="file-actions"
                sx={{ 
                  opacity: 0,
                  transition: 'opacity 0.2s',
                  justifyContent: 'flex-end',
                  p: 1
                }}
              >
                <IconButton 
                  size="small" 
                  onClick={() => handleFileClick(file)}
                  title="Open"
                >
                  <OpenInNewIcon />
                </IconButton>
                <IconButton 
                  size="small" 
                  onClick={(e: React.MouseEvent<HTMLElement>) => handleMenuOpen(e, file)}
                  title="Rename"
                >
                  <EditIcon />
                </IconButton>
                <IconButton 
                  size="small" 
                  onClick={() => handleDelete()}
                  title="Delete"
                >
                  <DeleteIcon />
                </IconButton>
              </CardActions>
            </Card>
          </Box>
        ))}
      </Grid>
    </Box>
  );

  const renderListView = () => (
    <List>
      {displayedFiles.map((file) => (
        <ListItem
          key={file.id}
          disablePadding
          secondaryAction={
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton 
                edge="end" 
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleStar(file.id);
                }}
              >
                {file.isStarred ? <StarIcon color="warning" /> : <StarBorderIcon />}
              </IconButton>
              <IconButton 
                edge="end" 
                size="small"
                onClick={(e) => handleMenuOpen(e, file)}
              >
                <MoreVertIcon />
              </IconButton>
            </Box>
          }
        >
          <ListItemButton onClick={() => handleFileClick(file)}>
            <MuiListItemIcon>
              {getFileIcon(file.type)}
            </MuiListItemIcon>
            <MuiListItemText 
              primary={file.name}
              secondary={file.size ? formatFileSize(file.size) : ''}
            />
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Breadcrumbs sx={{ flexGrow: 1 }}>
            {breadcrumbs.map((crumb, index) => (
              <Link
                key={crumb.id}
                component="button"
                variant="body1"
                onClick={() => handleBreadcrumbClick(crumb.id)}
                sx={{ 
                  textDecoration: 'none',
                  color: index === breadcrumbs.length - 1 ? 'text.primary' : 'primary.main'
                }}
              >
                {crumb.name}
              </Link>
            ))}
          </Breadcrumbs>
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={handleViewModeChange}
            size="small"
          >
            <ToggleButton value="grid">
              <GridViewIcon />
            </ToggleButton>
            <ToggleButton value="list">
              <ListViewIcon />
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField
            size="small"
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ flexGrow: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant="contained"
            startIcon={<CreateNewFolderIcon />}
            onClick={() => setIsNewFolderDialogOpen(true)}
          >
            New Folder
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setIsNewDocumentDialogOpen(true)}
          >
            New Document
          </Button>
          <Button
            variant="contained"
            startIcon={<UploadIcon />}
            onClick={() => fileInputRef.current?.click()}
          >
            Upload
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleFileUpload}
            multiple
          />
        </Box>
      </Paper>

      {viewMode === 'grid' ? renderGridView() : renderListView()}

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleToggleStar}>
          <ListItemIcon>
            {selectedFile?.isStarred ? <StarIcon /> : <StarBorderIcon />}
          </ListItemIcon>
          <ListItemText>
            {selectedFile?.isStarred ? 'Remove from starred' : 'Add to starred'}
          </ListItemText>
        </MenuItem>
        <MenuItem>
          <ListItemIcon>
            <ShareIcon />
          </ListItemIcon>
          <ListItemText>Share</ListItemText>
        </MenuItem>
        <MenuItem>
          <ListItemIcon>
            <RenameIcon />
          </ListItemIcon>
          <ListItemText>Rename</ListItemText>
        </MenuItem>
        <MenuItem>
          <ListItemIcon>
            <DownloadIcon />
          </ListItemIcon>
          <ListItemText>Download</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleDelete}>
          <ListItemIcon>
            <DeleteIcon />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      <Dialog open={isNewFolderDialogOpen} onClose={() => setIsNewFolderDialogOpen(false)}>
        <DialogTitle>Create New Folder</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Folder Name"
            fullWidth
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsNewFolderDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateFolder} variant="contained">Create</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={isNewDocumentDialogOpen} onClose={() => setIsNewDocumentDialogOpen(false)}>
        <DialogTitle>Create New Document</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Document Name"
            fullWidth
            value={newDocumentName}
            onChange={(e) => setNewDocumentName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsNewDocumentDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateDocument} variant="contained">Create</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={testResult.open}
        autoHideDuration={6000}
        onClose={handleCloseTestResult}
      >
        <Alert onClose={handleCloseTestResult} severity={testResult.severity}>
          {testResult.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default FileBrowser; 