<template >
  <!-- 驗證碼輸入區域 -->
  <div class="verification-container">
    
    <!-- 卡片內容 -->
    <div class="card-body">
      <RouterLink to="/profile/info" class="back-arrow">
        <i class="bi bi-arrow-left-circle"></i>
      </RouterLink> 
      <h2 class="title mb-4">信箱驗證</h2>
      <p class="instruction-text text-muted mb-3">
        我們已向您的信箱發送了一組驗證碼，<br />請在下方輸入以完成驗證。
      </p>
      
      <!-- 驗證碼輸入框 -->
      <div class="verification-section mb-4">
        <div class="code-inputs">
          <input type="text" v-for="(input, index) in codeInputs"  :key="index"  v-model="codeInputs[index]"  maxlength="1"  @input="moveToNextBox(index)" @keydown.backspace="moveToPreviousBox(index)" class="form-control verification-box  text-center fs-4" placeholder="-" />
        </div>
      </div>

      <!-- 按鈕區域 -->
      <div class="button-section d-grid gap-3 w-100">
        <button @click="confirmVerification" class="btn btn-primary btn-lg">
          確認驗證
        </button>
        <button @click="resendVerificationCode" class="btn btn-outline-secondary btn-lg">
          重新發送驗證碼
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useUserProfileStore } from '@/stores/userProfile';
import axios from '@/plugins/axios';
import Swal from 'sweetalert2';
import { handleApiError } from '../../utils/error/errorHandler.js';
import router from '../../routers/router.js'

const userProfileStore = useUserProfileStore();
const codeInputs = ref(['', '', '', '', '', '']);

// 驗證信箱驗證碼
const confirmVerification = async () => {
  try {
    const verificationCode = codeInputs.value.join('');
    if (verificationCode.length !== 6) {
      Swal.fire({
        icon: 'error',
        title: '錯誤',
        text: '請輸入完整的驗證碼。',
      });
      return;
    }

    const verificationDTO = {
      email: userProfileStore.email,
      verificationCode: verificationCode,
    };
    const response = await axios.post('/user/verify', verificationDTO);
    if (response.status === 200) {
      Swal.fire({
        icon: 'success',
        title: '驗證成功！',
        text: '您的信箱已成功驗證。',
      }).then(() => {
        userProfileStore.stateId = 10;
        localStorage.removeItem('verificationTimestamp')
        router.push({ name: 'profileinfo-link' });
      });
    }
  } catch (error) {
    if (error.response && error.response.status === 400) {
      handleApiError(error, '驗證碼不正確或已過期，請確認您的驗證碼。');
    } else {
      handleApiError(error, '驗證失敗，請稍後再試。');
    }
  }
};

// 重新發送驗證碼
const resendVerificationCode = async () => {
  Swal.fire({
    title: '發送中...',
    text: '請稍候，我們正在重新發送您的驗證碼',
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    },
  });

  try {
    const response = await axios.post('/user/resend', null, {
      params: {
        email: userProfileStore.email,
      },
    });
    if (response.status == 200) {
      Swal.fire({
        icon: 'success',
        title: '驗證碼已重新發送！',
        text: '請檢查您的信箱。',
      })
    }
  } catch (error) {
    if (error.response && error.response.status === 400) {
      handleApiError(error, '無法進行驗證，請確認帳號狀態')
    } else {
      handleApiError(error, '出現錯誤，請稍後再試')
    }
  }
};

// 輸入時，移動到下一格
const moveToNextBox = (index) => {
  if (codeInputs.value[index] !== '' && index < codeInputs.value.length - 1) {
    document.querySelectorAll('.verification-box')[index + 1].focus();
  }
};

// 刪除時，移動到上一格
const moveToPreviousBox = (index) => {
  if (codeInputs.value[index] === '' && index > 0) {
    document.querySelectorAll('.verification-box')[index - 1].focus();
  }
};
</script>

<style scoped>

.verification-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #dee2e6;
}

.card-body{
  max-width: 450px;
  margin: auto auto;
  padding: 2rem;
  border-radius: 15px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  background-color: #E5E5E5;
}

/* 返回上一頁箭頭 */
.back-arrow {
  position: absolute;
  font-size: 1.8rem;
  color: #666; 
  text-decoration: none;
}

.back-arrow:hover {
  color: #184e77;
}

.title {
  font-weight: 700;
  color: #333;
  text-align: center;
}

.instruction-text {
  font-size: 1rem;
  line-height: 1.5;
  text-align: center;
}

.verification-section {
  width: 100%;
  display: flex;
  justify-content: center;
}

.code-inputs {
  display: flex;
  gap: 10px; /* 每個輸入框之間的間距 */
}

.verification-input {
  width: 50px;
  height: 50px;
  font-size: 1.5rem;
  text-align: center;
  border-radius: 5px;
  border: 1px solid #ddd;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
}

.button-section {
  width: 100%;
}

.btn {
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-primary {
  background-color: #1e6091;
  border: none;
  color: white;
}

.btn-primary:hover {
  background-color: #184e77; 
}

.btn-outline-secondary {
  color: #6c757d;
  border-color: #6c757d;
}

.btn-outline-secondary:hover {
  background-color: #edae49;
  color: #fff;
}
</style>
