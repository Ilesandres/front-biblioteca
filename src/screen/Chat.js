import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRecentChats, markConversationAsRead } from '../modules/api';
import { socketService } from '../services/socket';

const Chat = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [otherUser, setOtherUser] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const messagesEndRef = useRef(null);
    const [isTyping, setIsTyping] = useState(false);
    const [otherUserIsTyping, setOtherUserIsTyping] = useState(false);
    const typingTimeoutRef = useRef(null);
    const [onlineUsers, setOnlineUsers] = useState(new Set());

    useEffect(() => {
        const initChat = async () => {
            try {
                const userInfo = JSON.parse(localStorage.getItem('user'));
                if (!userInfo) {
                    throw new Error('No hay usuario autenticado');
                }
                setCurrentUser(userInfo);
                await loadMessages();
                await markMessagesAsRead(userInfo);
                scrollToBottom();
            } catch (err) {
                console.error('Error al inicializar chat:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        initChat();
    }, [userId]);

    useEffect(() => {
        socketService.connect();

        const handleNewMessage = (message) => {
            if (message.sender_id.toString() === userId || 
                message.receiver_id.toString() === userId) {
                setMessages(prev => [...prev, {
                    ...message,
                    sender_id: message.sender_id.toString(),
                    receiver_id: message.receiver_id.toString()
                }]);
                
                if (message.sender_id.toString() === userId) {
                    markMessagesAsRead(currentUser);
                }
                scrollToBottom();
            }
        };

        const handleUserOnline = (userId) => {
            setOnlineUsers(prev => new Set([...prev, userId]));
        };

        const handleUserOffline = (userId) => {
            setOnlineUsers(prev => {
                const newSet = new Set(prev);
                newSet.delete(userId);
                return newSet;
            });
        };

        socketService.socket?.on('userOnline', handleUserOnline);
        socketService.socket?.on('userOffline', handleUserOffline);
        socketService.onNewMessage(handleNewMessage);
        socketService.socket?.on('userTyping', ({ userId, isTyping }) => {
            if (userId === otherUser?.id) {
                setOtherUserIsTyping(isTyping);
            }
        });

        return () => {
            socketService.removeMessageHandler(handleNewMessage);
            socketService.socket?.off('userOnline', handleUserOnline);
            socketService.socket?.off('userOffline', handleUserOffline);
            socketService.socket?.off('userTyping');
            socketService.disconnect();
        };
    }, [userId, currentUser, otherUser]);

    const scrollToBottom = () => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
    };

    const markMessagesAsRead = async (userInfo) => {
        try {
            console.log('Intentando marcar mensajes como leídos. Sender:', userId, 'Receiver:', userInfo.id);
            const result = await markConversationAsRead(userId);
            console.log('Resultado de marcar mensajes:', result);
        } catch (err) {
            console.error('Error al marcar mensajes como leídos:', err);
        }
    };

    const loadMessages = async () => {
        try {
            const conversations = await getRecentChats();
            const currentConversation = conversations.find(conv => 
                conv.otherUser.id.toString() === userId
            );
            
            if (currentConversation) {
                const sortedMessages = currentConversation.messages.sort((a, b) => 
                    new Date(a.createdAt) - new Date(b.createdAt)
                );
                setMessages(sortedMessages || []);
                setOtherUser(currentConversation.otherUser);
            }
            setError(null);
        } catch (err) {
            console.error('Error al cargar mensajes:', err);
            setError('Error al cargar el historial de mensajes');
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            setLoading(true);
            const message = await socketService.sendMessage(userId, newMessage);
            setMessages(prev => [...prev, {
                ...message,
                sender_id: currentUser.id.toString(),
                receiver_id: userId
            }]);
            setNewMessage('');
            scrollToBottom();
        } catch (err) {
            setError('Error al enviar mensaje');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        navigate('/chats');
    };

    const handleTyping = () => {
        if (!isTyping) {
            setIsTyping(true);
            socketService.socket?.emit('typing', { receiverId: userId, isTyping: true });
        }

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
            setIsTyping(false);
            socketService.socket?.emit('typing', { receiverId: userId, isTyping: false });
        }, 1000);
    };

    const renderMessageStatus = (message) => {
        if (message.sender_id.toString() === currentUser?.id.toString()) {
            return (
                <span className="message-status">
                    {message.read ? (
                        <span title="Leído" className="read">✓✓</span>
                    ) : (
                        <span title="Enviado" className="sent">✓</span>
                    )}
                </span>
            );
        }
        return null;
    };

    if (loading) return <div className="loading">Cargando chat...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="chat-container">
            <header className="chat-header">
                <button onClick={handleBack} className="back-button">
                    ←
                </button>
                <div className="chat-header-info">
                    <h2>{otherUser?.username}</h2>
                    {otherUserIsTyping ? (
                        <span className="typing-indicator">escribiendo...</span>
                    ) : (
                        <span className={`user-status ${onlineUsers?.has(otherUser?.id) ? 'online' : ''}`}>
                            {onlineUsers?.has(otherUser?.id) ? 'en línea' : 'desconectado'}
                        </span>
                    )}
                </div>
            </header>

            <div className="messages-container">
                {messages.map((message, index) => (
                    <div
                        key={message.id}
                        className={`message ${
                            message.sender_id.toString() === currentUser?.id.toString() 
                            ? 'sent' 
                            : 'received'
                        }`}
                    >
                        <div className="message-content">
                            {message.content}
                            {renderMessageStatus(message)}
                        </div>
                        <div className="message-time">
                            {new Date(message.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="message-form">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => {
                        setNewMessage(e.target.value);
                        handleTyping();
                    }}
                    placeholder="Escribe un mensaje..."
                    className="message-input"
                />
                <button type="submit" className="send-button" disabled={!newMessage.trim()}>
                    Enviar
                </button>
            </form>
        </div>
    );
};

export default Chat;
