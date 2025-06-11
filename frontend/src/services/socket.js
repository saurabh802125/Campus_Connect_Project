import io from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
  }

  connect() {
    if (this.socket && this.isConnected) {
      return this.socket;
    }

    try {
      this.socket = io(SOCKET_URL, {
        transports: ['websocket', 'polling'],
        autoConnect: true,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
        timeout: 20000,
      });

      this.socket.on('connect', () => {
        console.log('Socket connected:', this.socket.id);
        this.isConnected = true;
      });

      this.socket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
        this.isConnected = false;
      });

      this.socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        this.isConnected = false;
      });

      this.socket.on('reconnect', (attemptNumber) => {
        console.log('Socket reconnected after', attemptNumber, 'attempts');
        this.isConnected = true;
      });

      return this.socket;
    } catch (error) {
      console.error('Failed to create socket connection:', error);
      return null;
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      console.log('Socket manually disconnected');
    }
  }

  // Library-specific methods
  joinLibrary(libraryId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('join-library', libraryId);
      console.log(`Joined library room: ${libraryId}`);
    }
  }

  leaveLibrary(libraryId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('leave-library', libraryId);
      console.log(`Left library room: ${libraryId}`);
    }
  }

  // Real-time seat update listeners
  onSeatUpdate(callback) {
    if (this.socket) {
      this.socket.on('seat-update', (data) => {
        console.log('Received seat update:', data);
        callback(data);
      });
    }
  }

  onLibrarySeatUpdate(callback) {
    if (this.socket) {
      this.socket.on('library-seat-update', (data) => {
        console.log('Received library seat update:', data);
        callback(data);
      });
    }
  }

  offSeatUpdate() {
    if (this.socket) {
      this.socket.off('seat-update');
      this.socket.off('library-seat-update');
    }
  }

  // Event seat updates
  onEventSeatUpdate(callback) {
    if (this.socket) {
      this.socket.on('event-seat-update', callback);
    }
  }

  offEventSeatUpdate() {
    if (this.socket) {
      this.socket.off('event-seat-update');
    }
  }

  // Emit seat booking events
  emitSeatBooked(data) {
    if (this.socket && this.isConnected) {
      this.socket.emit('seat-booked', data);
    }
  }

  emitSeatReleased(data) {
    if (this.socket && this.isConnected) {
      this.socket.emit('seat-released', data);
    }
  }

  // Request current library status
  requestLibraryStatus(libraryId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('request-library-status', libraryId);
    }
  }

  // Check connection status
  isSocketConnected() {
    return this.socket && this.isConnected;
  }

  // Get socket ID
  getSocketId() {
    return this.socket ? this.socket.id : null;
  }
}

// Create singleton instance
const socketService = new SocketService();

export default socketService;