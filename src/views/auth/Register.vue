<template>
    <div class="login-background">
        <!-- lottie 動畫-->
        <div id="lottie-fire-animation" class="lottie-container"></div>
  
        <RouterLink to="/" class="back-home-icon">
            <i class="bi bi-house-door-fill"></i>
            <span> Hestia</span>
        </RouterLink>
  
        <!-- 註冊卡片 -->
        <div class="login-card-container">
            <div class="card">
                <div class="card-body">
                    <h3 class="card-title text-center mb-4">註冊</h3>
                    <form @submit.prevent="handleRegister">
                        <div class="form-group mb-3">
                            <label for="email">信箱</label>
                            <input type="email" id="email" v-model="email" class="form-control" placeholder="請輸入您的信箱" @blur="checkEmailAvailability" required />
                            <div v-if="emailError" class="text-danger mt-1 errorMessage">{{ emailError }}</div>
                        </div>
                        <div class="form-group mb-4">
                            <label for="password">密碼</label>
                            <div class="password-input-container">
                                <input :type="passwordFieldType" id="password" v-model="password" class="form-control" placeholder="請輸入您的密碼" required />
                                <button type="button" class="toggle-password-btn" @click="togglePasswordVisibility('password')">
                                    <i :class="passwordFieldType === 'password' ? 'bi bi-eye' : 'bi bi-eye-slash'"></i>
                                </button>
                            </div>
                            <div v-if="passwordStrengthError" class="error-message text-danger errorMessage">{{ passwordStrengthError }}</div>
                        </div>

                        <div class="form-group mb-4">
                            <label for="confirmPwd">確認密碼</label>
                            <div class="password-input-container">
                                <input :type="confirmPasswordFieldType" id="confirmPwd" v-model="confirmPwd" class="form-control" placeholder="請再次輸入您的密碼" required />
                                <button type="button" class="toggle-password-btn" @click="togglePasswordVisibility('confirm')">
                                    <i :class="confirmPasswordFieldType === 'password' ? 'bi bi-eye' : 'bi bi-eye-slash'"></i>
                                </button>
                            </div>
                            <div v-if="confirmPwdError" class="error-message text-danger errorMessage">{{ confirmPwdError }}</div>
                        </div>
                        <div class="d-grid">
                            <button type="submit" class="btn btn-primary" :disabled="emailError !== ''">註冊</button>
                        </div>
                    </form>
                    <div class="text-center mt-3">
                        <span>已經有帳號了嗎 ? </span><router-link to="/auth/login">登入</router-link>
                    </div>
                </div>
            </div>
        </div>
    </div>
  </template>
  

<script setup>
import { ref } from 'vue';
import Swal from 'sweetalert2';
import axios from '@/plugins/axios';
import { handleApiError } from '../../utils/error/errorHandler';
import router from '../../routers/router.js';
import Lottie from 'lottie-web';
import { onMounted } from 'vue';
import debounce from 'lodash/debounce';


const email = ref('');
const password = ref('');
const confirmPwd = ref('');
const emailError = ref(''); 
const passwordFieldType = ref('password');
const confirmPasswordFieldType = ref('password');
const passwordStrengthError = ref('');
const confirmPwdError = ref('');

// 顯示/隱藏密碼
const togglePasswordVisibility = (field) => {
    if (field === 'password') {
        passwordFieldType.value = passwordFieldType.value === 'password' ? 'text' : 'password';
    } else if (field === 'confirm') {
        confirmPasswordFieldType.value = confirmPasswordFieldType.value === 'password' ? 'text' : 'password';
    }
};

// 檢查信箱是否可用( 防抖動，延遲500毫秒 )
const checkEmailAvailability = debounce(async () => {
  if (!email.value || !isValidEmail(email.value)) {
    emailError.value = '「信箱格式看起來不太對，請檢查一下。像這樣：example@example.com」';
    return;
  }

  try {
    const response = await axios.get('/user/auth/check-email', { params: { email: email.value } });
    if (response.status === 200) {
      emailError.value = '';
    }
  } catch (error) {
    if (error.response && error.response.status === 409) {
      emailError.value = '該信箱已被註冊，請使用其他信箱';
    } else {
      emailError.value = '發生錯誤，請稍後再試';
    }
  }
},500);

// 驗證信箱格式是否有效
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// 驗證密碼強度
const validatePasswordStrength = (password) => {
    const passwordPattern = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=])(?=\S+$).{8,}$/;
    return passwordPattern.test(password);
};

// 驗證密碼與確認密碼是否匹配
const validatePasswordMatch = () => {
    return password.value === confirmPwd.value;
};

// 註冊
const handleRegister = async () => {
    // 驗證密碼強度
    if (!validatePasswordStrength(password.value)) {
        passwordStrengthError.value = '為了確保帳號安全，請在您的密碼包含大小寫字母、數字、特殊符號，並至少有 8 個字元';
        return;
    } else {
        passwordStrengthError.value = ''; 
    }

    // 驗證密碼與確認密碼是否匹配
    if (!validatePasswordMatch()) {
        confirmPwdError.value = '兩次輸入的密碼不一致，請再確認一下吧！';
        return;
    } else {
        confirmPwdError.value = ''; 
    }

  try {
      const response = await axios.post('/user/auth/register', {
          email: email.value,
          password: password.value,
          confirmPwd:confirmPwd.value
      });

      // 成功
      if (response.status === 200) {
          Swal.fire({
              icon: 'success',
              title: '註冊成功 !',
              text: '請使用您的帳戶登入',
          }).then(()=>{
            router.push({ name: 'Login-link' });
          });
      }
  } catch (error) {
      if (error.response && error.response.status === 409) {
          handleApiError(error, '該信箱已被註冊，請使用其他信箱。');
      } else if (error.response && error.response.status === 400) {
          handleApiError(error, '請檢查輸入資料是否正確。');
      } else {
          handleApiError(error);
      }
  }
};

onMounted(() => {
    // lottie Fire
    const animation = Lottie.loadAnimation({
        container: document.getElementById('lottie-fire-animation'), 
        renderer: 'svg', 
        loop: true, 
        autoplay: true, 
        path: '/lottie/fire_2.json'
    });
    animation.setSpeed(0.3);
});
</script>

<style scoped>
.login-background {
    background-image: url('../../assets/images/basic/fireplace_2.jpg');
    background-size: cover;
    background-position: center;
    background-attachment: fixed;
    height: 100vh;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.card {
    position: fixed; 
    top: 50%; 
    left: 70%; 
    transform: translate(-50%, -50%); 
    width: 100%;
    max-width: 300px;
    padding: 20px; 
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15); 
    background-color: #E5E5E5;
    border-radius: 15px;
    opacity: 0.9;
}

.btn-primary {
    background-color: #1e6091;
    border: none;
    color: white;
}

.btn-primary:hover {
    background-color:#184e77;
}

.lottie-container {
    position: absolute;
    bottom: 40.5%; 
    left: 27%; 
    transform: translate(-50%, -50%);
    width: 130px; 
    height: 100px;
    pointer-events: none;
    filter: blur(4px);
    opacity: 0.9;
}

@media (max-width: 900px) {
    .lottie-container {
        display: none;
    }
}

.password-input-container {
    position: relative;
    display: flex;
    align-items: center;
    margin-bottom: 10px;
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

.errorMessage{
    font-size: 14px;
}

.forgot-password-link {
    text-align: right;
    font-size: 0.875rem;
    margin-top: -8px;
}
.back-home-icon {
    position: fixed;
    top: 1%;
    left: 10%;
    font-size: 1.5rem;
    color: #333;
    text-decoration: none;
}
.back-home-icon:hover {
    color: #e74c3c;
}
.back-home-icon span {
    font-size: 20px;
}
</style>
