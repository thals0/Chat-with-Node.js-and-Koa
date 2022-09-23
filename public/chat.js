// @ts-check
const socket = new WebSocket(`ws://${window.location.host}/chat`);

// socket server가 열리면 socket.send
socket.addEventListener('open', () => {
  socket.send('안녕 나 클라이언트');
});
