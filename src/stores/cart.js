import { defineStore } from "pinia";
import axiosapi from "@/plugins/axios.js"
import { useCommentStore } from "./comment";
import { usePromotionStore } from "./promotion";

export const useCartStore = defineStore('cart', {
    state: () => ({
        items: [],
        cart:JSON.parse(localStorage.getItem('cart')) || [], // 初始化購物車數據
        checkOutItem:[]
    }),
    getters: {
        isEmpty: (state) => state.items.length === 0 || state.cart.length === 0, // 檢查購物車是否為空
    },
    actions: {
        // [後端API] 查詢所有此 user 的購物車，並且將資料整理成以 roomId 為單位的物件格式
        async fetchCartItems() {
            try {
                const commentStore = useCommentStore(); // 引用 commentStore 中的方法
                const response = await axiosapi.get('/cart/getCart'); // 查詢此 user 所有的 cart
                this.items = []; // 清空

                if (!response.data.lst) return; // 如果資料為空直接返回

                let currentRoom = null;
                let id = 0;

                const resetRoomData = (roomData) => ({
                    id: ++id,
                    cartId: [],
                    dates: [],
                    totalDays: 0,
                    price: [],
                    totalPrice: 0,
                    roomId: roomData.roomId,
                    userId: roomData.userId,
                    cityName: roomData.cityName,
                    size: roomData.size,
                    roomName: roomData.roomName,
                    roomSum: roomData.roomSum,
                    doubleBed: roomData.doubleBed,
                    singleBed: roomData.singleBed,
                    bedroom: roomData.bedroom,
                    bathroom: roomData.bathroom || 1,
                    bathroomType: roomData.bathroom >= 1 ? '私人' : '共用',
                    overallScore: 0
                });

                for (const it of response.data.lst) {
                    // 如果是新的 roomId，則存儲舊的房間資料並開始新資料
                    if (!currentRoom || currentRoom.roomId !== it.roomId) {
                        if (currentRoom) {
                            currentRoom.dates.sort();
                            this.items.push(currentRoom);
                        }
                        currentRoom = resetRoomData(it);
                        currentRoom.overallScore = await commentStore.fetchCartItemsComment(it.roomId); // 查詢評價
                    }

                    // 累加同房間的資料
                    currentRoom.cartId.push(it.cartId);
                    currentRoom.dates.push(new Date(it.dates).toLocaleDateString());
                    currentRoom.totalDays++;
                    currentRoom.price.push(it.price);
                    currentRoom.totalPrice += it.price;
                }

                // 最後一筆資料也需要加入
                if (currentRoom) {
                    currentRoom.dates.sort();
                    this.items.push(currentRoom);
                }

            } catch (error) {
                console.error('Failed to fetch cart items:', error);
            }
        },

        // [後端API] 傳進一個 cartId，藉此將後端 cart 移除
        async removeItem(cartId) {
            try {
                await axiosapi.get(`/cart/deleteCart/${cartId}`);
                await this.fetchCartItems(); // 删除成功后刷新数据
                usePromotionStore().resetPromotions();
            } catch (error) {
                console.error(`Failed to delete cart item ${cartId}:`, error);
            }
        },

        // [後端API] 傳進一個 日期區間，將之新增進 cart
        async addCart(roomAvailableDateArr, roomId) {
            try {
                // 準備請求
                let request={
                    "roomId":roomId,
                    "dates": roomAvailableDateArr
                }
                console.log(request)
                // 送去後端
                const response = await axiosapi.post('/cart/addLstToCart',request);
                
                await this.fetchCartItems(); // 删除成功后刷新数据
                return response.data.success;
            } catch (error) {
                console.error(`Failed to delete cart item ${roomId}:`, error);
            }
        },

        // [後端API] 移除 cart 但將此 room 轉移至收藏夾
        async moveItemToFavorite (items) {
            console.log(items)
            try {
                // 將 cartIdLst 中所有此 roomId 的 cart 都先移除
                for(let cartId of items.cartId){
                    const responseA = await axiosapi.get(`/cart/deleteCart/${cartId}`);
                }

                // 藉由roomId 將原先的 room 新增至 Favorite
                await axiosapi.post('/favorite/addToFavorite', 
                    {
                        userId:1, 
                        roomId:`${items.roomId}`,
                        "note": ""
                    });
                await this.fetchCartItems(); // 删除成功后刷新数据
                usePromotionStore().resetPromotions();

            } catch (error) {
                console.error(`Failed to delete cart item `, error);
            }
        },

        // [後端API] 將傳送來的 roomId, ogDateLst 區間送至後端修改
        async editCartContent (ogDateLst, roomId) {
            try {   
                let userId = 1;
                // 藉由 ogDateLst:[startDate, endDate] 將原先的 roomId 轉換成 available 重新新增至 Cart
                const request = {
                    userId: userId,
                    roomId: roomId,
                    startDate: ogDateLst[0],
                    endDate: ogDateLst[1]
                }
                const responseB = await axiosapi.post('/cart/addLstToCart', request);
                console.log(responseB)
                await this.fetchCartItems(); // 成功后刷新数据
                usePromotionStore().resetPromotions();

            } catch (error) {
                console.error(`Failed to delete cart item ${cartId}:`, error);
            }
        },

        // [後端API] 查詢傳送來的 roomId 有哪些可用日期
        async getAvailableDate(roomId){

            const response = await axiosapi.get(`/room-available-date/RecentAvailableDates/${roomId}`);
            const availableDates= [];
            response.data.data.forEach(element => {
                availableDates.push(element.availableDates);
            });
            return availableDates;
        },

        // 傳來的日期區段刪除
        async removeDate(dates, roomId){
            try{
                const request = {
                    dates: dates
                }
            const response = await axiosapi.post(`/cart/deleteRoomDatesFromCart/${roomId}`, request);
            if(response.data.success){
                this.fetchCartItems();
            }
            usePromotionStore().resetPromotions();

            }catch(error){
                console.log("romover Date api error"+ error);
            }
        },

        // 以下為未登入狀態臨時購物車使用
        // [後端API] 查詢傳送來的 roomId 與日期的物件
        async fetchlocalCart(){
            this.items=[]; // clean 
            for(let item of this.cart){
                const request = {
                    startDate: new Date(item.dateRange[0]), 
                    endDate: new Date(new Date(item.dateRange[item.dateRange.length - 1]).setDate(new Date(item.dateRange[item.dateRange.length - 1]).getDate() + 1)) // 算出最後一天
                };
                const response = await axiosapi.post(`/room-available-date/isAvailable/${item.roomId}`, request);
                const commentStore = useCommentStore(); // 引用 commentStore 中的方法
                const overallScore = await commentStore.fetchCartItemsComment(item.roomId); // 查詢評價
                
                // 整理數據
                const formattedItem ={
                    cartId: item.id,
                    dates: [],
                    totalDays: 0,
                    price: [],
                    totalPrice: 0,
                    roomId: item.roomId,
                    size: 0,
                    roomName: '',
                    roomSum: 0,
                    doubleBed: 0,
                    singleBed: 0,
                    bedroom: 0,
                    bathroom: 0,
                    bathroomType: '',
                    overallScore: overallScore
                };
                response.data.data.forEach(curr => {
                    formattedItem.totalDays = response.data.data.length;
                    formattedItem.totalPrice += curr.price;
                    formattedItem.size = curr.size;
                    formattedItem.roomName = curr.roomName;
                    formattedItem.roomSum = curr.roomSum;
                    formattedItem.doubleBed = curr.doubleBed;
                    formattedItem.singleBed = curr.singleBed;
                    formattedItem.bedroom = curr.bedroom;
                    formattedItem.bathroom = curr.bathroom;
                    formattedItem.bathroomType = curr.bathroom >= 1 ? '私人' : '共用';
                
                    // 收集所有的 `price`
                    formattedItem.price.push(curr.price);
                    // 收集所有的 `availableDates`
                    formattedItem.dates.push(curr.availableDates);
                });
                this.items.push(formattedItem);
            }
        },

        // 初始化購物車數據
        initializeCart() {
            this.cart = JSON.parse(localStorage.getItem('cart')) || [];
        },

        // 新增商品
        async addToCart(dateRange, roomId, sum) {
            const newDate = {
                id: Date.now() + roomId,
                roomId: roomId,
                dateRange: dateRange,
                sum: sum
            };
            if(this.cart != null 
                && this.cart.length!=0 
                && this.cart.find(cart => cart.roomId === roomId)!=null){
                const existingCart = this.cart.find(cart => cart.roomId === roomId)!=null;
                // 比較整个 dateRange
                const dateExists = (() => {
                    let flag = false;
                    for( let item of this.cart){
                        const existingTimes = new Set(item.dateRange.map(date => new Date(date).getTime()));
                        const newTimes = new Set(dateRange.map(date => new Date(date).getTime()));
                        if (existingTimes.size !== newTimes.size) continue;
                        
                        let count = 0;
                        for (let time of existingTimes) {
                            if (!newTimes.has(time)) break;
                            else count++;

                        }                    
                        if(count === existingTimes.size) flag = true;
                    }
                    return flag;
                })();

                // 要加入的情况：roomId 不存在 cart 中或是 roomId 存在，但 range 不存在
                if (!existingCart || (existingCart && !dateExists)) {
                    this.cart.push(newDate);
                    // 更新 localStorage
                    this.updateLocalStorage();
                    await this.fetchlocalCart();

                    return true;
                } 
            }else{
                this.cart.push(newDate);
                // 更新 localStorage
                this.updateLocalStorage();
                await this.fetchlocalCart();
                return true;
            }
            await this.fetchlocalCart();
            return false;
        },
        

        // 移除商品
        async removeFromCart(cartId) {
            // 取出 cartId 物件中的 'cartId' 屬性
            const targetCartId = cartId.cartId;

            // 使用 findIndex 比較 id
            const index = this.cart.findIndex(cart => cart.id === targetCartId);
            // 找到對應的 cartId 然後移除
            if (index !== -1) {
                this.cart.splice(index, 1); 
            }
            // 更新 localStorage
            this.updateLocalStorage();
            await this.fetchlocalCart();
            usePromotionStore().resetPromotions();

        },

        // 修改商品
        async editCart(cartId, dateRange) {
            const dates = this.getDateRange(dateRange[0], dateRange[1]);
            const cartItem = this.cart.find(cart => cart.id === cartId);
            // 找到對應的 cartId 然後移除
            if (cartItem) {
                cartItem.dateRange = dates;
            }
            // 更新 localStorage
            this.updateLocalStorage();
            await this.fetchlocalCart();
            usePromotionStore().resetPromotions();

        },

        // 更新 localStorage
        updateLocalStorage() {
            localStorage.setItem('cart', JSON.stringify(this.cart));
        },

        // 清空 pinia 裡面的資料
        cleanCartPiniaData(){
            this. items= [];
            this.checkOutItem=[];
        },

        getDateRange(startDate, endDate) {
            const dates = [];
            let currentDate = new Date(startDate);
            const end = new Date(endDate);
        
            while (currentDate.getTime() < end.getTime()) {
                    // 手動格式化為 YYYY-MM-DD
                    const year = currentDate.getFullYear();
                    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
                    const day = String(currentDate.getDate()).padStart(2, '0');
                    dates.push(`${year}-${month}-${day}`);
                
        
                // 將日期加一天
                currentDate.setDate(currentDate.getDate() + 1);
            }
            return dates;
        },

        /* 登入的時候，會將localStorage的商品同步到資料庫並刪除localStorage資料 */
        async addlocalToCart(){
            const cart = JSON.parse(localStorage.getItem("cart") || "[]");
            if( cart!= null && cart.length!=0){
                for( let cartItem of cart){
                    if(!this.items.find(item => item.roomId === cartItem.roomId)){
                        await this.addCart(cartItem.dateRange, cartItem.roomId);
                    }
                    
                }
                localStorage.removeItem("cart");
            }
        },

        /* 登出的時候，重新將cartStore.item存到localStorage */
        async addCartToLocacal(){
            await this.fetchCartItems();
            localStorage.setItem("cart", JSON.stringify(this.items));
        }

    },
});