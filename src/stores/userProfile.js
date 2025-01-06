import { defineStore } from 'pinia';
import { ref } from 'vue';
import defaultAvatar from '../assets/images/basic/test-account.png'

export const useUserProfileStore = defineStore('userProfile', () => {
  // 使用者資料狀態
  const userId = ref(null);
  const email = ref('');
  const name = ref('');
  const birth = ref('');
  const photo = ref(defaultAvatar);
  const isProvider = ref(false);
  const stateId = ref(null);
  const providerId = ref(null);

  // 設定使用者資料
  const setUserProfile = (profile) => {
    userId.value = profile.userId;
    email.value = profile.email;
    name.value = profile.name;
    birth.value = profile.birth;
    photo.value = profile.photo ?? defaultAvatar;
    isProvider.value = profile.isProvider;
    stateId.value = profile.stateId;
    providerId.value = profile.providerId;
  };

  // 清空使用者資料（登出時使用）
  const clearUserProfile = () => {
    userId.value = null;
    email.value = '';
    name.value = '';
    birth.value = '';
    photo.value = defaultAvatar;
    isProvider.value = false;
    stateId.value = null;
    providerId.value = null;
  };

  return {
    userId,
    email,
    name,
    birth,
    photo,
    isProvider,
    stateId,
    providerId,
    setUserProfile,
    clearUserProfile
  };
  }, {
    persist: true  // 啟用持久化
  }
);
