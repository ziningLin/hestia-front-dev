<template>
  <div class="register-provider-container d-flex flex-column align-items-center">
    <h2 class="title mb-4">註冊成為房東</h2>
    <p class="instruction-text text-muted mb-3">
      請輸入您的銀行帳戶和地址以註冊成為網站的房源提供者。
    </p>

    <div class="provider-form-section">
      <form @submit.prevent="registerProvider">
          <div class="form-group">
            <label for="bank-code">選擇銀行代碼</label>
            <select id="bank-code" v-model="selectedBankCode" class="form-control custom-select" required>
              <option value="" disabled selected>請選擇您的銀行</option>
              <option v-for="bank in bankOptions" :key="bank.code" :value="bank.code">
                {{ bank.name }} ({{ bank.code }})
              </option>
            </select>
          </div>
          <div class="form-group mb-3">
            <label for="bank-account">銀行帳戶</label>
            <input type="text" id="bank-account" v-model="bankAccount" class="form-control" placeholder="請輸入銀行帳戶" required />
          </div>
        <div class="form-group mb-4">
          <label for="address">地址</label>
          <input type="text" id="address" v-model="address" class="form-control" placeholder="請輸入您的地址" required />
        </div>
        <div class="d-grid">
          <button type="submit" class="btn btn-primary">提交申請</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import axios from '@/plugins/axios';
import Swal from 'sweetalert2';
import { handleApiError } from '../../utils/error/errorHandler';
import router from '../../routers/router.js'
import { useUserProfileStore } from '../../stores/userProfile';
import { bankOptions } from '../../utils/bankOptions';

// Pinia
const userProfileStore = useUserProfileStore();

// 表單字段
const bankAccount = ref('');
const address = ref('');
const selectedBankCode = ref('');

// 註冊房東的函數
const registerProvider = async () => {
  try {
    const response = await axios.post('/provider/', {
      bankAccount: `${selectedBankCode.value}-${bankAccount.value}`,
      address: address.value,
    });

    // 成功
    if (response.status === 200) {
      Swal.fire({
        icon: 'success',
        title: '註冊成功',
        text: '您已成功註冊成為房東，現在可以提供您的房源！',
      }).then(async()=>{
        const response = await axios.get('/user/info');
        if(response.status === 200){
            userProfileStore.setUserProfile(response.data);
        }
        userProfileStore.isProvider = true
        router.push({ name: 'providerInfo-link' });
      });
    }
  } catch (error) {
    handleApiError(error, '註冊發生錯誤，請稍後再試');
  }
};
</script>

<style scoped>
.register-provider-container {
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

.provider-form-section {
  width: 100%;
  max-width: 600px; 
  margin: auto; 
}

.form-group {
  display: flex;
  flex-direction: column; 
  align-items: flex-start; 
  margin-bottom: 1rem;
  width: 100%; 
  max-width: 400px; 
  margin: auto; 
}

label {
  font-weight: 500;
  font-size: 1rem;
  margin-bottom: 0.5rem; 
  color: #333;
}

.form-control {
  height: 2.5rem;
  font-size: 1rem;
  width: 100%; 
  max-width: 400px; 
  margin: auto;
}

.d-grid {
  margin-top: 1.5rem;
}

.btn-primary {
  background-color: #1e6091; 
  border: none;
  color: white;
  width: 100px;
  margin: auto;
}

.btn-primary:hover {
  background-color: #184e77;
}

/* 下拉選單的基本樣式 */
.custom-select {
  position: relative;
  appearance: none;
  background-color: #f8f9fa;
  border: 1px solid #ced4da;
  border-radius: 5px;
  padding: 5px;
  padding-right: 30px;
  font-size: 16px;
  color: #495057;
  cursor: pointer;
}

.custom-select::-ms-expand {
  display: none;
}

</style>
