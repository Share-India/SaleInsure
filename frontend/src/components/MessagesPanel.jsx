import React, { useState, useEffect, useRef } from 'react';
import { API_BASE_URL } from '../config';

const MessagesPanel = ({ isOpen, onClose, currentUser, unreadCounts = {}, refreshUnread }) => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const chatContainerRef = useRef(null);
  const pollIntervalRef = useRef(null);

  // Fetch all users on mount
  useEffect(() => {
    if (isOpen) {
      const fetchUsers = async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/api/users`, {
            headers: {
              'Authorization': `Bearer ${JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user'))?.token}`
            }
          });
          if (response.ok) {
            const data = await response.json();
            // Exclude current user from the list
            setUsers(data.filter(u => u.id !== currentUser.id));
          }
        } catch (error) {
          console.error('Error fetching users:', error);
        }
      };
      fetchUsers();
    }
  }, [isOpen, currentUser.id]);

  // Fetch conversation when a user is selected
  const fetchConversation = async (userId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/messages/conversation/${userId}`, {
        headers: {
          'Authorization': `Bearer ${JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user'))?.token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setMessages(prev => {
          // Only scroll to bottom if the number of messages has changed (new message sent or received)
          if (prev.length !== data.length) {
            setTimeout(scrollToBottom, 50);
          }
          return data;
        });
      }
    } catch (error) {
      console.error('Error fetching conversation:', error);
    }
  };

  // Polling for new messages
  useEffect(() => {
    if (selectedUser && isOpen) {
      setMessages([]); // Clear messages immediately when switching users
      
      // Mark messages as read when switching to this user
      const markAsRead = async () => {
        try {
          await fetch(`${API_BASE_URL}/api/messages/read/${selectedUser.id}`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user'))?.token}`
            }
          });
          if (refreshUnread) refreshUnread();
        } catch (error) {
          console.error('Error marking messages as read:', error);
        }
      };
      markAsRead();

      // Initial fetch
      fetchConversation(selectedUser.id);
      
      // Setup polling every 3 seconds
      pollIntervalRef.current = setInterval(() => {
        fetchConversation(selectedUser.id);
      }, 3000);
    }

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [selectedUser, isOpen]);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user'))?.token}`
        },
        body: JSON.stringify({
          receiverId: selectedUser.id,
          content: newMessage
        })
      });

      if (response.ok) {
        setNewMessage('');
        fetchConversation(selectedUser.id); // Fetch immediately after sending
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Mobile Overlay to capture outside clicks */}
      <div className="fixed inset-0 z-40 sm:hidden" onClick={onClose}></div>
      <div className="fixed sm:absolute top-16 sm:top-full left-2 right-2 sm:left-auto sm:right-0 sm:mt-2 sm:w-[800px] h-[calc(100vh-5rem)] sm:h-[500px] bg-white rounded-xl shadow-2xl border border-slate-100 overflow-hidden z-50 flex flex-row">
      {/* Sidebar - Users List */}
      <div className={`${selectedUser ? 'hidden sm:flex' : 'flex'} w-full sm:w-1/3 border-r border-slate-100 bg-slate-50 flex-col h-full`}>
        <div className="p-4 border-b border-slate-100 bg-white flex justify-between items-center">
          <h3 className="font-bold text-slate-800">Messages</h3>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {users.map(user => (
            <button
              key={user.id}
              onClick={() => setSelectedUser(user)}
              className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition-colors ${selectedUser?.id === user.id ? 'bg-blue-50 border border-blue-100' : 'hover:bg-white'}`}
            >
              <div className="w-10 h-10 rounded-full overflow-hidden bg-blue-100 flex items-center justify-center text-blue-600 font-bold shrink-0">
                {user.profilePhotoUrl ? (
                  <img src={`${API_BASE_URL}${user.profilePhotoUrl}`} alt={user.username} className="w-full h-full object-cover" />
                ) : (
                  user.username.charAt(0).toUpperCase()
                )}
              </div>
              <div className="overflow-hidden flex-1">
                <p className="font-semibold text-slate-800 truncate text-sm">{user.username}</p>
                <p className="text-xs text-slate-500 truncate">{user.designation || user.role}</p>
              </div>
              {unreadCounts[user.id] > 0 && (
                <div className="w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center shrink-0 shadow-sm">
                  {unreadCounts[user.id] > 99 ? '99+' : unreadCounts[user.id]}
                </div>
              )}
            </button>
          ))}
          {users.length === 0 && (
            <div className="text-center p-4 text-slate-400 text-sm">No contacts found.</div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={`${!selectedUser ? 'hidden sm:flex' : 'flex'} w-full sm:w-2/3 bg-white flex-col h-full relative`}>
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 z-10 p-1 bg-white/80 rounded-full backdrop-blur">
          <span className="material-symbols-outlined text-sm">close</span>
        </button>

        {selectedUser ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-slate-100 flex items-center gap-3">
              <button onClick={() => setSelectedUser(null)} className="sm:hidden p-1.5 -ml-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors">
                <span className="material-symbols-outlined text-sm">arrow_back</span>
              </button>
              <div className="w-10 h-10 rounded-full overflow-hidden bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                {selectedUser.profilePhotoUrl ? (
                  <img src={`${API_BASE_URL}${selectedUser.profilePhotoUrl}`} alt={selectedUser.username} className="w-full h-full object-cover" />
                ) : (
                  selectedUser.username.charAt(0).toUpperCase()
                )}
              </div>
              <div>
                <h4 className="font-bold text-slate-800">{selectedUser.username}</h4>
                <p className="text-xs text-slate-500">{selectedUser.designation || selectedUser.role}</p>
              </div>
            </div>

            {/* Messages List */}
            <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                  <span className="material-symbols-outlined text-4xl mb-2 text-slate-300">waving_hand</span>
                  <p className="text-sm">Say hello to {selectedUser.username}!</p>
                </div>
              ) : (
                messages.map((msg, index) => {
                  const isMe = msg.senderId === currentUser.id;
                  return (
                    <div key={index} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[75%] rounded-2xl px-4 py-2 ${isMe ? 'bg-primary-container text-on-primary-container rounded-tr-sm' : 'bg-white border border-slate-100 shadow-sm text-slate-700 rounded-tl-sm'}`}>
                        <p className="text-sm">{msg.content}</p>
                        <p className={`text-[10px] mt-1 ${isMe ? 'text-primary-container/70 opacity-70 text-right' : 'text-slate-400 text-right'}`}>
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-100 bg-white flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 bg-slate-50 border border-slate-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />
              <button
                type="submit"
                disabled={!newMessage.trim()}
                className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
              >
                <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
              </button>
            </form>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center">
            <span className="material-symbols-outlined text-5xl mb-4 text-slate-200">forum</span>
            <h3 className="text-lg font-medium text-slate-600 mb-2">Your Messages</h3>
            <p className="text-sm">Select a colleague from the list on the left to start a conversation.</p>
          </div>
        )}
      </div>
      </div>
    </>
  );
};

export default MessagesPanel;
