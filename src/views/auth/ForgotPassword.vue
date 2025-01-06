<template>
    <div class="reset-password-container">      
      <!-- 卡片 -->
      <div class="reset-password-card">
        <div class="card-body">
          <RouterLink to="/auth/login" class="back-arrow">
            <i class="bi bi-arrow-left-circle"></i>
          </RouterLink>
          <h4 class="card-title text-center mb-4">重新設定您的密碼</h4>
          <form @submit.prevent="handleForgotPassword">
            <div class="form-group mb-4">
              <label for="email">信箱</label>
              <input type="email" id="email" v-model="email" class="form-control" placeholder="請輸入您的信箱" required />
            </div>
            <div class="d-grid">
              <button type="submit" class="btn btn-primary">確認發送驗證碼</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import Swal from 'sweetalert2';
  import axios from '@/plugins/axios';
  import { handleApiError } from '../../utils/error/errorHandler';
  import router from '../../routers/router.js'
  
  const email = ref('');
  
  // 忘記密碼
  const handleForgotPassword = async () => {
      Swal.fire({
          title: '發送中...',
          text: '請稍候，我們正在處理您的請求',
          allowOutsideClick: false,
          didOpen: () => {
              Swal.showLoading(); 
          },
      });
      try {
          const response = await axios.post('/user/auth/reset-password',  null, {
              params: {
                  email: email.value
              }
          });
  
          // 成功
          if (response.status === 200) {
              Swal.fire({
                  icon: 'success',
                  title: '驗證碼已發送！',
                  text: '請檢查您的信箱以取得重設密碼的連結',
              }).then(() => {
                  router.push({ name: 'Login-link' });
              });
          }
      } catch (error) {
          if (error.response && error.response.status === 404) {
              handleApiError(error, '找不到對應的信箱');
          } else {
              handleApiError(error);
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
  top:10%; 
  left: 35%; 
  font-size: 1.8rem;
  color: #666; 
  text-decoration: none;
}

.back-arrow:hover {
  color: #184e77;
}

.reset-password-card {
  background-color: #E5E5E5;
  width: 400px; 
  padding: 30px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-radius: 20px; 
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
</style>
  