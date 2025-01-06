<template>
  <div class="provider-info-container d-flex flex-column align-items-center">
    <h2 class="title mb-4">合作夥伴資料管理</h2>
    <p class="instruction-text text-muted mb-3">
      您可以在此查看並更新您的資料。
    </p>

    <div class="provider-form-section">
      <form @submit.prevent="updateProviderInfo">
        <!-- 銀行代碼下拉選單 -->
        <div class="form-group mb-3">
          <label for="bank-code">銀行代碼</label>
          <select id="bank-code" v-model="selectedBankCode" class="form-control" required>
            <option value="" disabled>請選擇您的銀行</option>
            <option v-for="bank in bankOptions" :key="bank.code" :value="bank.code">
              {{ bank.name }} ({{ bank.code }})
            </option>
          </select>
        </div>

        <!-- 銀行帳號輸入框 -->
        <div class="form-group mb-3">
          <label for="bank-account">銀行帳戶</label>
          <input type="text" id="bank-account" v-model="bankAccount" class="form-control" placeholder="請輸入銀行帳戶" required/>
        </div>

        <!-- 地址輸入框 -->
        <div class="form-group mb-4">
          <label for="address">地址</label>
          <input type="text" id="address" v-model="address" class="form-control" placeholder="請輸入您的地址"  required/>
        </div>

        <div class="d-grid">
          <button type="submit" class="btn btn-primary">儲存修改</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from '@/plugins/axios';
import Swal from 'sweetalert2';
import { handleApiError } from '../../utils/error/errorHandler';
import { bankOptions } from '../../utils/bankOptions';

const selectedBankCode = ref('');
const bankAccount = ref('');
const address = ref('');

// 獲取房東資料
// 初始化房東資料
const fetchProviderInfo = async () => {
  try {
    const response = await axios.get('/provider/');
    if (response.status === 200) {
      const [bankCode, account] = response.data.bankAccount.split('-');
      selectedBankCode.value = bankCode;
      bankAccount.value = account;
      address.value = response.data.address;
    }
  } catch (error) {
    handleApiError(error, '發生錯誤，請稍後再試');
  }
};

// 更新房東資料
const updateProviderInfo = async () => {
  try {
    const fullBankAccount = `${selectedBankCode.value}-${bankAccount.value}`;
    const response = await axios.put('/provider/', {
      bankAccount: fullBankAccount,
      address: address.value,
    });
    if (response.status === 200) {
      Swal.fire({
        icon: 'success',
        title: '資料已成功更新！',
      });
    }
  } catch (error) {
    handleApiError(error, '發生錯誤，請稍後再試');
  }
};

// 初始化頁面時呼叫獲取房東資料
onMounted(() => {
  fetchProviderInfo();
});
</script>

<style scoped>
.provider-info-container {
  max-width: 900px;
  height:700px;
  margin: auto;
  padding: 2rem;
  border-radius: 15px;
  background-color: #E5E5E5; 
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column; /* 內容垂直排列 */
  justify-content: center; /* 垂直居中 */
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
  background-color: #1e6091; /* 按鈕顏色改為淡橘色 */
  border: none;
  color: white;
  width: 100px;
  margin: auto;
}

.btn-primary:hover {
  background-color: #1e6091; /* 更深的橘色作為 hover 狀態 */
}
</style>
