import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { MessageCircle, Send, Minus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const ChatWidget = () => {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [socket, setSocket] = useState(null);
    const messagesEndRef = useRef(null);

    // Use a hardcoded room for demo purposes (e.g., 'support' or user's ID)
    // In a real app, this would be dynamic based on the pickup or recipient.
    const roomId = 'support';

    useEffect(() => {
        if (user && isOpen) {
            // Initialize socket connection
            const newSocket = io(process.env.REACT_APP_API_URL || 'http://localhost:5001', {
                auth: {
                    token: localStorage.getItem('token')
                }
            });

            newSocket.on('connect', () => {
                console.log('Connected to chat socket');
                newSocket.emit('chat:join_room', roomId);
            });

            newSocket.on('chat:receive_message', (msg) => {
                setMessages((prev) => [...prev, { ...msg, isOwn: msg.senderId === user.id }]);
            });

            setSocket(newSocket);

            return () => {
                newSocket.disconnect();
            };
        }
    }, [user, isOpen]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = (e) => {
        e.preventDefault();
        if (!message.trim() || !socket) return;

        const msgData = {
            roomId,
            message: message.trim(),
        };

        // Emit to server
        socket.emit('chat:send_message', msgData);

        // Optimistically update UI
        setMessages((prev) => [
            ...prev,
            {
                id: Date.now(),
                text: message.trim(),
                senderId: user.id,
                timestamp: new Date().toISOString(),
                isOwn: true,
            },
        ]);

        setMessage('');
    };

    if (!user) return null; // Only show for logged in users

    return (
        <div className="chat-widget">
            {!isOpen && (
                <button className="chat-toggle-btn" onClick={() => setIsOpen(true)}>
                    <MessageCircle size={24} />
                </button>
            )}

            {isOpen && (
                <div className="chat-window">
                    <div className="chat-header">
                        <div className="chat-title">
                            <MessageCircle size={18} />
                            <span>Support Chat</span>
                        </div>
                        <div className="chat-actions">
                            <button onClick={() => setIsOpen(false)}>
                                <Minus size={18} />
                            </button>
                        </div>
                    </div>

                    <div className="chat-messages">
                        {messages.length === 0 && (
                            <div className="empty-chat">
                                <p>Start a conversation!</p>
                            </div>
                        )}
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`message ${msg.isOwn ? 'own' : 'other'}`}>
                                <div className="message-bubble">{msg.text}</div>
                                <span className="message-time">
                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    <form onSubmit={handleSend} className="chat-input-area">
                        <input
                            type="text"
                            placeholder="Type a message..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                        />
                        <button type="submit" disabled={!message.trim()}>
                            <Send size={18} />
                        </button>
                    </form>
                </div>
            )}

            <style>{`
        .chat-widget {
          position: fixed;
          bottom: 2rem;
          right: 2rem;
          z-index: 1000;
        }

        .chat-toggle-btn {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: var(--primary);
          color: white;
          border: none;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.2s;
        }

        .chat-toggle-btn:hover {
          transform: scale(1.05);
        }

        .chat-window {
          width: 350px;
          height: 500px;
          background: white;
          border-radius: 1rem;
          box-shadow: 0 8px 24px rgba(0,0,0,0.15);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          animation: slideUp 0.3s ease-out;
        }

        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        .chat-header {
          background: var(--primary);
          color: white;
          padding: 1rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .chat-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 600;
        }

        .chat-actions button {
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          padding: 0.25rem;
        }

        .chat-messages {
          flex: 1;
          padding: 1rem;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          background: var(--gray-50);
        }

        .empty-chat {
          text-align: center;
          color: var(--gray-400);
          margin-top: 2rem;
        }

        .message {
          display: flex;
          flex-direction: column;
          max-width: 80%;
        }

        .message.own {
          align-self: flex-end;
          align-items: flex-end;
        }

        .message.other {
          align-self: flex-start;
          align-items: flex-start;
        }

        .message-bubble {
          padding: 0.75rem 1rem;
          border-radius: 1rem;
          font-size: 0.9375rem;
        }

        .message.own .message-bubble {
          background: var(--primary);
          color: white;
          border-bottom-right-radius: 0.25rem;
        }

        .message.other .message-bubble {
          background: white;
          color: var(--gray-900);
          border: 1px solid var(--gray-200);
          border-bottom-left-radius: 0.25rem;
        }

        .message-time {
          font-size: 0.7rem;
          color: var(--gray-400);
          margin-top: 0.25rem;
        }

        .chat-input-area {
          padding: 1rem;
          background: white;
          border-top: 1px solid var(--gray-200);
          display: flex;
          gap: 0.5rem;
        }

        .chat-input-area input {
          flex: 1;
          border: 1px solid var(--gray-200);
          border-radius: 2rem;
          padding: 0.625rem 1rem;
          outline: none;
          font-size: 0.9375rem;
        }

        .chat-input-area input:focus {
          border-color: var(--primary);
        }

        .chat-input-area button {
          background: var(--primary);
          color: white;
          border: none;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .chat-input-area button:disabled {
          background: var(--gray-300);
          cursor: not-allowed;
        }
      `}</style>
        </div>
    );
};

export default ChatWidget;
