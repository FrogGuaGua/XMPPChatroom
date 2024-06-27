

const server = {
    port:64442,
    address:"0.0.0.0"
}


const tlsOptions = {
    format: 'json',
    reconnection: true, // 是否自动重连
    reconnectionAttempts: 5, // 重连尝试次数
    reconnectionDelay: 3000, // 重连延迟（毫秒）
  };

const connectWebSocket = () => {
  VueNativeSock.install(Vue, socketUrl, socketOptions);

  Vue.prototype.$socket.onmessage = function (event) {
    console.log('收到消息:', event.data);
    receivedMessage.value = event.data;
  };

  Vue.prototype.$socket.onopen = function () {
    console.log('WebSocket 连接已建立');
    socketConnected.value = true;
  };
};

import { ref } from 'vue';

const socketConnected = ref(false);
const receivedMessage = ref('');