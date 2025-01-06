<template>
    <!-- 按鈕 -->
    <div v-if="!chatStore.isChatBoxOpen" class="chat-button" @click="toggleChat">
      <i class="bi bi-chat-left-text-fill"></i>聊聊
    </div>
        
    <!-- 窗口 -->
    <div v-if="chatStore.isChatBoxOpen" class="chat-container">
      <!-- header -->
      <div class="display-box-header">
        <div class="chat-list-header">
          <h3>聊聊</h3>
        </div>
        <span class="close-button" @click="toggleChat"  >
          <i class="bi bi-x-square"></i>
        </span>
      </div>

      <!--主要區域-->
      <div class="display-box-main">
      <!-- 左邊對話清單 -->
        <div class="chat-list">
          <div class="chat-list-serach">
            <!-- 搜尋框 -->
            <div class="chat-search">
              <input type="text" placeholder="搜尋" v-model="searchQuery" />
            </div>
            <!-- 篩選下拉選單 -->
            <div class="chat-filter">
              <select v-model="filter">
                <option value="all">全部</option>
                <option value="unread">未讀</option>
              </select>
            </div>
          </div>
          <!-- 對話列表 -->
          <div class="conversations">
            <div class="conversation-item" v-for="conversation in filteredConversations" :key="conversation.id" @click="selectConversation(conversation)">
              <img :src="conversation.photo ? `data:image/jpeg;base64,${conversation.photo}` : '/src/assets/images/basic/test-account.png'" alt="Avatar"   class="avatar"/>
              <div class="conversation-info">
                <div class="conversation-name">{{ conversation.otherUserNameOrEmail }}</div>
                <div class="conversation-message">{{ conversation.lastMsgContent }}</div>
              </div>
              <div class="conversation-date">
                <div>{{ conversation.lastMsgAt }}</div>
                
                <span v-if="conversation.unreadMsgCount > 0" class="unread-count">
                  {{ conversation.unreadMsgCount }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- 右邊訊息框 -->
        <div class="chat-box">
          <!-- Header -->
          <div class="chat-box-header">
            <h3>{{  chatStore.selectedConversation?.otherUserNameOrEmail }}</h3>
          </div>

          <div class="messages" ref="messagesContainer">
            <div v-if="!chatStore.selectedConversation" class="welcome-message">
              <!-- 預設圖片與文字 -->
              <img src="../assets/images/basic/welcome.png" alt="歡迎" class="welcome-image" />
              <p class="welcome-text">歡迎使用 Hestia 客服功能！</p>
            </div>
            <div v-else>
              <div v-for="message in chatStore.messages" :key="message.id || message.date" :class="[message.type === 'date-separator' ? 'date-separator-wrapper' : 'message-wrapper']">
                <div v-if="message.type == 'date-separator'" class="date-separator">{{ message.date }}</div>
                <div v-else-if="message.type === 'message'" :class="['message-item', message.senderId === userProfileStore.userId ? 'sent' : 'received']">
                  <div class="message-text-wrap">{{ message.content }}</div>
                  <div class="message-time">{{ formatTime(message.createdAt) }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- 訊息輸入框 -->
            <div  class="message-input" >
              <input type="text" placeholder="輸入訊息..." @keyup.enter="sendMessage" ref="messageInput" v-model="newMessage" />
              <button @click="sendMessage">發送</button>
            </div>
        </div>
      </div>
    </div>
</template>
  
<script setup>
import { ref , watch ,nextTick ,computed } from 'vue'
import axios from '../plugins/axios.js';
import { format , parse } from 'date-fns';
import { useUserProfileStore } from '../stores/userProfile';
import { useChatStore } from '../stores/chatStore.js';
import { addDateSeparators } from '../utils/dateUtil.js';

// pinia
const userProfileStore = useUserProfileStore();
const chatStore = useChatStore();

// 聊天相關的資料
const searchQuery = ref('');
const filter = ref('all');
const newMessage = ref('');
const messagesContainer = ref(null);
const messageInput = ref(null);

const toggleChat = chatStore.toggleChat;

// 滾動到最下面
const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
};

// 監聽消息變化，自動滾動到最底部
watch(() => chatStore.messages,async () => {
    await nextTick();
    scrollToBottom();
  },{ deep: true }
);

// 選擇對話並加載訊息紀錄，並標示已讀
const selectConversation = async (conversation) => {
  await chatStore.setSelectedConversation(conversation); 
  scrollToBottom();
};

// 篩選後的清單
const filteredConversations = computed(() => {
  return chatStore.conversations.filter((conv) => {
    const matchesSearch = conv.otherUserNameOrEmail.toLowerCase().includes(searchQuery.value.toLowerCase());
    const matchesFilter = filter.value === 'all' || (filter.value === 'unread' && conv.unreadMsgCount > 0);
    return matchesSearch && matchesFilter;
  });
});

// 發送消息
const sendMessage = async () => {
  console.log('newMessage.value ======',newMessage.value);
  console.log('chatStore.selectedConversation ====',chatStore.selectedConversation);
  
  
  if (newMessage.value && chatStore.selectedConversation) {
    console.log(1);
    
    const messagePayload = {
      conversationId: chatStore.selectedConversation.id,
      senderId: userProfileStore.userId,
      receiverId: chatStore.selectedConversation.otherUserId,
      content: newMessage.value,
      isRead: false,
    };

    try {
      await axios.post('/chat/messages', messagePayload);
        // 創建新消息物件
        const newMessageObject = {
          ...messagePayload,
          createdAt: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
        };
      // 將新消息推送到消息列表並重新處理日期分隔  
      console.log('newMessageObject =====',newMessageObject);
      
      chatStore.messages.push(newMessageObject);
      console.log(chatStore.messages);
      
      chatStore.messages = addDateSeparators(chatStore.messages); 
      newMessage.value = '';
      await nextTick(() => {
        if (messageInput.value) {
          messageInput.value.focus(); // 聚焦輸入框
        }
      });
    } catch (error) {
      console.error('發送消息時出現錯誤:', error);
    }
  }
};

// 修改訊息時間格式
const formatTime = (createdAt) => {
  if (!createdAt) return ''; 
  if (typeof createdAt === 'string') {
    const [datePart, timePart] = createdAt.split(' ');
    if (datePart && timePart) {
      const [hours, minutes] = timePart.split(':');
      return `${hours}:${minutes}`;
    }else{
      const [hours, minutes] = createdAt.split(':');
      return `${hours}:${minutes}`;
    }
  }
  // 確保是 Date 對象
  // const date = new Date(createdAt);
  // if (isNaN(date.getTime())) {
  //   console.error('Invalid date format:', createdAt);
  //   return '';
  // }

  // return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};
</script>

<style scoped>
.chat-button {
  position: fixed;
  width: 80px; 
  height: 35px; 
  right: 20px;
  bottom: 0px;
  font-size: 14px;
  background-color: #f9f6ef; 
  color: #333; 
  padding: 5px;
  border-radius: 5px 5px 0 0;
  cursor: pointer;
  box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.2); 
  display: flex;
  align-items: center; 
  justify-content: center; 
  font-family: 'Patrick Hand', sans-serif; 
  font-weight: bold;
  transition: background-color 0.3s, box-shadow 0.3s; 
  z-index:9999;
}

.chat-button:hover {
  background-color: #f3e9d9; 
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.3); 
}

.chat-button i{
  margin-right: 5px;
}

.chat-container {
  position: fixed;
  bottom:0px;
  right: 10px;
  width: 700px;
  height: 400px;
  border: 1px solid #ddd;
  border-radius: 5px 5px 0 0;
  box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.2); 
  background-color: #fff;
  display: flex;
  flex-direction: column;
  z-index: 9999;
}

.display-box-header{
  height: 30px;
  display: flex;
  align-items: center; 
  padding: 10px;
  background-color: #f5f5f5;
}

.close-button {
  cursor: pointer;
  margin-left: auto; 
  font-size: 16px; 
}

.display-box-main{
  display: flex;
  flex: 1; 
  overflow: hidden; 
}

/* 左邊對話清單 */
.chat-list {
  width: 30%;
  border-right: 1px solid #ddd;
  padding: 5px;
  overflow-y: auto; 
  overflow-x: hidden;
  box-sizing: border-box;
}

.chat-list-header {
  margin-bottom: 0px;
}

.chat-list-header h3{
  font-family: 'Patrick Hand', sans-serif; 
  font-weight: bold;
  font-size: 15px;
  margin: auto;
}

.chat-list-serach{
  display: flex;
}

.chat-search input {
  width: 120px;
  height: 25px;
  padding: 5px;
  margin-right: 5px;
  margin-bottom: 5px;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.chat-filter select {
  width: 60px;
  height: 25px;
  padding: 3px;
  margin-bottom: 5px;
  font-size: 14px;
  border: none;
}

.conversations {
  width: 200px;
  overflow-y: auto;
  height: calc(100% - 80px);

}

.conversation-item {
  display: flex;
  align-items: center;
  padding: 6px;
  cursor: pointer;
  transition: background 0.3s;
  overflow: hidden; 
  white-space: nowrap; 
  text-overflow: ellipsis; /* 過長文字顯示省略號 */
  width: 100%; 
  box-sizing: border-box; 
  font-size: 14px;
}

.conversation-item:hover {
  background-color: #f5f5f5;
}

.unread-count {
  background-color: #ff4d4d;
  color: white;
  padding: 2px 6px;
  border-radius: 12px;
  font-size: 12px;
  /* margin-left: 10px; */
  /* margin: 0px 0px 0px 0px; */
  display: inline-block;
  min-width: 20px;
  text-align: center;
}

.avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  margin-right: 10px;
  flex-shrink: 0;
}

.conversation-info {
  flex: 1;
  overflow: hidden;
  width: auto;
}

.conversation-name {
  font-weight: bold;
  overflow: hidden;          
  text-overflow: ellipsis;   
  white-space: nowrap;      
  max-width: 90%;
}

.conversation-message {
  color: #888;
  overflow: hidden;          
  text-overflow: ellipsis;   
  white-space: nowrap;       
  max-width: 90%;
}

.conversation-date {
  margin-left: auto; 
  font-size: 0.8em;
  flex-shrink: 0; 
  align-self: flex-start; 
}

/* 右邊訊息框 */
.chat-box {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 5px;
}

.chat-box-header {
  font-size: 1.2em;
  font-weight: bold;
}

.chat-box-header h3{
  font-size: 16px;
  margin-bottom: 5px;
  margin-left: 5px;
  font-weight: bold;
}

.welcome-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%; 
  text-align: center;
  background-color: #f5f5f5; 
}

.welcome-image {
  max-width: 200px; 
  margin-bottom: 10px;
}

.welcome-text {
  font-size: 16px;
  color: #888;
  font-weight: bold;
}

.messages {
  flex: 1;
  width: 478px;
  overflow-y: auto;
  overflow-x: hidden;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
}

.message-item {
  word-wrap: break-word; 
  overflow-wrap: break-word; 
  padding: 10px 50px 20px 10px;
  border-radius:5px;
  background-color: #f0f0f0; 
  font-size: 14px;
  box-sizing: border-box;
  position: relative; 
  display: flex;
}

.date-separator-wrapper {
  text-align: center;
  margin: 10px 0;
}

.date-separator {
  color: gray;
  font-size: 0.85rem;
}

.message-wrapper {
  display: flex;  
  position: relative;
}

.sent {
  background-color: #ffe5b4; 
  align-self: flex-end; 
  text-align: left; 
  position: relative;
  display: inline-block;
  justify-content: space-between;
  flex-wrap: wrap;
  margin: 5px 8px 5px auto;
  padding: 10px;
  max-width: 70%; 
  min-width: 80px;
  color: #555;
  font-size: 16px;
  border-radius: 10px;
  box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.1);
  box-sizing: border-box;
}

.sent::after {
  content: '';
  position: absolute;
  top: 0px; 
  right: -10px; 
  width: 20px;
  height: 20px;
  border: 15px solid transparent;
  border-top: 15px solid #ffe5b4;
}

.received {
  background-color: #f9f7f1; 
  align-self: flex-start; 
  text-align: left; 
  position: relative;  
  display: inline-block;  
  margin: 5px auto 5px 8px; 
  padding: 10px;  
  max-width: 70%; 
  min-width: 80px;
  color: #555;  
  font-size: 16px;  
  border-radius: 10px;  
  box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.1); 
}

.received::after {
  content: '';
  position: absolute;
  top: 0px;  
  left: -10px; 
  width: 20px;  
  height: 20px;  
  border: 15px solid transparent;  
  border-top: 15px solid #f9f7f1; 
  z-index: 5; 
}

.message-time {
  font-size: 11px;
  color: gray;
  align-self: flex-end; 
  margin: 0px 0px 0px auto; 
  padding-left: 15px; 
  text-align: right;
}

.message-input {
  display: flex;
  align-items: center;
}

.message-input input {
  flex: 1;
  padding: 5px;
  border-radius: 4px;
  border: 1px solid #ddd;
  margin-right: 5px;
}

.message-input button {
  background-color: #f05;
  color: #fff;
  border: none;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
}
</style>
  