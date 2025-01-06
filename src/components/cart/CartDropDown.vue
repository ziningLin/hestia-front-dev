<template>
    <div class="nav-item dropdown" style="margin-right: 20px;">
        <a class="nav-link cart-button" href="#" role="button" data-bs-toggle="dropdown"
            aria-expanded="false">
            <i class="bi bi-cart4 cart-icon"></i>
        </a>
        <!-- 顯示購物車為空的提示 -->
        <div class="dropdown-menu p-3" aria-labelledby="cartDropdown">
            <div style="width: 300px">
                    <li v-if="isEmpty" class="list-group-item text-center">
                        購物車是空的！
                    </li>
                    <li v-else v-for="item in localCart" :key="item.id" style="margin-bottom: 15px;">
                        <div class="row">
                            
                            <div class="col-1" style=" margin: 0; padding: 0; ">
                                <input 
                                    class="form-check-input" 
                                    type="checkbox" 
                                    :id="'itemCheck' + item.cartId" 
                                    v-model="selectedItems" 
                                    :value="{ cartId: item.cartId, roomId: item.roomId }" 
                                    style=" margin-left: 3px; margin-top: 5px;"
                                />
                            </div>
                            <div class="col-3" @click="goToRoom(item.roomId)">
                                <img :src="`${path}${item.roomId}`" :alt="item.name" class="d-block img-fixed"  style="width: 80px; height: 80px; object-fit: cover; margin-left: -12px; border-radius: 5px; margin-top: 5px;"/>
                            </div>
                            
                            <div class="col-8" @click="goToRoom(item.roomId)">
                                <label class="form-check-label" :for="'itemCheck' + item.id" style="width: 100%;">
                                    <div  style="font-size: large; margin-bottom: 3px;"> <strong>{{ item.roomName }}</strong></div>
                                    
                                    <span>{{ item.cityName }}</span>
                                    <span v-if="item.overallScore!='NaN'" style="float: right; color: #FFD306; ">
                                        <i class="bi bi-star-fill"></i>
                                        {{ item.overallScore }}
                                    </span>
                                    <div v-for="(group, index) in groupDates(item.dates)" :key="index" style="font-size: small; margin-bottom: 0px;">
                                        {{ group[0] }} - {{ getNextDate(group[group.length - 1]) }}
                                    </div>

                                    <div > 
                                        <span>金額: </span>
                                        <span style="float: right;"> <strong>{{ item.totalPrice }} 元</strong> </span>
                                        </div>
                                </label>
                            </div>

                        </div>
                    </li>
                <div v-if="!isEmpty" class="card-footer" style="margin-top: 20px;">
                    <button type="button" class="btn btn-outline-danger float-end" style="margin-left: 10px;" :disabled="isEmpty" @click="removeFromCart">
                        移除
                    </button>
                    <button v-if="userProfileStore.userId" type="button" class="btn btn-outline-info float-end" style="margin-left: 10px;" @click="moveToFav">
                        移至收藏夾
                    </button>
                    <RouterLink to="/cart" class="btn btn-outline-primary float-end" style="margin-left: 10px;" :disabled="isEmpty">前往結帳</RouterLink>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
    import { ref, onMounted, watch } from 'vue';
    import router from '@/routers/router';
    const path = import.meta.env.VITE_ROOMIMAGE_URL;
    import { useCartStore } from '@/stores/cart';
    import { useUserProfileStore} from '@/stores/userProfile'

    const cartStore = useCartStore();
    const userProfileStore = useUserProfileStore();
    const localCart = ref(null);
    const isEmpty = ref(true);
    onMounted(async()=>{
        if( userProfileStore.userId ){
            // 使用 Pinia 的 cart store
            await cartStore.fetchCartItems();
            localCart.value = cartStore.items;
        }else{
            // 使用 localStorage 的 cart
            await cartStore.fetchlocalCart();
            localCart.value = cartStore.items;

        }
        checkCartEmpty();
    })

    const selectedItems = ref([]);  // 用來存儲被選中的 roomId
    watch(() => cartStore.items,
        (newItems) => {
            localCart.value = cartStore.items; // 更新本地購物車數據
            checkCartEmpty(); // 檢查購物車是否為空
        },
        { deep: true } // 深層監聽，監控陣列內部變化
    );

    // 檢查購物車是否為空
    function checkCartEmpty() {
        isEmpty.value = !localCart.value || localCart.value.length === 0;
    }

    // 把選取的 item roomId list moveToFav
    async function moveToFav(){
        if( cartStore != null){ // 驗證是否有登入
            for (let val of selectedItems.value){
                await cartStore.moveItemToFavorite(val); // 调用 store 的方法
            }
        }
    }

    // 把選取的 item cartId list remove
    async function removeFromCart(){
        for (let val of selectedItems.value){
                // 調用 store 的方法移除
                if( userProfileStore.userId != null){ 
                    for(let cartId of val.cartId){
                        await cartStore.removeItem(cartId);
                    }
                }
                // 從 localStorage 移除
                else{ 
                    await cartStore.removeFromCart(val);
                }
        }
        selectedItems.value={};
    }


    //處理日期區間的顯示邏輯
    const dateGroup = ref([])

    // 判斷 item 的 dates 是否是連續的日期段
    function isConsecutive(date1, date2) {
        const d1 = new Date(date1);
        const d2 = new Date(date2);

        // 判斷是否相差一天
        return (d2 - d1) === 24 * 60 * 60 * 1000;
    }

    // 將日期分組為連續的區段
    function groupDates(dates) {
        // 先將日期升序排序
        let sortedData = dates.sort((a, b) => {
            let dateA = new Date(a);
            let dateB = new Date(b);
            return dateA - dateB; // 按日期升序排列
        });

        const groups = [];
        let tempGroup = [sortedData[0]];

        for (let i = 1; i < sortedData.length; i++) {
            if (isConsecutive(sortedData[i - 1], sortedData[i])) {
                tempGroup.push(sortedData[i]);
            } else {
                groups.push(tempGroup);
                tempGroup = [sortedData[i]];
            }
        }

        // 添加最后一个分组
        groups.push(tempGroup);
        return groups;
    }

    // 取得結束日期的下一天顯示checkOutDate用
    function getNextDate(dateString) {
        const date = new Date(dateString);
        date.setDate(date.getDate() + 1);
        // 手動格式化為 YYYY-MM-DD
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    

    //連結到房間頁面
    const goToRoom = (roomId) => {
        router.push({ name: 'room-link', params: { roomId } });
    };

    // 移除指定的日期範圍
    async function remove(index, roomId) {
        if (userProfileStore.userId != null) {
            await cartStore.removeDate(dateGroup.value[index], roomId);
            dateGroup.value.splice(index, 1);
        }
    }

</script>
    
<style>

.cart-button{
    width: 30px;
    height: 56px;
    cursor: pointer;
    gap: 8px;
    transition: background-color 0.3s ease; 
    border-radius: 15px;
    line-height: 56px;        
    text-align: center;
}

.cart-button:hover{
    background-color: #f5f5f5;
    
}

.cart-icon{
    font-size: 25px;
    margin: 20px 0px 0px 0px;
}
</style>