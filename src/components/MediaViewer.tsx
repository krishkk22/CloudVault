import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  IconButton, 
  AppBar, 
  Toolbar, 
  Paper,
  Slider,
  Button,
  Tooltip,
  CircularProgress
} from '@mui/material';
import { 
  ArrowBack as ArrowBackIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  VolumeUp as VolumeUpIcon,
  VolumeOff as VolumeOffIcon,
  Fullscreen as FullscreenIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  MoreVert as MoreVertIcon
} from '@mui/icons-material';
import { useFiles, FileItem } from '../contexts/FileContext';
import { useNavigate } from 'react-router-dom';

interface MediaViewerProps {
  fileId: string;
}

const MediaViewer: React.FC<MediaViewerProps> = ({ fileId }) => {
  const { getFileById } = useFiles();
  const navigate = useNavigate();
  const [file, setFile] = useState<FileItem | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const mediaRef = React.useRef<HTMLVideoElement | HTMLImageElement>(null);

  useEffect(() => {
    const mediaFile = getFileById(fileId);
    if (mediaFile && (mediaFile.type === 'image' || mediaFile.type === 'video')) {
      setFile(mediaFile);
    } else {
      navigate('/files');
    }
  }, [fileId, getFileById, navigate]);

  const handleBack = () => {
    navigate('/files');
  };

  const handlePlayPause = () => {
    if (file?.type === 'video' && mediaRef.current) {
      if (isPlaying) {
        (mediaRef.current as HTMLVideoElement).pause();
      } else {
        (mediaRef.current as HTMLVideoElement).play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (file?.type === 'video' && mediaRef.current) {
      setCurrentTime((mediaRef.current as HTMLVideoElement).currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (file?.type === 'video' && mediaRef.current) {
      setDuration((mediaRef.current as HTMLVideoElement).duration);
    }
    setIsLoading(false);
  };

  const handleSeek = (event: Event, newValue: number | number[]) => {
    if (file?.type === 'video' && mediaRef.current) {
      const time = Array.isArray(newValue) ? newValue[0] : newValue;
      (mediaRef.current as HTMLVideoElement).currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleVolumeChange = (event: Event, newValue: number | number[]) => {
    if (file?.type === 'video' && mediaRef.current) {
      const newVolume = Array.isArray(newValue) ? newValue[0] : newValue;
      (mediaRef.current as HTMLVideoElement).volume = newVolume;
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
    }
  };

  const handleMuteToggle = () => {
    if (file?.type === 'video' && mediaRef.current) {
      const video = mediaRef.current as HTMLVideoElement;
      video.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleFullscreen = () => {
    if (mediaRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        mediaRef.current.requestFullscreen();
      }
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleDownload = () => {
    if (!file?.url) return;
    
    const element = window.document.createElement('a');
    element.href = file.url;
    element.download = file.name;
    window.document.body.appendChild(element);
    element.click();
    window.document.body.removeChild(element);
  };

  if (!file) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'black' }}>
      <AppBar position="static" color="transparent" elevation={0}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={handleBack} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, color: 'white' }}>
            {file.name}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Download">
              <IconButton color="inherit" onClick={handleDownload}>
                <DownloadIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Share">
              <IconButton color="inherit">
                <ShareIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="More">
              <IconButton color="inherit">
                <MoreVertIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', p: 3 }}>
        <Paper 
          elevation={0} 
          sx={{ 
            maxWidth: '100%', 
            maxHeight: '100%',
            bgcolor: 'transparent',
            position: 'relative'
          }}
        >
          {isLoading && (
            <Box sx={{ 
              position: 'absolute', 
              top: '50%', 
              left: '50%', 
              transform: 'translate(-50%, -50%)',
              zIndex: 1
            }}>
              <CircularProgress />
            </Box>
          )}
          
          {file.type === 'image' ? (
            <img
              ref={mediaRef as React.RefObject<HTMLImageElement>}
              src={file.url}
              alt={file.name}
              style={{ 
                maxWidth: '100%', 
                maxHeight: 'calc(100vh - 200px)',
                objectFit: 'contain'
              }}
            />
          ) : (
            <video
              ref={mediaRef as React.RefObject<HTMLVideoElement>}
              src={file.url}
              style={{ 
                maxWidth: '100%', 
                maxHeight: 'calc(100vh - 200px)',
                objectFit: 'contain'
              }}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onEnded={() => setIsPlaying(false)}
            />
          )}
        </Paper>
      </Box>

      {file.type === 'video' && (
        <Paper 
          elevation={0} 
          sx={{ 
            p: 2, 
            bgcolor: 'rgba(0, 0, 0, 0.8)',
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton color="inherit" onClick={handlePlayPause}>
              {isPlaying ? <PauseIcon /> : <PlayIcon />}
            </IconButton>
            
            <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="caption" sx={{ color: 'white', minWidth: 45 }}>
                {formatTime(currentTime)}
              </Typography>
              <Slider
                value={currentTime}
                max={duration}
                onChange={handleSeek}
                sx={{ 
                  color: 'white',
                  '& .MuiSlider-thumb': {
                    width: 12,
                    height: 12,
                  },
                  '& .MuiSlider-track': {
                    height: 4,
                  },
                  '& .MuiSlider-rail': {
                    height: 4,
                  }
                }}
              />
              <Typography variant="caption" sx={{ color: 'white', minWidth: 45 }}>
                {formatTime(duration)}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton color="inherit" onClick={handleMuteToggle}>
                {isMuted ? <VolumeOffIcon /> : <VolumeUpIcon />}
              </IconButton>
              <Slider
                value={isMuted ? 0 : volume}
                min={0}
                max={1}
                step={0.1}
                onChange={handleVolumeChange}
                sx={{ 
                  width: 100,
                  color: 'white',
                  '& .MuiSlider-thumb': {
                    width: 12,
                    height: 12,
                  },
                  '& .MuiSlider-track': {
                    height: 4,
                  },
                  '& .MuiSlider-rail': {
                    height: 4,
                  }
                }}
              />
              <IconButton color="inherit" onClick={handleFullscreen}>
                <FullscreenIcon />
              </IconButton>
            </Box>
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default MediaViewer; 