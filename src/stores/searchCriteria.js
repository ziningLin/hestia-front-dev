import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useSearchCriteriaStore = defineStore('searchCriteria', () => {
    const location = ref(null);
    const checkInDate = ref(null);
    const checkOutDate = ref(null);
    const totalGuests = ref(0);

    // 可計算的完整查詢條件
    const searchCriteria = () => ({
        keyword: location.value || null,
        roomSize: totalGuests.value || null,
        checkinDate: checkInDate.value,
        checkoutDate: checkOutDate.value,
    });

    // 更新各項數據的方法
    const setLocation = (value) => (location.value = value);
    const setCheckInDate = (value) => (checkInDate.value = value);
    const setCheckOutDate = (value) => (checkOutDate.value = value);
    const updateGuests = (amount) => {
        if (totalGuests.value + amount >= 0) {
            totalGuests.value += amount;
        }
    };

    return {
        location,
        checkInDate,
        checkOutDate,
        totalGuests,
        searchCriteria,
        setLocation,
        setCheckInDate,
        setCheckOutDate,
        updateGuests,
    };
});
