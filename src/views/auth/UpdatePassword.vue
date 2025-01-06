<template>
  <div class="password-change-container">
    <div class="password-form-card">
      <RouterLink to="/profile/info" class="back-arrow">
        <i class="bi bi-arrow-left-circle"></i>
      </RouterLink>
      <h4 class="title mb-4">修改密碼</h4>
      <form @submit.prevent="validateAndSubmit">
        <div class="form-group mb-3">
          <label for="current-password">當前密碼</label>
          <div class="password-input-container">
            <input :type="currentPasswordFieldType" id="current-password" v-model="currentPwd" class="form-control" placeholder="請輸入當前密碼" required />
            <button type="button" class="toggle-password-btn" @click="toggleCurrentPasswordVisibility">
              <i :class="currentPasswordFieldType === 'password' ? 'bi bi-eye' : 'bi bi-eye-slash'"></i>
            </button>
          </div>
        </div>
        <div class="form-group mb-3" :class="{ 'has-error': newPwdError }">
          <label for="new-password">新密碼</label>
          <div class="password-input-container">
            <input :type="newPasswordFieldType" id="new-password" v-model="newPwd" class="form-control" placeholder="請輸入新密碼" required />
            <button type="button" class="toggle-password-btn" @click="toggleNewPasswordVisibility">
              <i :class="newPasswordFieldType === 'password' ? 'bi bi-eye' : 'bi bi-eye-slash'"></i>
            </button>
          </div>
          <small v-if="newPwdError" class="text-danger">{{ newPwdError }}</small>
        </div>
        <div class="form-group mb-4" :class="{ 'has-error': confirmPwdError }">
          <label for="confirm-password">確認新密碼</label>
          <div class="password-input-container">
            <input :type="confirmPasswordFieldType" id="confirm-password" v-model="confirmPwd" class="form-control" placeholder="請再次輸入新密碼" required />
            <button type="button" class="toggle-password-btn" @click="toggleConfirmPasswordVisibility">
              <i :class="confirmPasswordFieldType === 'password' ? 'bi bi-eye' : 'bi bi-eye-slash'"></i>
            </button>
          </div>
          <small v-if="confirmPwdError" class="text-danger">{{ confirmPwdError }}</small>
        </div>
        <div class="d-grid">
          <button type="submit" class="btn btn-primary">修改密碼</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import axios from '@/plugins/axios';
import Swal from 'sweetalert2';
import { handleApiError } from '../../utils/error/errorHandler.js';
import router from '../../routers/router.js';

const currentPwd = ref('');
const newPwd = ref('');
const confirmPwd = ref('');
const currentPasswordFieldType = ref('password');
const newPasswordFieldType = ref('password');
const confirmPasswordFieldType = ref('password');

const newPwdError = ref('');
const confirmPwdError = ref('');

// 驗證密碼強度
const validatePasswordStrength = (password) => {
    const passwordPattern = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=])(?=\S+$).{8,}$/;
    return passwordPattern.test(password);
};

// 修改密碼
const validateAndSubmit = async () => {
  newPwdError.value = '';
  confirmPwdError.value = '';

  // 驗證密碼強度
  if (!validatePasswordStrength(newPwd.value)) {
    newPwdError.value = '為了確保帳號安全，請在您的密碼包含大小寫字母、數字、特殊符號，並至少有 8 個字元';
    return;
  }

  if (newPwd.value.length < 8) {
    newPwdError.value = '密碼至少需要 8 個字元。';
    return;
  }

  if (newPwd.value !== confirmPwd.value) {
    confirmPwdError.value = '新密碼和確認密碼不一致，請重新輸入。';
    return;
  }

  // 如果驗證通過，進行提交
  await updatePassword();
};

const updatePassword = async () => {
  try {
    const response = await axios.put('/user/password', {
      currentPwd: currentPwd.value,
      newPwd: newPwd.value,
      confirmPwd: confirmPwd.value,
    });
    if (response.status === 200) {
      Swal.fire({
        icon: 'success',
        title: '密碼修改成功',
        text: '您的密碼已成功更新。',
      }).then(() => {
        router.push({ name: 'profileinfo-link' });
      });
    }
  } catch (error) {
    if (error.response && error.response.status === 400) {
      handleApiError(error, '出現錯誤，請檢查您輸入的資料');
    } else {
      handleApiError(error);
    }
  }
};

// 切換顯示/隱藏密碼
const toggleCurrentPasswordVisibility = () => {
  currentPasswordFieldType.value = currentPasswordFieldType.value === 'password' ? 'text' : 'password';
};

const toggleNewPasswordVisibility = () => {
  newPasswordFieldType.value = newPasswordFieldType.value === 'password' ? 'text' : 'password';
};

const toggleConfirmPasswordVisibility = () => {
  confirmPasswordFieldType.value = confirmPasswordFieldType.value === 'password' ? 'text' : 'password';
};
</script>

<style scoped>
.password-change-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #dee2e6;
}

.back-arrow {
  position: absolute;
  top: 3%;
  left: 3%;
  font-size: 1.8rem;
  color: #666;
}

.back-arrow:hover {
    color: #184e77;
}

.password-form-card {
  background-color: #E5E5E5;
  width: 450px;
  padding: 30px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-radius: 20px;
  position: relative;
}

.title {
  font-size: 1.25rem;
  color: #333;
  text-align: center;
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

.has-error .form-control {
  border-color: #e3342f; /* 錯誤邊框顏色 */
}

.text-danger {
  color: #e3342f; /* 錯誤訊息顏色 */
}
</style>
