import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRecentChats, logout, getAcceptedContacts } from '../modules/api';
import { socketService } from '../services/socket';

const ChatList = () => {
  const [conversations, setConversations] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const navigate = useNavigate();

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem('user'));
    setCurrentUser(userInfo);
    loadData();
    
    socketService.connect();

    const handleNewMessage = async (message) => {
      console.log('Nuevo mensaje en ChatList:', message);
      await loadData();
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

    socketService.socket.on('userOnline', handleUserOnline);
    socketService.socket.on('userOffline', handleUserOffline);
    socketService.onNewMessage(handleNewMessage);

    return () => {
      socketService.socket.off('userOnline', handleUserOnline);
      socketService.socket.off('userOffline', handleUserOffline);
      socketService.removeMessageHandler(handleNewMessage);
      socketService.disconnect();
    };
  }, []);

  const loadData = async () => {
    try {
      const [chatsData, contactsData] = await Promise.all([
        getRecentChats(),
        getAcceptedContacts()
      ]);

      // Combinar chats y contactos
      const allContacts = contactsData.map(contact => ({
        conversationId: contact.friend.id,
        otherUser: contact.friend,
        messages: [],
        isContact: true
      }));

      // Filtrar contactos que ya tienen conversaciones
      const existingConversationIds = chatsData.map(chat => chat.conversationId);
      const contactsWithoutChats = allContacts.filter(
        contact => !existingConversationIds.includes(contact.conversationId)
      );

      setConversations([...chatsData, ...contactsWithoutChats]);
    } catch (err) {
      console.error('Error al cargar datos:', err);
      setError('Error al cargar los datos');
      if (err.message.includes('No hay usuario autenticado')) {
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const handleChatClick = (userId) => {
    if (userId) {
      navigate(`/chat/${userId}`);
    } else {
      console.error('ID de usuario inválido');
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch (err) {
      console.error('Error al formatear fecha:', err);
      return 'Fecha no disponible';
    }
  };

  // Agregar estado para última conexión
  const formatLastSeen = (date) => {
    if (!date) return '';
    const lastSeen = new Date(date);
    const now = new Date();
    const diff = now - lastSeen;

    if (diff < 60000) return 'Hace un momento';
    if (diff < 3600000) return `Hace ${Math.floor(diff/60000)} minutos`;
    if (diff < 86400000) return `Hace ${Math.floor(diff/3600000)} horas`;
    return lastSeen.toLocaleDateString();
  };

  const renderConversationItem = (conv) => (
    <div 
      key={conv.conversationId || `conv-${conv.otherUser.id}`}
      className="conversation-item"
      onClick={() => handleChatClick(conv.otherUser.id)}
    >
      <div className="user-avatar">
        {conv.otherUser.username[0].toUpperCase()}
      </div>
      <div className="conversation-info">
        <div className="conversation-header">
          <h3>{conv.otherUser.username}</h3>
          <div className="user-status">
            <span 
              className={`online-status ${onlineUsers.has(conv.otherUser.id) ? 'online' : 'offline'}`}
            />
            <span className={`status-text ${onlineUsers.has(conv.otherUser.id) ? 'online' : ''}`}>
              {onlineUsers.has(conv.otherUser.id) ? 'en línea' : ''}
            </span>
          </div>
        </div>
        {conv.messages && conv.messages[0] ? (
          <div className="last-message">
            <div className="message-preview">
              {conv.messages[0].sender_id === currentUser?.id && (
                <span className="message-status">
                  {conv.messages[0].read ? '✓✓' : '✓'}
                </span>
              )}
              <p>{conv.messages[0].content}</p>
            </div>
            <span className="message-time">
              {new Date(conv.messages[0].createdAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>
        ) : (
          <div className="no-messages">
            <p>Iniciar conversación</p>
          </div>
        )}
      </div>
      {conv.messages && conv.messages.some(msg => !msg.read && msg.receiver_id === currentUser?.id) && (
        <div className="unread-wrapper">
          <span className="unread-indicator">
            {conv.messages.filter(msg => !msg.read && msg.receiver_id === currentUser?.id).length}
          </span>
        </div>
      )}
    </div>
  );

  if (loading) return <div className="loading">Cargando conversaciones...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="chat-list-container">
      <header className="chat-list-header">
        <div className="header-left">
          <h2>Conversaciones</h2>
          <button 
            onClick={() => navigate('/requests')} 
            className="requests-button"
          >
            <span>📨</span>
            Solicitudes
            {pendingRequestsCount > 0 && (
              <span className="badge">{pendingRequestsCount}</span>
            )}
          </button>
        </div>
        <div className="user-controls">
          <span className="current-user">
            {currentUser?.username || 'Usuario'}
          </span>
          <button onClick={handleLogout} className="logout-button">
            Cerrar Sesión
          </button>
        </div>
      </header>

      <div className="conversations-list">
        {conversations.length === 0 ? (
          <div className="no-conversations">
            No hay conversaciones ni contactos disponibles
          </div>
        ) : (
          conversations.map((conv) => renderConversationItem(conv))
        )}
      </div>
    </div>
  );
};

export default ChatList;
