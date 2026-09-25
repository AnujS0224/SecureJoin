document.addEventListener('DOMContentLoaded', () => {
  const homeContainer = document.querySelector('.home-container');
  const chatContainer = document.querySelector('.chat-container');
  const usernameInput = document.getElementById('username');
  const roomCodeInput = document.getElementById('room-code');
  const joinBtn = document.getElementById('join-btn');
  const createBtn = document.getElementById('create-btn');
  const currentRoomSpan = document.getElementById('current-room');
  const copyRoomBtn = document.getElementById('copy-room-btn');
  const messagesContainer = document.getElementById('messages-container');
  const messageInput = document.getElementById('message-input');
  const sendBtn = document.getElementById('send-btn');
  const userCount = document.getElementById('user-count');
  const activeBadgeCount = document.getElementById('active-badge-count');
  const leaveBtn = document.getElementById('leave-btn');
  const usersList = document.getElementById('users-list');
  const emojiBtn = document.getElementById('emoji-btn');
  const emojiDrawer = document.getElementById('emoji-drawer');
  const fileBtn = document.getElementById('file-btn');
  const fileInput = document.getElementById('file-input');
  const avatarInput = document.getElementById('avatar-input');
  const avatarPreview = document.getElementById('avatar-preview');

  let socket;
  let currentRoom = '';
  let username = '';
  let userAvatar = localStorage.getItem('userAvatar') || `https://api.dicebear.com/7.x/bottts/svg?seed=${Math.random().toString(36).substring(7)}`;
  let isTyping = false;
  let lastTypingTime;
  let localMessageHistory = JSON.parse(localStorage.getItem('messageHistory')) || {};

  // Set initial avatar preview if previously saved
  if (avatarPreview && userAvatar) {
    avatarPreview.src = userAvatar;
  }

  // Show Toast Notice
  function showToast(message) {
    const existing = document.querySelector('.toast-notice');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'toast-notice';
    toast.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
      <span>${escapeHtml(message)}</span>
    `;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 2200);
  }

  // Escape HTML to prevent XSS
  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, 
      tag => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
      }[tag] || tag)
    );
  }

  // Format file size
  function formatBytes(bytes) {
    if (!bytes) return '';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  }

  // Initialize Socket.io Connection
  function initSocket() {
    if (socket) return;
    socket = io();

    socket.on('roomData', (data) => {
      currentRoom = data.roomCode;
      currentRoomSpan.textContent = currentRoom;
      sessionStorage.setItem('chatRoom', currentRoom);
      sessionStorage.setItem('username', username);

      updateUserList(data.users);
      homeContainer.classList.add('hidden');
      chatContainer.classList.remove('hidden');
      
      // If server sent prior room messages and container is empty, render them
      if (Array.isArray(data.messages) && messagesContainer.children.length === 0) {
        data.messages.forEach(displayMessage);
      }

      messageInput.focus();
    });

    socket.on('message', (message) => {
      displayMessage(message);
      saveMessageToHistory(currentRoom, message);
    });

    socket.on('fileMessage', (message) => {
      displayMessage(message);
      saveMessageToHistory(currentRoom, message);
    });

    socket.on('userList', updateUserList);
    socket.on('typing', data => showTyping(data.username));
    socket.on('stopTyping', hideTyping);
  }

  // Avatar Selection Handling
  avatarInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        userAvatar = reader.result;
        localStorage.setItem('userAvatar', userAvatar);
        avatarPreview.src = userAvatar;
      };
      reader.readAsDataURL(file);
    }
  });

  // Show Error Messages on Inputs
  function showError(element, message) {
    const oldError = element.parentNode.querySelector('.error-message');
    if (oldError) oldError.remove();

    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.textContent = message;
    element.parentNode.appendChild(errorElement);
    setTimeout(() => errorElement.remove(), 3500);
  }

  // Display Message Bubble
  function displayMessage(message) {
    // Hide typing indicator when receiving a new message
    hideTyping();

    const messageElement = document.createElement('div');
    const isSystem = message.user === 'System';
    const isOwn = message.user === username;

    if (isSystem) {
      messageElement.className = 'message message-system';
      messageElement.innerHTML = `
        <div class="system-pill">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
          <span>${escapeHtml(message.text)}</span>
        </div>
      `;
    } else {
      messageElement.className = `message ${isOwn ? 'message-outgoing' : 'message-incoming'}`;
      const timeStr = message.timestamp ? new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
      const avatarSrc = message.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(message.user)}`;

      let bodyContent = '';
      if (message.file) {
        if (message.file.type && message.file.type.startsWith('image/')) {
          bodyContent = `
            <div class="file-message">
              <img src="${message.file.data}" alt="${escapeHtml(message.file.name)}" class="file-image-preview" title="Click to open full image">
            </div>
          `;
        } else {
          bodyContent = `
            <div class="file-message">
              <a href="${message.file.data}" download="${escapeHtml(message.file.name)}" class="file-download-card">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="12" y1="18" x2="12" y2="12"></line>
                  <line x1="9" y1="15" x2="15" y2="15"></line>
                </svg>
                <div>
                  <div style="font-weight:600; text-decoration: underline;">${escapeHtml(message.file.name)}</div>
                  <div style="font-size:0.75rem; color:#94a3b8;">${formatBytes(message.file.size)}</div>
                </div>
              </a>
            </div>
          `;
        }
      } else {
        bodyContent = `<div class="message-text">${escapeHtml(message.text)}</div>`;
      }

      messageElement.innerHTML = `
        <div class="message-header">
          <img src="${avatarSrc}" class="message-avatar" alt="${escapeHtml(message.user)}">
          <div class="sender-meta">
            <span class="sender">${isOwn ? 'You' : escapeHtml(message.user)}</span>
            <span class="timestamp">${timeStr}</span>
          </div>
        </div>
        <div class="message-bubble">
          ${bodyContent}
        </div>
      `;
    }

    messagesContainer.appendChild(messageElement);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  // Update Active Users in Sidebar & Count
  function updateUserList(users) {
    if (!Array.isArray(users)) return;
    
    usersList.innerHTML = users.map(user => {
      const userSeed = encodeURIComponent(user.name);
      const avatar = user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${userSeed}`;
      const isCurrentUser = user.name === username;

      return `
        <div class="user-item">
          <div class="user-item-avatar-wrapper">
            <img src="${avatar}" class="user-avatar" alt="${escapeHtml(user.name)}">
            <span class="user-online-dot"></span>
          </div>
          <div class="user-item-info">
            <span class="user-name-text">${escapeHtml(user.name)} ${isCurrentUser ? '(You)' : ''}</span>
            <span class="user-role-text">Active now</span>
          </div>
        </div>
      `;
    }).join('');

    const countText = `${users.length} online`;
    userCount.textContent = countText;
    if (activeBadgeCount) {
      activeBadgeCount.textContent = users.length;
    }
  }

  // Save Messages to localStorage
  function saveMessageToHistory(roomCode, message) {
    if (!roomCode) return;
    localMessageHistory[roomCode] = [...(localMessageHistory[roomCode] || []), message];
    try {
      localStorage.setItem('messageHistory', JSON.stringify(localMessageHistory));
    } catch (e) {
      console.warn('LocalStorage full or disabled', e);
    }
  }

  // Load Stored Messages
  function loadLocalHistory(roomCode) {
    messagesContainer.innerHTML = '';
    const messages = localMessageHistory[roomCode] || [];
    messages.forEach(displayMessage);
  }

  // Typing Indicator Logic
  function showTyping(user) {
    if (user === username) return; // Don't show typing for self
    let indicator = document.querySelector('.typing-indicator');
    if (!indicator) {
      indicator = document.createElement('div');
      indicator.className = 'typing-indicator';
      indicator.innerHTML = `
        <div class="typing-dots">
          <span class="typing-dot"></span>
          <span class="typing-dot"></span>
          <span class="typing-dot"></span>
        </div>
        <span class="typing-user-text">${escapeHtml(user)} is typing...</span>
      `;
      messagesContainer.appendChild(indicator);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    } else {
      const textSpan = indicator.querySelector('.typing-user-text');
      if (textSpan) textSpan.textContent = `${user} is typing...`;
    }
  }

  function hideTyping() {
    document.querySelectorAll('.typing-indicator').forEach(el => el.remove());
  }

  // Typing Event Dispatcher
  messageInput.addEventListener('input', () => {
    if (!isTyping) {
      isTyping = true;
      if (socket) socket.emit('typing', { roomCode: currentRoom, username });
    }
    lastTypingTime = Date.now();
    setTimeout(() => {
      if (Date.now() - lastTypingTime >= 2500 && isTyping) {
        if (socket) socket.emit('stopTyping', { roomCode: currentRoom });
        isTyping = false;
      }
    }, 2500);
  });

  // Message Send Logic
  sendBtn.addEventListener('click', sendMessage);
  messageInput.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  function sendMessage() {
    const text = messageInput.value.trim();
    if (!text) return;

    if (isTyping && socket) {
      socket.emit('stopTyping', { roomCode: currentRoom });
      isTyping = false;
    }

    if (socket) {
      socket.emit('sendMessage', {
        roomCode: currentRoom,
        message: text,
        username,
        avatar: userAvatar
      });
    }
    messageInput.value = '';
    messageInput.focus();
  }

  // File Upload Handling
  fileBtn.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      alert('File size exceeds the 10MB limit.');
      fileInput.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (socket) {
        socket.emit('sendFile', {
          roomCode: currentRoom,
          file: {
            name: file.name,
            type: file.type,
            data: reader.result,
            size: file.size
          },
          username,
          avatar: userAvatar
        });
      }
      fileInput.value = '';
    };
    reader.readAsDataURL(file);
  });

  // 1-Click Copy Room Code
  if (copyRoomBtn) {
    copyRoomBtn.addEventListener('click', () => {
      if (!currentRoom) return;
      navigator.clipboard.writeText(currentRoom).then(() => {
        showToast(`Room code "${currentRoom}" copied!`);
      }).catch(() => {
        // Fallback
        const temp = document.createElement('textarea');
        temp.value = currentRoom;
        document.body.appendChild(temp);
        temp.select();
        document.execCommand('copy');
        document.body.removeChild(temp);
        showToast(`Room code "${currentRoom}" copied!`);
      });
    });
  }

  // Emoji Drawer Handling
  if (emojiBtn && emojiDrawer) {
    emojiBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      emojiDrawer.classList.toggle('hidden');
    });

    document.querySelectorAll('.emoji-item-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        messageInput.value += e.target.textContent;
        messageInput.focus();
      });
    });

    document.addEventListener('click', (e) => {
      if (!emojiDrawer.contains(e.target) && e.target !== emojiBtn) {
        emojiDrawer.classList.add('hidden');
      }
    });
  }

  // Join Room Event
  joinBtn.addEventListener('click', () => {
    document.querySelectorAll('.error-message').forEach(e => e.remove());
    username = usernameInput.value.trim();
    const roomCode = roomCodeInput.value.trim().toUpperCase();

    if (!username) return showError(usernameInput, 'Please choose a display name');
    if (!roomCode) return showError(roomCodeInput, 'Please enter a valid room code');

    messagesContainer.innerHTML = '';
    initSocket();
    socket.emit('joinRoom', { roomCode, username, avatar: userAvatar });
  });

  // Create Room Event
  createBtn.addEventListener('click', () => {
    document.querySelectorAll('.error-message').forEach(e => e.remove());
    username = usernameInput.value.trim();
    if (!username) return showError(usernameInput, 'Please choose a display name');

    // Generate clean 6-character alphanumeric room code
    const generatedCode = 'ROOM-' + Math.random().toString(36).substring(2, 6).toUpperCase();
    roomCodeInput.value = generatedCode;
    messagesContainer.innerHTML = '';
    initSocket();
    socket.emit('joinRoom', { roomCode: generatedCode, username, avatar: userAvatar });
  });

  // Leave Room Event
  leaveBtn.addEventListener('click', () => {
    if (socket) socket.emit('leaveRoom', { roomCode: currentRoom });
    sessionStorage.removeItem('chatRoom');
    homeContainer.classList.remove('hidden');
    chatContainer.classList.add('hidden');
    currentRoom = '';
    messagesContainer.innerHTML = '';
  });

  window.addEventListener('beforeunload', () => {
    if (socket && currentRoom) socket.emit('leaveRoom', { roomCode: currentRoom });
  });

  // Auto-Restore Session on page refresh
  const savedRoom = sessionStorage.getItem('chatRoom');
  const savedUser = sessionStorage.getItem('username');
  if (savedRoom && savedUser) {
    username = savedUser;
    currentRoom = savedRoom;
    currentRoomSpan.textContent = currentRoom;
    initSocket();
    loadLocalHistory(currentRoom);
    socket.emit('joinRoom', { roomCode: currentRoom, username, avatar: userAvatar });
  }
});
