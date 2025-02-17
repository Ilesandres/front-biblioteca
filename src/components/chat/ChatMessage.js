import React from 'react';
import {
    ListItem,
    Box,
    Typography,
    Paper,
    IconButton,
    Link
} from '@mui/material';
import {
    Download as DownloadIcon,
    Image as ImageIcon,
    InsertDriveFile as FileIcon
} from '@mui/icons-material';

const MessageContent = ({ message }) => {
    switch (message.tipoMensaje) {
        case 'archivo':
            return (
                <Box display="flex" alignItems="center" gap={1}>
                    {message.archivo?.tipo?.startsWith('image/') ? (
                        <Box
                            component="img"
                            src={message.archivo.url}
                            alt="Imagen adjunta"
                            sx={{
                                maxWidth: 200,
                                maxHeight: 200,
                                borderRadius: 1
                            }}
                        />
                    ) : (
                        <>
                            <FileIcon />
                            <Link
                                href={message.archivo.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                sx={{ color: 'inherit', textDecoration: 'none' }}
                            >
                                {message.archivo.nombre}
                            </Link>
                            <IconButton size="small" component="a" href={message.archivo.url} download>
                                <DownloadIcon fontSize="small" />
                            </IconButton>
                        </>
                    )}
                </Box>
            );
        default:
            return message.mensaje;
    }
};

const ChatMessage = ({ message, isOwn }) => {
    return (
        <ListItem
            sx={{
                display: 'flex',
                justifyContent: isOwn ? 'flex-end' : 'flex-start',
                p: 1
            }}
        >
            <Box
                sx={{
                    maxWidth: '70%',
                    minWidth: '20%'
                }}
            >
                <Paper
                    elevation={1}
                    sx={{
                        p: 1,
                        bgcolor: isOwn ? 'primary.light' : 'grey.100',
                        color: isOwn ? 'white' : 'text.primary'
                    }}
                >
                    {!isOwn && (
                        <Typography
                            variant="caption"
                            component="div"
                            color={isOwn ? 'inherit' : 'primary'}
                            fontWeight="bold"
                        >
                            {message.usuario?.nombre || 'Usuario'}
                        </Typography>
                    )}
                    
                    <Box sx={{ wordBreak: 'break-word' }}>
                        <MessageContent message={message} />
                    </Box>

                    <Typography
                        variant="caption"
                        component="div"
                        sx={{
                            mt: 0.5,
                            textAlign: 'right',
                            opacity: 0.8
                        }}
                    >
                        {new Date(message.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </Typography>
                </Paper>
            </Box>
        </ListItem>
    );
};

export default ChatMessage; 