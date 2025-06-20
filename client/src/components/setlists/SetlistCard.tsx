import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardActions, 
  Typography, 
  Button, 
  Chip, 
  Stack, 
  Box, 
  Tooltip,
  IconButton,
  Menu,
  MenuItem,
  CardActionArea
} from '@mui/material';
import { 
  AccessTime as AccessTimeIcon,
  Event as EventIcon,
  Room as RoomIcon,
  MoreVert as MoreVertIcon,
  MusicNote as MusicNoteIcon,
  Public as PublicIcon,
  Lock as LockIcon
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { Setlist } from '../../models';

interface SetlistCardProps {
  setlist: Setlist;
  bandId: string;
  onDelete?: (id: string) => void;
  onDuplicate?: (id: string) => void;
  onShare?: (id: string) => void;
}

const SetlistCard: React.FC<SetlistCardProps> = ({ 
  setlist, 
  bandId,
  onDelete,
  onDuplicate,
  onShare 
}) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  
  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleDelete = () => {
    handleClose();
    if (onDelete) onDelete(setlist.id);
  };

  const handleDuplicate = () => {
    handleClose();
    if (onDuplicate) onDuplicate(setlist.id);
  };

  const handleShare = () => {
    handleClose();
    if (onShare) onShare(setlist.id);
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'N/A';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const songCount = setlist.songs?.length || 0;

  return (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4
        }
      }}
    >
      <CardActionArea 
        component={RouterLink} 
        to={`/bands/${bandId}/setlists/${setlist.id}`}
        sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
      >
        <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
            <Typography variant="h5" component="div" noWrap>
              {setlist.name}
            </Typography>
            <Tooltip title={setlist.isPublic ? 'Public setlist' : 'Private setlist'}>
              {setlist.isPublic ? 
                <PublicIcon fontSize="small" color="action" /> : 
                <LockIcon fontSize="small" color="action" />
              }
            </Tooltip>
          </Box>
          
          {setlist.description && (
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ 
                mb: 2,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
              }}
            >
              {setlist.description}
            </Typography>
          )}
          
          <Stack spacing={1} sx={{ mt: 'auto' }}>
            {setlist.eventDate && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <EventIcon fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  {new Date(setlist.eventDate).toLocaleDateString()}
                </Typography>
              </Box>
            )}
            
            {setlist.venue && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <RoomIcon fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary" noWrap>
                  {setlist.venue}
                </Typography>
              </Box>
            )}
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <MusicNoteIcon fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                {songCount} {songCount === 1 ? 'song' : 'songs'}
              </Typography>
            </Box>
            
            {setlist.durationSeconds && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AccessTimeIcon fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  {formatDuration(setlist.durationSeconds)}
                </Typography>
              </Box>
            )}
          </Stack>
        </CardContent>
      </CardActionArea>
      
      <CardActions sx={{ justifyContent: 'space-between', px: 2, py: 1 }}>
        <Typography variant="caption" color="text.secondary">
          Updated {formatDistanceToNow(new Date(setlist.updatedAt), { addSuffix: true })}
        </Typography>
        
        <Box>
          <Tooltip title="Perform">
            <Button 
              size="small" 
              color="primary" 
              component={RouterLink}
              to={`/bands/${bandId}/setlists/${setlist.id}/perform`}
              onClick={(e) => e.stopPropagation()}
            >
              Perform
            </Button>
          </Tooltip>
          
          <IconButton
            aria-label="more"
            id={`setlist-menu-${setlist.id}`}
            aria-controls={open ? `setlist-menu-${setlist.id}` : undefined}
            aria-expanded={open ? 'true' : undefined}
            aria-haspopup="true"
            onClick={handleMenuClick}
            size="small"
          >
            <MoreVertIcon />
          </IconButton>
          
          <Menu
            id={`setlist-menu-${setlist.id}`}
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            MenuListProps={{
              'aria-labelledby': `setlist-menu-${setlist.id}`,
            }}
          >
            <MenuItem onClick={handleDuplicate}>Duplicate</MenuItem>
            <MenuItem onClick={handleShare}>Share</MenuItem>
            <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>Delete</MenuItem>
          </Menu>
        </Box>
      </CardActions>
    </Card>
  );
};

export default SetlistCard;