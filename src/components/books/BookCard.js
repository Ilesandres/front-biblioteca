import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Card,
    CardMedia,
    CardContent,
    CardActions,
    Typography,
    Button,
    IconButton,
    Box,
    Chip,
    Tooltip,
    Rating,
    Grow,
    Fade,
    Badge,
    useTheme,
    Divider,
    CardActionArea
} from '@mui/material';
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    Info as InfoIcon,
    Book as BookIcon,
    Bookmark as BookmarkIcon,
    Favorite as FavoriteIcon,
    LocalLibrary as LocalLibraryIcon,
    StarBorder as StarBorderIcon
} from '@mui/icons-material';
import { useAuth } from '../auth/AuthContext';
import libroService from '../../services/libroService';

const BookCard = ({ book, onUpdate }) => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const isAdmin = user?.rol === 'admin';
    const theme = useTheme();
    const [elevated, setElevated] = useState(false);
    const [showActions, setShowActions] = useState(false);

    const handleDelete = async () => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este libro?')) {
            try {
                await libroService.eliminarLibro(book.id);
                onUpdate(); // Recargar la lista de libros
            } catch (error) {
                console.error('Error al eliminar el libro:', error);
            }
        }
    };

    // Función para truncar texto manteniendo palabras completas
    const truncateText = (text, maxLength) => {
        if (!text || text.length <= maxLength) return text;
        const truncated = text.substr(0, text.lastIndexOf(' ', maxLength));
        return truncated + '...';
    };

    return (
        <Grow in={true} timeout={300}>
            <Card 
                elevation={elevated ? 8 : 3} 
                sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    borderRadius: 2,
                    position: 'relative',
                    overflow: 'visible',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    transform: elevated ? 'translateY(-8px)' : 'none',
                    '&:hover': {
                        boxShadow: '0 12px 24px rgba(0,0,0,0.15)'
                    }
                }}
                onMouseEnter={() => {
                    setElevated(true);
                    setShowActions(true);
                }}
                onMouseLeave={() => {
                    setElevated(false);
                    setShowActions(false);
                }}
            >
                {/* Indicador de disponibilidad */}
                <Badge
                    badgeContent={book.stock > 0 ? `${book.stock}` : '0'}
                    color={book.stock > 0 ? "success" : "error"}
                    anchorOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                    }}
                    sx={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        zIndex: 1,
                        '& .MuiBadge-badge': {
                            fontSize: '0.8rem',
                            height: '22px',
                            minWidth: '22px',
                            borderRadius: '50%',
                        }
                    }}
                >
                    <Box sx={{ height: 22, width: 22 }} />
                </Badge>

                {/* Imagen con efecto de hover */}
                <Box 
                    sx={{ 
                        position: 'relative', 
                        overflow: 'hidden',
                        borderTopLeftRadius: 8,
                        borderTopRightRadius: 8,
                        bgcolor: '#f5f5f5',
                        height: 220,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <CardMedia
                        component="img"
                        height="auto"
                        image={book.portada || '/default-book-cover.jpg'}
                        alt={book.titulo}
                        sx={{ 
                            objectFit: 'contain', 
                            maxHeight: '200px',
                            width: 'auto',
                            p: 1,
                            transition: 'transform 0.5s',
                            transform: elevated ? 'scale(1.05)' : 'scale(1)'
                        }}
                    />

                    {/* Overlay con acciones rápidas */}
                    <Fade in={showActions} timeout={200}>
                        <Box
                            sx={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                right: 0,
                                display: 'flex',
                                justifyContent: 'center',
                                p: 1,
                                bgcolor: 'rgba(0, 0, 0, 0.7)',
                                backdropFilter: 'blur(5px)',
                                color: 'white'
                            }}
                        >
                            <Tooltip title="Ver detalles">
                                <IconButton
                                    onClick={() => navigate(`/books/${book.id}`)}
                                    size="small"
                                    sx={{ color: 'white', mx: 0.5 }}
                                >
                                    <InfoIcon />
                                </IconButton>
                            </Tooltip>
                            {book.stock > 0 && (
                                <Tooltip title="Solicitar préstamo">
                                    <IconButton
                                        onClick={() => navigate(`/loans/new/${book.id}`)}
                                        size="small"
                                        sx={{ color: '#81c784', mx: 0.5 }}
                                    >
                                        <LocalLibraryIcon />
                                    </IconButton>
                                </Tooltip>
                            )}
                            {isAdmin && (
                                <>
                                    <Tooltip title="Editar">
                                        <IconButton
                                            onClick={() => navigate(`/books/edit/${book.id}`)}
                                            size="small"
                                            sx={{ color: '#90caf9', mx: 0.5 }}
                                        >
                                            <EditIcon />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Eliminar">
                                        <IconButton
                                            onClick={handleDelete}
                                            size="small"
                                            sx={{ color: '#ef9a9a', mx: 0.5 }}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </Tooltip>
                                </>
                            )}
                        </Box>
                    </Fade>
                </Box>

                <CardActionArea onClick={() => navigate(`/books/${book.id}`)}>
                    <CardContent sx={{ flexGrow: 1, p: 2.5 }}>
                        <Typography 
                            gutterBottom 
                            variant="h6" 
                            component="h2" 
                            sx={{ 
                                fontWeight: 700, 
                                fontSize: '1.1rem',
                                lineHeight: 1.4,
                                height: '3rem',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                color: theme.palette.primary.dark,
                                mb: 1
                            }}
                        >
                            {book.titulo}
                        </Typography>
                        
                        <Typography 
                            variant="body2" 
                            color="text.secondary" 
                            sx={{ 
                                mb: 1.5,
                                fontStyle: 'italic',
                                fontSize: '0.9rem'
                            }}
                        >
                            {book.autor}
                        </Typography>

                        <Rating 
                            name="read-only" 
                            value={parseFloat(book.calificacion_promedio) || 0} 
                            precision={0.5} 
                            size="small" 
                            readOnly 
                            emptyIcon={<StarBorderIcon fontSize="inherit" />}
                            sx={{ mb: 1.5 }}
                        />
                        
                        <Box display="flex" flexWrap="wrap" gap={0.7} mb={1.5}>
                            {book.categorias && book.categorias.split(',').map((categoria, index) => (
                                <Chip 
                                    key={index}
                                    label={categoria.trim()}
                                    size="small"
                                    color="primary"
                                    variant="outlined"
                                    sx={{ 
                                        borderRadius: '4px',
                                        height: '20px',
                                        fontSize: '0.7rem'
                                    }}
                                />
                            ))}
                            <Chip
                                icon={book.stock > 0 ? <BookmarkIcon /> : null}
                                label={book.stock > 0 ? 'Disponible' : 'No disponible'}
                                size="small"
                                color={book.stock > 0 ? "success" : "error"}
                                sx={{ 
                                    borderRadius: '4px',
                                    height: '20px',
                                    fontSize: '0.7rem',
                                    fontWeight: book.stock > 0 ? 500 : 400,
                                    ml: 'auto',
                                    '& .MuiChip-icon': {
                                        fontSize: '0.7rem',
                                        ml: '-3px',
                                        mr: '3px'
                                    }
                                }}
                            />
                        </Box>
                        
                        <Typography 
                            variant="body2" 
                            color="text.secondary"
                            sx={{
                                fontSize: '0.85rem',
                                lineHeight: 1.5,
                                height: '3.8rem',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: '-webkit-box',
                                WebkitLineClamp: 3,
                                WebkitBoxOrient: 'vertical'
                            }}
                        >
                            {book.descripcion || "Sin descripción disponible"}
                        </Typography>
                    </CardContent>
                </CardActionArea>

                <Divider sx={{ mx: 2 }} />
                
                <CardActions sx={{ justifyContent: 'space-between', p: 1.5 }}>
                    <Box display="flex" alignItems="center">
                        <Typography variant="caption" color="text.secondary" mr={1}>
                            ISBN: {book.isbn || 'N/A'}
                        </Typography>
                    </Box>
                    
                    <Typography variant="caption" color="text.secondary">
                        {book.anioPublicacion ? new Date(book.anioPublicacion).getFullYear() : ''}
                    </Typography>
                </CardActions>
            </Card>
        </Grow>
    );
};

export default BookCard;