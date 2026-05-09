import io from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

let socket = null;

export const connectSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    });

    socket.on('connect', () => {
      console.log('✓ WebSocket connected');
    });

    socket.on('disconnect', () => {
      console.log('✗ WebSocket disconnected');
    });
  }

  return socket;
};

export const subscribeToRoute = (routeId) => {
  if (socket) {
    socket.emit('subscribe:route', routeId);
  }
};

export const unsubscribeFromRoute = (routeId) => {
  if (socket) {
    socket.emit('unsubscribe:route', routeId);
  }
};

export const onVehicleUpdate = (callback) => {
  if (socket) {
    socket.on('vehicle:updated', callback);
  }
};

export const onNewReport = (callback) => {
  if (socket) {
    socket.on('new:report', callback);
  }
};

export const onScheduleUpdate = (callback) => {
  if (socket) {
    socket.on('schedule:updated', callback);
  }
};

export const emitVehicleUpdate = (data) => {
  if (socket) {
    socket.emit('vehicle:update', data);
  }
};

export const emitNewReport = (data) => {
  if (socket) {
    socket.emit('report:created', data);
  }
};

export const emitScheduleChange = (data) => {
  if (socket) {
    socket.emit('schedule:changed', data);
  }
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export default {
  connectSocket,
  subscribeToRoute,
  unsubscribeFromRoute,
  onVehicleUpdate,
  onNewReport,
  onScheduleUpdate,
  emitVehicleUpdate,
  emitNewReport,
  emitScheduleChange,
  disconnectSocket
};
