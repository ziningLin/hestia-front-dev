<template>
    <div class="col-md-6" style="padding: 10px;">
        <div class="card">
            <img :src="`${path}${favItem.roomId}`" class="card-img-top" alt="..." >
            <button class="btn btn-link position-absolute top-0 end-0" @click="removeFromFavLst">
                <i :class="favItem.isFavorited ? 'bi bi-suit-heart-fill' : 'bi bi-suit-heart-fill text-secondary'"></i>
            </button>
            <div class="card-body">
                
                <div>
                    <strong >{{ favItem.roomName }}</strong>
                </div>
                    <p class="card-text" @click="goToRoom(favItem.roomId)">
                        {{ favItem.size }}人·
                        {{ favItem.bedroom }}房·
                        {{ favItem.doubleBed }}張雙人床·
                        {{ favItem.singleBed }}張單人床·
                        {{ favItem.bathroom }}間衛浴
                    </p>
                    <p class="card-price fw-bold" @click="goToRoom(favItem.roomId)">
                        ${{ favItem.price || price }} 台幣/晚
                        <span v-if="isNotNan" style="float: right;"><i class="bi bi-star-fill"></i>{{ overallScore }}</span>
                    </p>
                <div>
                    <!-- <input type="text" value="note" v-model="favItem.note" @change="editFavoriteList" style="width: 100%;"/> -->
                <div class="row">
                    <div class="col-md-3">
                        note: 
                    </div>
                    <div class="col-md-9">
                        <input type="text" v-model="favItem.note" @change="editFavoriteList" style="width: 100%;"/>
                    </div>
                </div>
                <p v-if="showAvailability" style="background-color: #E0E0E0; padding: 5px; margin-top: 10px;"> {{ dateIsAvailable }} </p>
            </div>
        </div>
    </div>
    </div>
</template>
    
<script setup>
    const path = import.meta.env.VITE_ROOMIMAGE_URL;
    import { useFavoriteStore } from '@/stores/favorite.js';
    import { useCommentStore } from '../../stores/comment';
    import { onMounted, ref, watch } from 'vue';
    import { onUpdated } from 'vue';
    import router from '@/routers/router.js'
    import axiosapi from '@/plugins/axios.js'
    import Swal from 'sweetalert2';

    // pinia
    const favoriteStore = useFavoriteStore();
    const commentStroe = useCommentStore();

    const removeLst =  ref([]);

    const props = defineProps({
        favItem: {
            type: Object,
            required: true
        },
        dateRanges:{
            type: Array,
            required: true
        }
    });

    const showAvailability = ref(false);
    const dateIsAvailable = ref('');
    const price = ref();
    const overallScore = ref(0);
    const isNotNan = ref(false);

    onMounted(async()=>{
        const response = await commentStroe.fetchCartItemsComment(props.favItem.roomId);
        if(response!='NaN') isNotNan.value = true;
        overallScore.value = response;
    })

    // 監聽 dateRanges 的變化，當 dateRanges 改變時查詢是否可用 
    watch(() => props.dateRanges, async(newArr) => {
        
        showAvailability.value = true;

        const request = {
            startDate: props.dateRanges[0],
            endDate: props.dateRanges[1]
        }
        const response = await axiosapi.post(`/room-available-date/isAvailable/${props.favItem.roomId}`, request);
        console.log(response.data);
        if (response.data.data == null){
            dateIsAvailable.value = '此日期區間無可用日期';
        }else{

            // 創建可用日期範圍以顯示
            const availableList = [];
            for( let aData of response.data.data){
                availableList.push(aData.availableDates)
            }

            dateIsAvailable.value = '可用日期: '+availableList;
            price.value = response.data.data[0].price;
        }
    });


    // 卸載前再把 removeLst 資料傳出去移除
    onUpdated(()=>{
        // 調用 pinia 的移除函數
        favoriteStore. removeFavLst(removeLst.value);
    })


    // 移除 Favorite List 的事件處理方法
    function removeFromFavLst() {
        const item = props.favItem;
        console.log(item)
        if(item.isFavorited === true){
            // 移除:
            Swal.fire({
                position: "bottom-end",
                text: "已成功從收藏清單移除",
                showConfirmButton: false,
                timer: 1000
            });


            // 先將圖示變成未加入狀態
            item.isFavorited = false;
            

            // 將 favoriteId 加入 removeLst
            removeLst.value.push(item.favoriteId);
            
            
        }else{
            // 重新加入:
            Swal.fire({
                position: "bottom-end",
                text: "已成功加入收藏清單",
                showConfirmButton: false,
                timer: 1000
            });

            // 先將圖示變成已加入狀態
            item.isFavorited = true;
            
            // 將 favoriteId 重新從 removeLst 移除
            let index = removeLst.value.indexOf(item.favoriteId);
            removeLst.value.splice(index, 1);

            // 調用 pinia 的新增函數
            favoriteStore. addRoomToFavLst(item.roomId);
        }
    }


    // 更新 note 的事件處理方法
    async function editFavoriteList(item) {
        
        await favoriteStore.editFavoriteNote(item.favoriteId, item.note);
    }

    //連結到房間頁面
    const goToRoom = (roomId) => {
        router.push({ name: 'room-link', params: { roomId } });
    };
</script>
    
<style scoped>
    .btn.btn-link.position-absolute {
    z-index: 15;
    color: red;
}

</style>