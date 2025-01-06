<template>
    <!-- Modal -->
    <div class="modal fade" :id="'exampleModal' + roomId" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h1 class="modal-title fs-5" id="exampleModalLabel">評價您在 {{ room.roomName }} 的住宿體驗</h1>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>

                <div class="modal-body">
                    <div>
                        <Rating 
                            title="整潔度" 
                            :score="(room.comment?.cleanessScore ?? 0) /2"
                            @update="handleUpdate('cleanessScore', $event)" />
                        <Rating 
                            title="舒適度" 
                            :score="(room.comment?.comfortScore ?? 0) /2"
                            @update="handleUpdate('comfortScore', $event)" />
                        <Rating 
                            title="位置" 
                            :score="(room.comment?.locationScore ?? 0) /2"
                            @update="handleUpdate('locationScore', $event)" />
                        <Rating 
                            title="設施" 
                            :score="(room.comment?.facilityScore ?? 0) /2"
                            @update="handleUpdate('facilityScore', $event)" />
                        <Rating 
                            title="服務" 
                            :score="(room.comment?.pationessScore ?? 0) /2"
                            @update="handleUpdate('pationessScore', $event)" />
                        <Rating 
                            title="我會推薦這個房源" 
                            :score="(room.comment?.recommendationScore ?? 0) /2"
                            @update="handleUpdate('recommendationScore', $event)" />
                    </div>
                    <div class="input-group">
                        <textarea 
                            v-if="room.comment" 
                            class="form-control" 
                            aria-label="With textarea" 
                            style="height: 200px;" 
                            v-model="commentContent">
                        </textarea>

                        <textarea 
                            v-else 
                            class="form-control" 
                            aria-label="With textarea" 
                            style="height: 200px;" 
                            placeholder="write your review here..." 
                            v-model="commentContent">
                        </textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-primary" 
                    data-bs-dismiss="modal" @click="newComment">Save changes</button>
                </div>
            </div>
        </div>
    </div>
    
</template>
    
<script setup>
    import axiosapi from '@/plugins/axios.js';
    import Rating from './RatingBar.vue';
    import { reactive, ref } from 'vue';
    import { defineProps, defineEmits, watch  } from 'vue';
    import { useCommentStore } from '@/stores/comment';

    // 接收父組件傳遞過來的參數
    const props = defineProps({
        roomId: Number,
        orderIdToModal: String
    });

    const commentStore = useCommentStore(); // 獲取 pinia 的 commentStore
    const room = ref(null);
    const ratings = reactive({}); // 收集所有的評分
    const commentContent = ref("");
    const commentId = ref(null);
    const emit = defineEmits(['reloadPage']);

    // 1. 監聽 roomId 加載數據變化
    watch(
    () => props.roomId,
    (newRoomId) => {
        room.value = commentStore.rooms.find(room => room.roomId === newRoomId);
        if (!room.value) {
            console.error('Room not found for roomId:', newRoomId);
        }
    },
        { immediate: true }
    );

    // 2. 監聽 room 加載數據變化
    watch(
        () => room.value,
        (newRoom) => {
            if (newRoom && newRoom.comment) {
                commentContent.value = newRoom.comment.commentContent;
            } else {
                commentContent.value = "";  // 默认值
            }
        },
        { immediate: true }
    );

    // 3. 監聽 room.comment 加載數據變化
    watch(
        () => room.value?.comment, // 监听 room.comment 的变化
        (newComment) => {
            if (newComment) {
                commentContent.value = newComment.commentContent;
                commentId.value = newComment.commentId;
                console.log(commentId.value)
            } else {
                commentContent.value = ""; // 默认值
            }
        },
        { immediate: true } // 确保初次渲染时执行一次
    );

    // 處理子組件的更新
    const handleUpdate = (title, rating) => {
        ratings[title] = rating*2;
    };


    async function newComment(){

        // 先檢查每個欄位都有填寫，沒有的話給一個預設值
        Object.keys(ratings).forEach(key => {
            if (!ratings[key]) ratings[key] = 5;
        });

        // 準備 request
        const request = {
            roomId: props.roomId,
            orderId: parseInt(props.orderIdToModal),
            // 如果没有更新評分，使用default value 或 `room.comment.cleanessScore`
            cleanessScore: ratings.cleanessScore ? ratings.cleanessScore : (room.value.comment ? room.value.comment.cleanessScore : 5),  
            comfortScore: ratings.comfortScore ? ratings.comfortScore : (room.value.comment ? room.value.comment.comfortScore : 5),
            locationScore: ratings.locationScore ? ratings.locationScore : (room.value.comment ? room.value.comment.locationScore : 5),
            facilityScore: ratings.facilityScore ? ratings.facilityScore : (room.value.comment ? room.value.comment.facilityScore : 5),
            pationessScore: ratings.pationessScore ? ratings.pationessScore : (room.value.comment ? room.value.comment.pationessScore : 5),
            recommendationScore: ratings.recommendationScore ? ratings.recommendationScore : (room.value.comment ? room.value.comment.recommendationScore : 5),
            commentContent: commentContent.value || '' 
        };
        console.log(request);
        if(commentId.value){ 
            // 修改 comment
            try{
                console.log(request);
                // 送去後端
                let s = await axiosapi.post(`/order/comment/edit/${commentId.value}`, request);
    
                // 觸發父組件重新加載頁面的事件
                emit('reloadPage');
                
            }catch (error) {
                    console.error('Failed to fetch cart items:', error);
            }
        }
        else{ 
            // 新增 comment
            try{
                console.log(request);
                // 送去後端
                let s = await axiosapi.post('/order/comment/add', request);
    
                // 觸發父組件重新加載頁面的事件
                emit('reloadPage');
                
            }catch (error) {
                    console.error('Failed to fetch cart items:', error);
            }
        }
    }

</script>
    
<style scope>
    /* 使用動態樣式來控制背景顏色 */
    .hovered {
            text-decoration: underline;
            cursor: pointer; /* 改變鼠標樣式 */
            transition: background-color 0.3s ease;
        }
</style>