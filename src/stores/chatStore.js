import { defineStore } from 'pinia';
import { ref } from 'vue';
import axios from '../plugins/axios.js';  
import { useUserProfileStore } from '../stores/userProfile';
import { addDateSeparators } from '../utils/dateUtil.js';

export const useChatStore = defineStore('chat', () => {
  const userProfileStore = useUserProfileStore();
  // 當前選擇的對話
  const selectedConversation = ref(null);
  // 所有對話列表
  const conversations = ref([]);
  // 當前對話的消息列表
  const messages = ref([]); 
  // 對話開啟/關閉
  const isChatBoxOpen = ref(false)

  // 設定當前選擇的對話
  const setSelectedConversation = async (conversation) => {
    selectedConversation.value = conversation;
    messages.value = [];
    try {
      const response = await axios.get(`/chat/messages/${conversation.id}`);
      messages.value = addDateSeparators(response.data);
      // 標記消息為已讀
      if (conversation.unreadMsgCount > 0) {
        await markMessagesAsRead(conversation.id);
        conversation.unreadMsgCount = 0;
      }
    } catch (error) {
      console.error('獲取歷史訊息時出現錯誤:', error);
    }
  };

  // 標記消息為已讀
  const markMessagesAsRead = async (conversationId) => {
    try {
      await axios.put(`/chat/messages/read/${conversationId}`, {
        receiverId: userProfileStore.userId,
      });
    } catch (error) {
      console.error('標記消息為已讀時出現錯誤:', error);
    }
  };

  // 添加新消息
  const addMessage = async (message) => {
    if (selectedConversation.value?.id === message.conversationId) {
      messages.value.push(message); // 如果屬於當前對話，更新消息列表   
      await axios.put('/chat/messages/read', {// 更新已讀回執
        messageId: message.id,
      });
    } else {
      // 如果不屬於當前對話，更新未讀數量
      const conversation = conversations.value.find(
        (conv) => conv.id === message.conversationId
      );
      if (conversation) {
        conversation.unreadMsgCount += 1;
        conversation.lastMsgContent = message.content;
        conversation.lastMsgAt = message.createdAt;
      }
    }
  };

    // 切換狀態並加載對話列表
    const toggleChat =async () => {
      isChatBoxOpen.value = !isChatBoxOpen.value
      if (isChatBoxOpen.value) {
        try {
          const response = await axios.get('/chat/conversations');  
          conversations.value = response.data;
        } catch (error) {
          console.error('獲取對話清單時出現錯誤:', error);
        }
      }else{
        messages.value = null;
        selectedConversation.value = null;
      }
    }

    // 呼叫後端 API，開始或獲取對話
    const startConversation = async (otherUserId,otherUserNameOrEmail) => {
      try {
        const response = await axios.post('/chat/conversation', {
          'otherUserId': otherUserId,
        });
        console.log(response);
        
        if (response.status === 200) {
          const { status, conversationId } = response.data;

          if (status === 'created') {
            // 添加新對話到清單
            const newConversation = {
              id: conversationId,
              otherUserId: otherUserId,
              otherUserNameOrEmail: otherUserNameOrEmail, 
              lastMsgContent: '', 
              lastMsgAt: null, 
              unreadMsgCount: 0,
            };
            conversations.value.push(newConversation);
          }

          // 選擇該對話
          const targetConversation =conversations.value.find(
            (conv) => conv.id === conversationId
          );
          if (targetConversation) {
            await setSelectedConversation(targetConversation);
          }
          if (!isChatBoxOpen.value) {
            await toggleChat();
          }
        }
      } catch (error) {
        console.error('創建或獲取對話時出現錯誤:', error);
      }
    };

  return {
    selectedConversation,
    conversations,
    messages,
    isChatBoxOpen,
    setSelectedConversation,
    addMessage,
    toggleChat,
    startConversation
  };
});
