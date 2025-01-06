import { ref } from 'vue';
import { defineStore } from 'pinia';
import axios from '../plugins/axios';
import { handleApiError } from '../utils/error/errorHandler';
import Swal from 'sweetalert2';

export const usePromotionStore = defineStore('promotion', () => {
    // 優惠清單
    const promotions = ref([]);
    // 已選中的優惠 ID 列表
    const selectedPromotions = ref([]);
    // 用於存儲計算後的金額
    const calculatedPrices = ref({}); 
    // 已套用的優惠
    const promotionItems = ref(new Map());

    // 獲取平台所有優惠清單
    const fetchPromotions = async (roomId) => {
        try {
            const response = await axios.get('/promotion/all/room',{
                params: { roomId:roomId}
            });
            promotions.value = response.data;
        } catch (error) {
            if (error.response && error.response.status === 400){
                handleApiError(error, '目前沒有任何可用的優惠');
                throw error;
            }
            handleApiError(error, '無法載入優惠清單，請稍後再試');
            throw error;
        }
    };

    // 將選定的優惠應用到指定房間
    const applyPromotionsToRoom = async (roomId) => {
        try {
            const response = await axios.post(`/promotion/apply/${roomId}`, selectedPromotions.value);    
            if (response.status === 200) {
                Swal.fire({
                    icon: 'success',
                    title: '更新成功',
                    text: '您的優惠方案已更新成功 !',
                })
            }
        } catch (error) {
            if(error.response && error.response.status === 400){
                handleApiError(error, '該房間以套用此優惠')
            }
            handleApiError(error, '套用優惠方案失敗，請稍後再試！')
        }
    };

    // 重置已選中的優惠
    const resetSelectedPromotions = () => {
        selectedPromotions.value = [];
    };

    // 重置優惠
    const resetPromotions = () => {
        selectedPromotions.value = [];
        promotions.value = [];
        // 已選中的優惠 ID 列表
        selectedPromotions.value = [];
        // 用於存儲計算後的金額
        calculatedPrices.value = {}; 
        // 已套用的優惠
        promotionItems.value = new Map();
    };

    // 獲取單一房間的優惠列表
    const fetchPromotionsByRoomId = async (roomId) => {
        try {
            const response = await axios.get(`/promotion/room/${roomId}`);
            return response.data; // 返回適用優惠
        } catch (error) {
            if(error.response && error.response.status === 400){
                handleApiError(error, '目前無可用優惠')
                return [];
            }
            handleApiError();
        }
    };

    // 計算房間的折扣後價格
    const calculateFinalPrice = async (roomId, promotionCode, checkInDate, checkOutDate) => {        
        try {
            const response = await axios.get('/promotion/calculate-price', {
                params: { roomId, promotionCode, checkInDate, checkOutDate },
            });
            calculatedPrices.value[roomId] = response.data;
            promotionItems.value.set(roomId, promotionCode);
            return response.data; // 返回價格明細
        } catch (error) {
            if(error.response && error.response.status === 400){
                handleApiError(error.response.data);
            }else{
                handleApiError(error, '無法計算優惠價格，請稍後再試！');
            }
            return null;
        }
    };

    return {
        promotions,
        selectedPromotions,
        calculatedPrices,
        promotionItems,
        resetPromotions,
        fetchPromotions,
        applyPromotionsToRoom,
        resetSelectedPromotions,
        fetchPromotionsByRoomId,
        calculateFinalPrice,
    };
});
