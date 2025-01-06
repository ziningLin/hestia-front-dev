<template>
    <h3> 訂單確認</h3>
    <hr>
    <CheckOutCartItem v-for="item in checkOutItems" :item="item"></CheckOutCartItem>
    <hr>
    <div style="float: right;"> 
        共 {{checkOutItems.length}} 項商品 總金額 {{total}} TWD 
        <button type="button" class="btn btn-info mt-3" @click="callCheckOut">
            確認預定
        </button>
    </div>
</template>
    
<script setup>
    import { useRoute } from 'vue-router';
    import { useUserProfileStore } from '@/stores/userProfile';
    import { useCartStore } from '@/stores/cart';
    import { ref } from 'vue';
    import axiosapi from '@/plugins/axios.js';
    import CheckOutCartItem from './CheckOutCartItem.vue';
    import router from '@/routers/router.js'
    import Swal from 'sweetalert2';

    const cartStore = useCartStore();
    const route = useRoute();
    const checkOutItems = JSON.parse(route.query.checkOutItem || '[]'); // 確保默認值為空數組;
    const userProfileStore=useUserProfileStore();
    const disable= ref(false);

    async function callCheckOut(){
        if( userProfileStore.userId && !disable.value){
            disable.value= true;
            const response = await axiosapi.post('/cart/checkOutCart', checkOutItems);
            if(response.data.success){
                Swal.fire({
                icon: 'success',
                text: '預定成功! 請在30分鐘內完成付款以保留訂單商品',
                allowOutsideClick: false,
                showConfirmButton: false,
                timer: 5000, // 5秒後自動關閉
                timerProgressBar: true, // 顯示讀秒進度條
                })
                .then(() => {
                // SweetAlert2 完成後執行跳轉
                    cartStore.fetchCartItems();
                    router.push('/order/userUnpaidOrder') // 跳轉到 /about 路徑
                })
            }
        }else{
            Swal.fire({
            icon: "warning",
            text: "您尚未登入，登入後前往結帳",
            showConfirmButton: false,
            footer: '<a href="http://localhost:5173/auth/login">登入</a> 還沒有帳號嗎?<a href="http://localhost:5173/auth/register">點此註冊</a>'
        });
        }
    }

    // 優惠模態框相關邏輯(Owen)
    import { usePromotionStore } from '../../stores/promotion.js';
    import { computed } from 'vue';
    // pinia
    const promotionStore = usePromotionStore();

    const total = computed(()=>{
        let sum = 0;
        for(let item of checkOutItems){
            sum += item.finalPrice;
        }
        return Math.ceil(sum) ;
    })

</script>

    
<style>
    
</style>