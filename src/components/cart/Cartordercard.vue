<template>
    <div class="card mb-3" style="width:auto;">
        <div class="row g-0" style=" padding-bottom: 15px; border-bottom:1px solid lightgrey ;">
            
            <div class="col-md-4" style="padding: 15px 0px 5px 10px;">
                <img :src="`${path}${item.roomId}`" class="img-fluid rounded-start rounded"
                    alt="...">
            </div>

            <div class="col-md-8">
                <div class="card-body">
                    <h4 class="card-title">{{ item.roomName }}</h4>
                    <h5> {{  item.cityName }}</h5>
                    <h6 class="card-text">
                        {{ item.size }} 位訪客 
                        {{ item.bedroom || 0 }} 間臥室 
                        {{ item.doubleBed + item.singleBed || 0 }} 張床 
                        {{ item.bathroom }} 間
                        {{ item.bathroomType }} 衛浴
                    </h6>

                    <div style="margin: 15px 0px 15px 0px; width: 100%;">
                        
                        <div class="row">
                            <div class="col-6">
                                <label class="form-label">入住</label>
                                <DatePicker
                                :value="checkInDate" 
                                :disabled-date="disablCheckInDate"
                                @update:value="editCheckInDate"
                                style="width: 100%"/>
                            </div>
                            <div class="col-6">
                                <label class="form-label">退房</label>
                                <DatePicker
                                :value="checkOutDate"
                                :disabled-date="disablCheckOutDate" 
                                @update:value="editCheckOutDate"
                                style="width: 100%"/>
                            </div>
                            <small style="margin-top: 15px;"> 共 {{ item.totalDays+1 }} 天 {{ item.totalDays }} 夜 的行程</small>
                        </div>
                </div>
                
                
                    <p class="card-text" v-if="isNotAvailableNow" style="color: red;">
                        <strong >此日期不可用，請更改日期</strong>
                    </p>
                    
                    <div class="row" style="border-top:1px dotted lightgrey; padding-top: 15px;">
                        <div class="col-6">
                            <!--尚未套用優惠前-->
                            <!-- <h6 class="card-text">平均一晚: {{ item.totalPrice/item.totalDays }} * {{ item.totalDays }} 晚</h6> -->
                            <h6 class="card-text">
                                平均一晚: 
                                {{ Math.ceil(promotionStore.calculatedPrices[item.roomId] ? promotionStore.calculatedPrices[item.roomId].finalPrice / item.totalDays : item.totalPrice / item.totalDays)}} 
                                * {{ item.totalDays }} 晚
                            </h6>
                        </div>
                        <div class="col-6 text-left">
                            <!--尚未套用優惠前-->
                            <!-- <h5>$ {{ item.totalPrice }} TWD </h5> -->
                            <h5 class="promotion-price">
                                <span v-if="promotionStore.calculatedPrices[item.roomId]" class="original-price">
                                    $ {{ promotionStore.calculatedPrices[item.roomId].originalPrice }}
                                </span>
                                <span>
                                    $ {{ promotionStore.calculatedPrices[item.roomId] ? promotionStore.calculatedPrices[item.roomId].finalPrice : item.totalPrice }} TWD
                                </span>
                            </h5>
                            <p v-if="promotionStore.calculatedPrices[item.roomId]" class="discount-info">
                                您節省了 ${{ promotionStore.calculatedPrices[item.roomId].discount }}！
                            </p>
                        </div>
                    </div>

                    <div style="float: right; margin: 10px 0px 0px 20px;">
                        <!-- 優惠按鈕 (Owen)-->
                        <button type="button" class="btn btn-outline-primary" @click="openPromotionModal(item)" style="margin-right: 5px;">
                            選擇優惠
                        </button>
                        <button v-if="userProfileStore.userId" type="button" class="btn btn-outline-info float-right"
                            style="margin-right: 5px;" @click="moveRoomItemToFavorite(item)">移去收藏夾</button>
                        <button v-if="userProfileStore.userId" type="button" class="btn btn-outline-danger float-right" @click="removeRoomItem(item.cartId)">移除商品</button>
                        <button v-else type="button" class="btn btn-outline-danger float-right" @click="removeRoomItemFromLocal(item)">移除商品</button>
                    </div>

                </div>
            </div>
        </div>
    </div>
    <!-- 優惠模態框 -->
    <RoomPromotionModal ref="roomPromotionModal" />
</template>

<script setup>
    const path = import.meta.env.VITE_ROOMIMAGE_URL;
    import { useCartStore } from '@/stores/cart';
    import { useUserProfileStore } from '@/stores/userProfile';
    import DatePicker from '@jobinsjp/vue3-datepicker';
    import '@jobinsjp/vue3-datepicker/index.css';
    import { ref, onMounted } from 'vue';
    import Swal from 'sweetalert2';
    import axiosapi from "@/plugins/axios.js"

    const props = defineProps({
        item: {
            type: Object,
            required: true,
        },
    });

    const userProfileStore = useUserProfileStore();
    const cartStore = useCartStore();
    const avalibleDatesArray = ref([])

    // 從 URL 參數中獲取 checkInDate, checkOutDate 和 totalGuests
    const checkInDate = ref(null);
    const checkOutDate = ref(null);
    const isNotAvailableNow = ref(false);
    
    // 載入時渲染
    onMounted(async()=>{
        checkInDate.value=new Date(props.item.dates[0]);
        const endDate = new Date(props.item.dates[props.item.dates.length-1]);
        
        checkOutDate.value=new Date(endDate.setDate(endDate.getDate() + 1));
        avalibleDatesArray.value = await cartStore.getAvailableDate(props.item.roomId);
        if(userProfileStore.userId){

            for( let cartId of props.item.cartId){
                const res = await axiosapi.get(`/cart/checkAvailableDate/${cartId}`);
                if(!res.data.success){
                    isNotAvailableNow.value = true;
                }
            }
        }else{
            const cart = JSON.parse(localStorage.getItem("cart") || "[]");
            for( let cartItem of cart){
                for( let date of cartItem.dateRange){
                    const res = await axiosapi.get(`/cart/checkAvailableDateByRoomId/${cartItem.roomId}/${date}`);
                    if(!res.data.success){
                        isNotAvailableNow.value = true;
                    }
                }
            }
        }
    })

    // 禁用 checkIn 日期: 沒有在資料庫的 availableDate 都被禁用
    const disablCheckInDate = (date) => {
        // formattedDate
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); 
        const day = String(date.getDate()).padStart(2, '0'); // 保證日期是兩位數

        // 如果日期存在於 availableDate，則不禁用 (return false)
        return !avalibleDatesArray.value.includes(`${year}-${month}-${day}`);
    };

    // 禁用 checkOut日期: 非checkIn日期隔一天的日期都被進用
    const disablCheckOutDate = (date) => {
        const checkOutDate = new Date(date); // 創建日期副本
        checkOutDate.setDate(checkOutDate.getDate() - 1); // 確保使用 checkOut 的前一天作為基準

        const year = checkOutDate.getFullYear();
        const month = String(checkOutDate.getMonth() + 1).padStart(2, '0');
        const day = String(checkOutDate.getDate()).padStart(2, '0');

        const formattedDate = `${year}-${month}-${day}`;

        // 如果 checkOut 前一天日期存在於 availableDate，則不禁用 (return false)
        return !avalibleDatesArray.value.includes(formattedDate);
    }

    async function removeRoomItem(cartIds) {
        if(userProfileStore.userId){
            for( let cartId of cartIds){
                await cartStore.removeItem(cartId); // store 的方法移除cart
            }
        }
    }
    
    function removeRoomItemFromLocal(cartId){
        console.log(cartId)
        cartStore.removeFromCart(cartId);
    }

    async function moveRoomItemToFavorite(roomId) {
        if(userProfileStore.userId){
            await cartStore.moveItemToFavorite(roomId); // store 的方法將cartItem移至Fav
        }
    }

    // 修改購物車 CheckIn 日期
    async function editCheckInDate(newDate) {
        checkInDate.value = newDate; // 手動更新新的日期數值

        // 如果 CheckInDate 選的比 CheckOutDate 晚: 清除 CheckOutDate 預設日期
        if(checkInDate.value.getTime() >= checkOutDate.value.getTime()){
            checkOutDate.value = null;
        }else{
            if( userProfileStore.userId){
                const request = {
                    roomId: props.item.roomId,
                    dates:  cartStore.getDateRange(checkInDate.value, checkOutDate.value)
                }
                
                // 送去後端修改cart的內容
                const res = await axiosapi. post('/cart/editCart', request);
                await cartStore. fetchCartItems();
            }else{
                cartStore.editCart(props.item.cartId, [newDate, checkOutDate.value]);
            }
        }
    }

    // 修改購物車 CheckOut 日期
    async function editCheckOutDate(newDate) {
        // 如果 CheckOutDate 選的比 CheckInDate 晚: 手動更新新的日期數值
        if(checkInDate.value.getTime() < newDate.getTime()){
            checkOutDate.value = newDate;

            if( userProfileStore.userId){
                const request = {
                    roomId: props.item.roomId,
                    dates:  cartStore.getDateRange(checkInDate.value, checkOutDate.value)
                }
                
                // 送去後端修改cart的內容
                const res = await axiosapi. post('/cart/editCart', request);
                await cartStore. fetchCartItems();
            }
            else{
                cartStore.editCart(props.item.cartId, [checkInDate.value, checkOutDate.value]);
            }
        } else{
            Swal.fire({
                    position: "bottom-end",
                    text: "請選擇有效日期",
                    showConfirmButton: false,
                    timer: 1000
                });
        }
    }

    // 優惠模態框相關邏輯(Owen)
    import { usePromotionStore } from '../../stores/promotion.js';
    import RoomPromotionModal  from '../promotion/RoomPromotionModal.vue';
    // pinia
    const promotionStore = usePromotionStore();
    // 模態框
    const roomPromotionModal = ref(null);
    const openPromotionModal = (item) => {
        roomPromotionModal.value.openModal(item);     
    };

    // // 判斷 item 的 dates 是否是連續的日期段
    // function isConsecutive(date1, date2) {
    //     const d1 = new Date(date1);
    //     const d2 = new Date(date2);
    //     // 判斷是否相差一天
    //     return (d2 - d1) === 24 * 60 * 60 * 1000;
    // }

    // // 將日期分組為連續的區段
    // function groupDates(dates) {
    //     // 先將日期升序排序
    //     let sortedData = dates.sort((a, b) => {
    //         let dateA = new Date(a);
    //         let dateB = new Date(b);
    //         return dateA - dateB; // 按日期升序排列
    //     });

    //     const groups = [];
    //     let tempGroup = [sortedData[0]];

    //     for (let i = 1; i < sortedData.length; i++) {
    //         if (isConsecutive(sortedData[i - 1], sortedData[i])) {
    //             tempGroup.push(sortedData[i]);
    //         } else {
    //             groups.push(tempGroup);
    //             tempGroup = [sortedData[i]];
    //         }
    //     }

    //     // 添加最后一个分组
    //     groups.push(tempGroup);

    //     console.log(groups);
    //     return groups;
    // }

    // // 取得結束日期的下一天顯示checkOutDate用
    // function getNextDate(dateString) {
    //     const date = new Date(dateString);
    //     date.setDate(date.getDate() + 1);
    //     // 手動格式化為 YYYY-MM-DD
    //     const year = date.getFullYear();
    //     const month = String(date.getMonth() + 1).padStart(2, '0');
    //     const day = String(date.getDate()).padStart(2, '0');
    //     return `${year}-${month}-${day}`;
    // }
    

    // // 移除指定的日期範圍
    // async function remove(index, roomId) {
    //     if (userProfileStore.userId != null) {
    //         await cartStore.removeDate(dateGroup.value[index], roomId);
    //         dateGroup.value.splice(index, 1);
    //     }
    // }


</script>

<style scoped>
/* 優惠價格 */
.original-price {
    text-decoration: line-through; 
    color: #ff6b6b;
    margin-right: 10px; 
    font-size: 0.9rem;
}

.discount-info {
    color: #28a745; 
    font-size: 0.85rem; 
    font-weight: bold;
    margin-top: 5px;
    text-align: right;
}

.promotion-price{
    text-align: right;
}
</style>