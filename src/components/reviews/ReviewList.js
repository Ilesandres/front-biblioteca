import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    Rating,
    IconButton,
    Divider,
    CircularProgress,
    Alert,
    Menu,
    MenuItem
} from '@mui/material';
import {
    MoreVert as MoreVertIcon,
    Edit as EditIcon,
    Delete as DeleteIcon
} from '@mui/icons-material';
import { useAuth } from '../auth/AuthContext';
import reviewService from '../../services/review.service';
import ReviewForm from './ReviewForm';

const ReviewItem = ({ review, onEdit, onDelete, currentUser }) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const isOwner = currentUser?.id === review.usuarioId;

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleEdit = () => {
        handleMenuClose();
        onEdit(review);
    };

    const handleDelete = () => {
        handleMenuClose();
        onDelete(review.id);
    };

    return (
        <Paper sx={{ p: 2, mb: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Box>
                    <Typography variant="subtitle1" fontWeight="bold">
                        {review.usuario_nombre || 'Usuario'}
                    </Typography>
                    <Box display="flex" alignItems="center" mb={1}>
                        <Rating value={review.calificacion} readOnly size="small" />
                        <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                            {new Date(review.createdAt).toLocaleDateString()}
                        </Typography>
                    </Box>
                </Box>
                {isOwner && (
                    <>
                        <IconButton onClick={handleMenuOpen} size="small">
                            <MoreVertIcon />
                        </IconButton>
                        <Menu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl)}
                            onClose={handleMenuClose}
                        >
                            <MenuItem onClick={handleEdit}>
                                <EditIcon fontSize="small" sx={{ mr: 1 }} />
                                Editar
                            </MenuItem>
                            <MenuItem onClick={handleDelete}>
                                <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
                                Eliminar
                            </MenuItem>
                        </Menu>
                    </>
                )}
            </Box>
            <Typography variant="body2">{review.comentario}</Typography>
        </Paper>
    );
};

const ReviewList = ({ bookId, onReviewUpdated }) => {
    const { user } = useAuth();
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editingReview, setEditingReview] = useState(null);

    useEffect(() => {
        loadReviews();
    }, [bookId]);

    const loadReviews = async () => {
        try {
            setLoading(true);
            const response = await reviewService.getByBook(bookId);
            setReviews(response.resenas || []);
            setError('');
        } catch (err) {
            setError('Error al cargar las reseñas');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (reviewId) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar esta reseña?')) {
            try {
                await reviewService.delete(reviewId);
                await loadReviews();
                if (onReviewUpdated) onReviewUpdated();
            } catch (error) {
                setError('Error al eliminar la reseña');
            }
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" my={4}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Alert severity="error" sx={{ mt: 2 }}>
                {error}
            </Alert>
        );
    }

    return (
        <Box>
            {editingReview ? (
                <ReviewForm
                    bookId={bookId}
                    initialValues={editingReview}
                    onSubmit={() => {
                        setEditingReview(null);
                        loadReviews();
                        if (onReviewUpdated) onReviewUpdated();
                    }}
                    onCancel={() => setEditingReview(null)}
                />
            ) : null}

            {reviews.length === 0 ? (
                <Typography color="text.secondary" align="center" sx={{ my: 4 }}>
                    No hay reseñas todavía. ¡Sé el primero en opinar!
                </Typography>
            ) : (
                reviews.map((review) => (
                    <ReviewItem
                        key={review.id}
                        review={review}
                        currentUser={user}
                        onEdit={setEditingReview}
                        onDelete={handleDelete}
                    />
                ))
            )}
        </Box>
    );
};

export default ReviewList;