<template>
    <div class="card" style="width: auto;">
        <ul class="list-group list-group-flush">
            <li class="list-group-item">
                <div class="form-check" v-for="item in cartStore.items" :key="item.itemId" style="margin: 10px 0px 15px 0px;">
                    <input 
                        v-if="map.get(item.roomId)"
                        class="form-check-input" 
                        type="checkbox" 
                        :id="'flexCheck' + item.itemId"
                        :value="item" 
                        v-model="selectedItems"
                    >
                    <label class="form-check-label" for="flexCheckDefault" style="width:100%; border-bottom: 1px solid lightgray; padding-bottom: 15px;">
                        <div>
                            {{item.roomName}}
                        </div>
                        <div>
                            <small>
                                {{ item.size }} 位訪客
                                {{ item.bedroom || 0 }} 間臥室 
                                {{ item.doubleBed + item.singleBed || 0 }} 張床 
                                {{ item.bathroom }} 間
                                {{ item.bathroomType }} 衛浴
                            </small>
                        </div>
                        <div>
                            <small>
                                共 {{ item.totalDays+1 }} 天 {{ item.totalDays }} 夜 的行程
                            </small>
                        </div>
                        <div>
                            <!-- $ {{item.totalPrice / item.totalDays }} * {{ item.totalDays }} 晚 -->
                            {{ Math.ceil(promotionStore.calculatedPrices[item.roomId] ? promotionStore.calculatedPrices[item.roomId].finalPrice / item.totalDays : item.totalPrice / item.totalDays)}} 
                            * {{ item.totalDays }} 晚
                            <span style="float: right;">
                                <!-- = {{  item.totalPrice }} 元 -->
                                = {{ promotionStore.calculatedPrices[item.roomId] ? promotionStore.calculatedPrices[item.roomId].finalPrice : item.totalPrice }}
                            </span>
                        </div>
                        <span  v-if="!map.get(item.roomId)" style="color: red; border: 1px solid red;"> 商品日期已售完 </span>
                    </label>
                </div>
            </li>
            <li class="list-group-item">已選取
                <div style="float: right;"> {{ count }} 項商品</div>
            </li>
            <li class="list-group-item">總金額
                <div style="float: right;"> {{ total }} 元</div>
            </li>
        </ul>
        <div class="card-footer">
            <button type="button" class="btn btn-outline-primary" style="float: right;" @click="checkout">前往下單</button>
        </div>
    </div>
</template>
    
<script setup>
    import { ref , computed, onMounted } from 'vue';
    import { useCartStore } from '@/stores/cart';
    import { useUserProfileStore } from '@/stores/userProfile';
    import Swal from 'sweetalert2';
    import router from '@/routers/router.js'
    import axiosapi from "@/plugins/axios.js"
    const path = import.meta.env.VITE_API_Front_URL;


    const map=ref(new Map());
    onMounted(async()=>{
        if(userProfileStore.userId){
            for( let item of cartStore.items){
                let isAvailableNow =true;
                for (let cartId of item.cartId){
                    const res = await axiosapi.get(`/cart/checkAvailableDate/${cartId}`);
                    if(!res.data.success){
                        isAvailableNow = false;
                    }
                }
                map.value.set(item.roomId, isAvailableNow);
            }

        }else{
            const cart = JSON.parse(localStorage.getItem("cart") || "[]");
            for( let cartItem of cart){
                let isAvailableNow =true;
                for( let date of cartItem.dateRange){
                    const res = await axiosapi.get(`/cart/checkAvailableDateByRoomId/${cartItem.roomId}/${date}`);
                    if(!res.data.success){
                        isAvailableNow = false;
                    }
                }
                map.value.set(cartItem.roomId, isAvailableNow);
            }
        }
    })

    // 使用 Pinia 的 cart store
    const cartStore = useCartStore();
    const userProfileStore = useUserProfileStore();
    const selectedItems = ref([]);
    
    // 動態計算選取的數量
    const count = computed(() => selectedItems.value.length);

    // 動態計算選取的商品總金額
    // const total = computed(() =>{
    //     return selectedItems.value.reduce((sum, item) => sum + item.totalPrice, 0);
    // });
    // 加入優惠價格計算後
    const total = computed(() => {
        return selectedItems.value.reduce((sum, item) => {
            const finalPrice = promotionStore.calculatedPrices[item.roomId]?.finalPrice || item.totalPrice;
            return sum + finalPrice;
        }, 0);
    });

    const disable= ref(false);
    function checkout(){
        if( userProfileStore.userId && !disable.value){
            const checkOutItem = [];
            if(selectedItems.value.length != 0){
                for(let item of selectedItems.value){
                    const finalPrice = promotionStore.calculatedPrices[item.roomId]?.finalPrice || item.totalPrice;
                    const value = {
                        roomId: item.roomId,
                        dates: item.dates,
                        promotionCode: promotionStore.promotionItems.get(item.roomId) || null,
                        price : item.price,
                        finalPrice : finalPrice,
                        cartId: item.cartId
                    }
                    checkOutItem.push(value);
                }
                //連結到結帳頁面
                router.push({ name: 'cart-checkout-link', query: { checkOutItem: JSON.stringify(checkOutItem) } });
                disable.value=true;
            }else{
                Swal.fire({
                icon: "warning",
                text: "請選擇要結帳的商品",
                showConfirmButton: false
            });
            }
        }else{
            Swal.fire({
                icon: "warning",
                text: "登入後前往結帳",
                showConfirmButton: false,
                footer: `<a href="${path}/auth/login">登入</a> 還沒有帳號嗎?<a href="${path}/auth/register">點此註冊</a>`
            });
        }
    }

    // 優惠相關邏輯(Owen)
    import { usePromotionStore } from '../../stores/promotion.js';
    // pinia
    const promotionStore = usePromotionStore();

</script>
    
<style>
    
</style>