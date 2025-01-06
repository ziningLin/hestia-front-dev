<template>
  <div class="profile-content d-flex flex-column align-items-center">
    <h2 class="title mb-4">我的檔案</h2>
    <p class="instruction-text text-muted mb-3">管理您的帳戶</p>
    <div class="profile-main">
      <!-- 使用者基本資料 -->
      <div class="user-details">
        <div class="detail-item">
          <label for="email">信箱</label>
          <input type="text" id="email" v-model="userProfileStore.email" class="form-control" disabled />
          <span v-if="userProfileStore.stateId === 11" class="email-verification">
            尚未認證，<a href="#" @click.prevent="verifyEmail">是否立即進行驗證 ?</a>
            <a v-if="showVerificationButton" href="#" @click.prevent="toVerificationPage" class="btn btn-link">&lt;前往驗證頁面&gt;</a>
          </span>
          <span v-if="userProfileStore.stateId === 10" class="email-verification">信箱已驗證！</span>
        </div>

        <div class="detail-item">
          <label for="username">姓名</label>
          <input type="text" id="username" v-model="name" class="form-control"  placeholder="我們該怎麼稱呼您呢 ?">
        </div>

        <div class="detail-item">
          <label for="birthdate">生日</label>
          <input type="date" id="birthdate" v-model="birth" class="form-control" />
        </div>

        <!-- 保存按鈕 -->
        <div class="save-section">
          <button @click="saveProfile" class="btn btn-primary">儲存</button>
        </div>
      </div>

      <!-- 使用者大頭貼及修改區域 -->
      <div class="avatar-container">
        <img :src="avatarUrl" alt="頭貼" class="avatar" v-if="avatarUrl" />
        <div class="avatar-actions">
          <label for="file-upload" class="btn btn-secondary btn-choose-avatar">選擇圖片</label>
          <input type="file" id="file-upload" @change="changeAvatar" accept=".jpeg,.jpg,.png" hidden />
        </div>
        <p class="avatar-info">檔案大小: 最大 3MB</p>
        <p class="avatar-info-details">檔案限制: .JPG .JPEG .PNG .WEBP</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted,computed } from 'vue';
import axios from '@/plugins/axios.js';
import Swal from 'sweetalert2';
import { handleApiError } from '../../utils/error/errorHandler';
import router from '../../routers/router.js'
import { useUserProfileStore } from '../../stores/userProfile';

// Pinia
const userProfileStore = useUserProfileStore();

// 本地暫存的資料變數
const name = ref(userProfileStore.name);
const birth = ref(userProfileStore.birth);
const avatarFile = ref(null);
const avatarPreview = ref(null); // 預覽的頭像 URL
const avatarUrl = computed(() => {
  if (avatarPreview.value) {
    return avatarPreview.value;
  } else if (userProfileStore.photo && userProfileStore.photo.startsWith('/9j/')) {
    return `data:image/jpeg;base64,${userProfileStore.photo}`;
  } else {
    return userProfileStore.photo;
  }
});
const showVerificationButton = ref(false);

// 初始化
const init = async () => {
  try {
    const verificationTimestamp = localStorage.getItem('verificationTimestamp');
    if (verificationTimestamp && Date.now() - parseInt(verificationTimestamp) < 1800000) {
      showVerificationButton.value = true;
    }
  } catch (error) {
    console.error('無法獲取使用者資料:', error);
  }
};

// 修改頭貼按鈕
const changeAvatar = (event) => {
  const file = event.target.files[0];
  if (file) {
    avatarFile.value = file; 
    const reader = new FileReader();
    reader.onload = () => {
      avatarPreview.value = reader.result; 
    };
    reader.readAsDataURL(file); 
  }
};

// 點擊儲存按鈕
const saveProfile = async () => {
  const hasBasicInfoChanged = name.value !== userProfileStore.name || birth.value !== userProfileStore.birth;
  const hasAvatarChanged = avatarFile.value !== null;

  try {
    if (hasBasicInfoChanged) {
      await axios.put('/user/info', { name: name.value, birth: birth.value });
      Swal.fire({ icon: 'success', title: '個人資料已更新！' });
      userProfileStore.name = name.value;
      userProfileStore.birth = birth.value;
    }
    if (hasAvatarChanged) {
      const formData = new FormData();
      formData.append('photo', avatarFile.value);
      await axios.put('/user/photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      Swal.fire({ icon: 'success', title: '個人資料已更新！！' });
      userProfileStore.photo = avatarUrl.value.split(',')[1]; 
    }
  } catch (error) {
    handleApiError(error, '更新資料時發生錯誤，請稍後再試');
  }
};

// 點擊驗證信箱
const verifyEmail = async () => {
  Swal.fire({
    title: '發送中...',
    text: '請稍候，我們正在處理您的請求',
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    },
  });
  try {
    await axios.post('/user/verification-email');
    Swal.fire({
      icon: 'success',
      title: '驗證信已發送！',
      text: '請檢查您的信箱，並在30分鐘內完成驗證 !',
    }).then(() => {
      showVerificationButton.value = true;
      localStorage.setItem('verificationTimestamp', Date.now().toString());
      router.push({ name: 'emailVerification-link' });
    });
  } catch (error) {
    handleApiError('發送驗證信時發生錯誤，請稍後再試');
  }
};

const toVerificationPage = () => {
  const verificationTimestamp = localStorage.getItem('verificationTimestamp');
  if (verificationTimestamp && Date.now() - parseInt(verificationTimestamp) < 1800000) {
    router.push({ name: 'emailVerification-link' });
  } else {
    Swal.fire({ icon: 'error', title: '驗證碼已過期', text: '請重新發送驗證碼' });
    showVerificationButton.value = false;
    localStorage.removeItem('verificationTimestamp');
  }
};

// 初始化
onMounted(() => {
  init();  
});
</script>

<style scoped>
.profile-content {
  max-width: 900px;
  height:700px;
  margin: auto;
  padding: 2rem;
  border-radius: 15px;
  background-color: #E5E5E5;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.profile-main {
  display: flex;
  align-items: flex-start;
  gap: 60px; 
}

/* 頭像部分的樣式 */
.avatar-container {
  flex: 0 0 200px;
  text-align: center;
}

.avatar {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  object-fit: cover;
  display: block;
  margin: 0 auto 10px;
}

.btn-choose-avatar {
  background-color: #6c757d;
  color: white;
  border: none;
  padding: 5px 15px;
  cursor: pointer;
  font-size: 14px;
}

.user-details {
  flex: 1;
  width: 400px;
}

.detail-item {
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  align-items: flex-start; /* 左對齊標籤和輸入框 */
}

.detail-label {
  margin-bottom: 5px;
  font-weight: bold;
  color: #333;
}

.form-control {
  width: 100%;
  max-width: 500px; 
  padding: 10px;
  font-size: 16px;
  border: 1px solid #ddd;
  border-radius: 5px;
}

.save-section {
  text-align: left;
  margin-top: 30px;
}

.btn-primary {
  background-color: #1e6091;
  color: white;
  border: none;
  padding: 10px 20px;
  cursor: pointer;
  font-size: 16px;
  border-radius: 5px;
}

.btn-primary:hover {
  background-color: #184e77;
}

.avatar-info{
  font-size: 14px;
  margin-top: 10px;
  margin-bottom:0px;
}
.avatar-info-details{
  font-size: 12px;
  margin-top: 0px;
}
</style>
