<template>
    <div v-if="isVisible" class="modal-overlay" @click.self="closeModal">
        <div class="modal-content">
            <h3>優惠方案</h3>
            <ul class="promotion-list">
                <li v-for="promotion in promotions" :key="promotion.promotionId" class="promotion-item">
                    <label class="promotion_content">
                        <input type="checkbox" :value="promotion.promotionId" v-model="promotionStore.selectedPromotions" />
                        <strong>{{ promotion.name }}</strong> :
                        <!-- <div>{{ promotion.promotionContent }}</div> -->
                        <div v-html="promotion.promotionContent" ></div>
                    </label>
                </li>
            </ul>
            <div class="modal-buttons">
                <button @click="applyPromotions" class="btn btn-primary">儲存優惠方案</button>
                <button @click="closeModal" class="btn btn-secondary">取消</button>
            </div>
        </div>
    </div>
</template>
  
<script setup>
import { ref, watch } from 'vue';
import { usePromotionStore } from '../../stores/promotion.js';
import { handleApiError } from '../../utils/error/errorHandler.js';

const props = defineProps({
    roomId: {
        type: [Number, String],
        required: true
    }
});

const promotionStore = usePromotionStore();
const isVisible = ref(false); 
const promotions = ref([]);

// 開啟模態框並載入優惠
const openModal = async () => {
    try {
        await promotionStore.fetchPromotions(props.roomId);
        promotions.value = promotionStore.promotions;
        promotionStore.selectedPromotions = promotions.value
            .filter(p => p.selected)
            .map(p => p.promotionId);
        isVisible.value = true;
    } catch (error) {
        console.error("加載優惠失敗：", error);
    }
};

// 關閉模態框
const closeModal = () => {
    isVisible.value = false;
    promotionStore.resetSelectedPromotions();
};

// 套用優惠到房間
const applyPromotions = async () => {
    try {
        await promotionStore.applyPromotionsToRoom(props.roomId); 
        closeModal();
    } catch (error) {
        handleApiError('套用優惠時發生錯誤，請稍後再試。')
    }
};
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
    animation: fadeIn 0.3s ease-in-out;
}

.modal-content h3{
    /* text-align: center; */
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
    line-height: 1.5;
}

.modal-buttons {
    display: flex;
    justify-content: center;
    gap: 10px;
}

.btn {
    padding: 10px 20px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-weight: bold;
    transition: background-color 0.3s ease;
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

.promotion_content{
    text-align: left;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: scale(0.9);
    }
    to {
        opacity: 1;
        transform: scale(1);
    }
}
</style>
