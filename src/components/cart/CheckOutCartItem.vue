<template>
        <div class="card mb-3" style="width: 100%;">
            <div class="row g-0">
                <div class="col-md-4">
                    <img :src="`${path}${item.roomId}`" class="img-fluid rounded-start" alt="...">
                </div>

                <div class="col-md-8">
                    <div class="card-body">
                        <h5 class="card-title">{{ room.roomName }}</h5>
                        <div style="margin: 10px 30px 10px 0px;padding: 0;">
                            <div style="margin-bottom: 10px;">
                                {{ room.bedroomCount }}間臥室・
                                {{ room.doubleBed }}張雙人床・
                                {{ room.singleBed}}張單人床・
                                {{ room.bathroom }}間衛浴
                            </div>
                            <div style="margin-bottom: 10px;">
                                <span class="card-text"><span style="padding-right: 10px;">入住時間: </span>
                                    {{ formatDate(item.dates[0]) }} 
                                    {{ room.checkinTime ? room.checkinTime.toString().substring(0, 2) : " 15" }}
                                    : {{ room.checkinTime ? room.checkinTime.toString().substring(2, 4) : " 00"}}
                                </span>
                                    <br>
                                <span class="card-text"><span style="padding-right: 10px;">
                                    退房時間: </span>
                                    {{ getNextDate(item.dates[item.dates.length-1]) }} 
                                    {{ room.checkoutTime ? room.checkoutTime.toString().substring(0, 2) : " 11" }}
                                    : {{ room.checkoutTime ? room.checkoutTime.toString().substring(2, 4) : " 00"}}
                                </span>
                            </div>
                        </div>
                        <div class="card-text">
                            <span style="padding-right: 10px;">
                            {{ item.dates.length+1}} 天 
                            {{ item.dates.length }} 夜 </span>

                            <span v-if="item.promotionCode">優惠後價格: {{ Math.ceil(item.finalPrice) }} 元
                            </span>
                            <span v-else style="float:right;"> 
                                總價: <strong>{{ item.finalPrice }} 元</strong> 
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
</template>
    
<script setup>
    import axiosapi from '@/plugins/axios.js';
    import { onMounted, ref, computed } from 'vue';
    const path = import.meta.env.VITE_ROOMIMAGE_URL;


    const props = defineProps({
        item: {
            type: Object,
            required: true,
        },
    });

    const room = ref([]);
    const totalPrice = ref(0);
    onMounted(async()=>{
            const res = await axiosapi.get(`/room/provider/findByRoomId/${props.item.roomId}`);
            room.value = res.data.data[0];
            console.log(props.item)
            for (let price of props.item.price) {
                totalPrice.value += parseInt(price, 10); 
            }
    })

    // 取得結束日期的下一天顯示checkOutDate用
    function getNextDate(dateString) {
        const date = new Date(dateString);
        date.setDate(date.getDate() + 1);
        // 手動格式化為 YYYY-MM-DD
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}/${month}/${day}`;
    }
    // 取得formatDate
    function formatDate(dateString) {
        const date = new Date(dateString);
        date.setDate(date.getDate());
        // 手動格式化為 YYYY-MM-DD
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}/${month}/${day}`;
    }

    // 優惠相關邏輯(Owen)
    import { usePromotionStore } from '../../stores/promotion.js';
    // pinia
    const promotionStore = usePromotionStore();
    // 加入優惠價格計算後
    const total = computed(() => {
        return promotionStore.calculatedPrices[item.roomId]?.finalPrice || totalPrice.value;
    });
    
</script>
    
<style>
    
</style>