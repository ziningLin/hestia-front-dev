<template>
  <div class="reset-password-container">
    <!-- 卡片 -->
    <div class="reset-password-card">
      <RouterLink to="/auth/login" class="back-arrow">
        <i class="bi bi-arrow-left-circle"></i>
      </RouterLink>
      <div class="card-body">
        <h4 class="card-title text-center mb-4" v-if="isValidToken">重置密碼</h4>
        <h4 class="card-title text-center mb-4" v-else>驗證失敗</h4>

        <div v-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>

        <form v-if="isValidToken" @submit.prevent="handleResetPassword">
          <div class="form-group mb-3">
            <label for="newPwd">新密碼</label>
            <div class="password-input-container">
              <input :type="passwordFieldType" id="newPwd" v-model="newPwd" class="form-control" placeholder="請輸入您的新密碼" required />
              <button type="button" class="toggle-password-btn" @click="togglePasswordVisibility">
                <i :class="passwordFieldType === 'password' ? 'bi bi-eye' : 'bi bi-eye-slash'"></i>
              </button>
            </div>
          </div>
          <div class="form-group mb-4">
            <label for="confirmPwd">確認密碼</label>
            <div class="password-input-container">
              <input :type="passwordConfirmFieldType" id="confirmPwd" v-model="confirmPwd" class="form-control" placeholder="請再次輸入您的新密碼" required />
              <button type="button" class="toggle-password-btn" @click="togglePasswordConfirmVisibility">
                <i :class="passwordConfirmFieldType === 'password' ? 'bi bi-eye' : 'bi bi-eye-slash'"></i>
              </button>
            </div>
          </div>
          <div class="d-grid">
            <button type="submit" class="btn btn-primary">重置密碼</button>
          </div>
        </form>

        <div v-else class="d-grid">
          <router-link to="/auth/forgotPassword" class="btn btn-primary">重新申請重置密碼</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import Swal from 'sweetalert2';
import axios from '@/plugins/axios';
import router from '../../routers/router.js';

const newPwd = ref('');
const confirmPwd = ref('');
const token = ref('');
const errorMessage = ref('');
const isValidToken = ref(true);
const passwordFieldType = ref('password');
const passwordConfirmFieldType = ref('password');

// 切換顯示/隱藏密碼
const togglePasswordVisibility = () => {
  passwordFieldType.value = passwordFieldType.value === 'password' ? 'text' : 'password';
};

const togglePasswordConfirmVisibility = () => {
  passwordConfirmFieldType.value = passwordConfirmFieldType.value === 'password' ? 'text' : 'password';
};

onMounted(() => {
  const queryParams = new URLSearchParams(window.location.search);
  token.value = queryParams.get('token');
  errorMessage.value = queryParams.get('error');
  // 有錯誤信息，代表驗證失敗
  if (errorMessage.value) {
    isValidToken.value = false;  
  }
});

// 重置密碼
const handleResetPassword = async () => {
  if (!token.value) {
    Swal.fire({
      icon: 'error',
      title: '錯誤',
      text: '無法獲取驗證碼，請重新發送重置密碼郵件。',
    });
    return;
  }
  // 密碼/確認密碼
  if (newPwd.value !== confirmPwd.value) {
    Swal.fire({
      icon: 'error',
      title: '錯誤',
      text: '新密碼和確認密碼不一致，請重新輸入。',
    });
    return;
  }

  try {
    const response = await axios.put('/user/auth/reset-password', {
      token: token.value,
      newPwd: newPwd.value,
      confirmPwd: confirmPwd.value,
    });

    if (response.status === 200) {
      Swal.fire({
        icon: 'success',
        title: '重置成功',
        text: '密碼重置成功，請使用新密碼登入。',
      }).then(() => {
        router.push({ name: 'Login-link' });
      });
    }
  } catch (error) {
    if (error.response && error.response.status === 400) {
      Swal.fire({
        icon: 'error',
        title: '錯誤',
        text: error.response.data.message || '請求無效，請稍後再試。',
      });
    } else if (error.response && error.response.status === 404) {
      Swal.fire({
        icon: 'error',
        title: '錯誤',
        text: '驗證碼無效或已過期，請重新發送重置密碼郵件。',
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: '錯誤',
        text: '發生未知錯誤，請稍後再試。',
      });
    }
  }
};
</script>

<style scoped>
.reset-password-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #dee2e6;
}

.back-arrow {
  position: absolute;
  top: 20px;
  left: 20px;
  font-size: 1.8rem;
  color: #666;
}

.back-arrow:hover {
  color: #184e77;
}

.reset-password-card {
  background-color: #E5E5E5;
  width: 450px;
  padding: 30px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-radius: 20px;
  position: relative;
}

.card-title {
  font-size: 1.25rem;
  color: #333;
}

.btn-primary {
  background-color: #1e6091;
  border: none;
  color: white;
  padding: 10px;
  font-size: 1rem;
}

.btn-primary:hover {
  background-color: #184e77; 
}

.form-control {
  border-radius: 10px;
}

.password-input-container {
  position: relative;
  display: flex;
  align-items: center;
}

.toggle-password-btn {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.25rem;
  color: #6c757d;
}

.toggle-password-btn:focus {
  outline: none;
}

.toggle-password-btn:hover {
  color: #333;
}
</style>
