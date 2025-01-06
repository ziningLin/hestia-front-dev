import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useChatStore } from '../stores/chatStore.js';
import { createPinia, setActivePinia } from 'pinia';

const pinia = createPinia();
setActivePinia(pinia); // 設置為活動的 Pinia 實例


export const useWsStore = defineStore('ws', () => {
  const socket = ref(null);
  const chatStore = useChatStore();
  const isConnected = ref(false);
  let reconnectAttempts = 0;
  const maxReconnectAttempts = 5; 
  const reconnectInterval = 3000; // 每次重連之間的間隔時間，毫秒


  // 初始化
  const initWebSocket = () => {
    if (socket.value || isConnected.value) {
      return;// 防止重複建立連線
    } 
    socket.value = new WebSocket('ws://192.168.33.97:8080/hestia/ws/chat');

    socket.value.onopen = () => {
      console.log('WebSocket 連線成功');
      isConnected.value = true;
      reconnectAttempts = 0; 
    };

    socket.value.onclose = () => {
      console.log('WebSocket 連線已關閉');
      isConnected.value = false;
      socket.value = null; 

      if (reconnectAttempts < maxReconnectAttempts) {
        setTimeout(() => {
          reconnectAttempts++;
          console.log(`嘗試重新連接 WebSocket（第 ${reconnectAttempts} 次）...`);
          initWebSocket(); 
        }, reconnectInterval);
      } else {
        console.error('達到最大重連次數，停止重連');
      }
    };

    socket.value.onerror = (error) => {
      console.error('WebSocket 發生錯誤:', error);
    };

    socket.value.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'CHAT_MESSAGE') {
        console.log('收到聊天消息:', data);
        chatStore.addMessage({
          id: data.id,
          conversationId: data.conversationId,
          senderId: data.senderId,
          receiverId: data.receiverId,
          content: data.content,
          createdAt: data.createdAt,
          type: 'message'
        });
      } else if (data.type === 'NOTIFICATION') {
        // console.log('收到通知:', data);
      // 處理其他類型的通知
      }
    };
  }

  // 可以用來在組件中監控連線狀態
  const isSocketConnected = computed(() => isConnected.value);

  return {
    socket,
    isConnected,
    initWebSocket,
    isSocketConnected,  
  };
});
