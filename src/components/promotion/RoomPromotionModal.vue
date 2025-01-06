<template>
    <div v-if="isVisible" class="modal-overlay" @click.self="closeModal">
        <div class="modal-content">
            <h3>可用優惠方案</h3>

            <!-- 顯示優惠清單 -->
            <ul  class="promotion-list">
                <li v-for="promotion in promotions" :key="promotion.promotionId" class="promotion-item">
                    <label>
                        <input type="radio" :value="promotion.promotionCode" v-model="selectedPromotion" />
                        <strong>{{ promotion.name }}</strong> :
                        <div>{{ promotion.promotionContent }}</div>
                    </label>
                </li>
            </ul>

            <!-- 確認按鈕 -->
            <div class="modal-buttons">
                <button class="btn btn-primary" @click="applyPromotion">計算優惠價格</button>
                <button class="btn btn-secondary" @click="closeModal">取消</button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { usePromotionStore } from '@/stores/promotion.js';
import {formatDateForAPI} from '../../utils/dateUtil.js'
import { useCartStore } from '../../stores/cart.js';

const cartStore = useCartStore();
const promotionStore = usePromotionStore();
const isVisible = ref(false);       
const promotions = ref([]);
const selectedPromotion = ref('');
const roomId = ref(null);
const checkInDate = ref(null);
const checkOutDate = ref(null);

// 開啟模態框並載入優惠清單
const openModal = async (data) => {
    roomId.value = data.roomId;
    checkInDate.value = data.dates[0]; 
    checkOutDate.value = data.dates[data.dates.length - 1]; 
    try {
        promotions.value = await promotionStore.fetchPromotionsByRoomId(roomId.value);
        isVisible.value = true;
    } catch (error) {
        alert('載入優惠時發生錯誤，請稍後再試。');
    }
};

// 方法：關閉模態框
const closeModal = () => {
    isVisible.value = false;
};

// 確認選擇並計算價格
const applyPromotion = async () => {
    if (!selectedPromotion.value) {
        alert('請選擇一個優惠方案！');
        return;
    }
    // 處理日期格式
    const formattedCheckInDate = formatDateForAPI(checkInDate.value);
    const formattedCheckOutDate = formatDateForAPI(checkOutDate.value);

    const result = await promotionStore.calculateFinalPrice(
        roomId.value,
        selectedPromotion.value,
        formattedCheckInDate,
        formattedCheckOutDate
    );
    console.log('計算結果:', result);
    closeModal();
};

// 暴露方法
defineExpose({
    openModal,
});
</script>

<style scoped>
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.modal-content {
    background: white;
    border-radius: 10px;
    padding: 20px;
    max-width: 500px;
    width: 90%;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
}

.modal-content h3{
    text-align: center;
}

.modal-content strong{
    font-size: large;
}

.promotion-list {
    list-style: none;
    padding: 0;
    margin: 20px 0;
}

.promotion-item {
    margin-bottom: 10px;
    font-size: 16px;
}

.modal-buttons {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
}

.btn {
    padding: 10px 20px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-weight: bold;
}

.btn-primary {
    background-color: #007bff;
    color: white;
}

.btn-primary:hover {
    background-color: #0056b3;
}

.btn-secondary {
    background-color: #6c757d;
    color: white;
}

.btn-secondary:hover {
    background-color: #5a6268;
}
</style>
