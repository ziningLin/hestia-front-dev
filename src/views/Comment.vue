<template>
    <CommentPathbar></CommentPathbar>
    <h5>評價你的住宿體驗</h5>
    <h5>訂單編號: {{ orderId }}</h5>
    <div v-for="room in commentStore.rooms" :key="room.id">
        <div class="card mb-3" style="max-width: auto;">
            <div class="row g-0">
                <div class="col-md-4">
                    <img :src="`${path}${room.roomId}`" class="img-fluid rounded-start">
                </div>
                <div class="col-md-8">
                    <div class="card-body">
                        <h5 class="card-title">{{room.roomName}}</h5>
                        <h6>{{room.startDate}} 到 {{room.endDate}}</h6>
                        <p class="card-text"><small class="text-muted">{{room.bedroom}} 間客房 {{room.roomSize}} 個床位</small></p>
                        
                        <Rating 
                            :roomId="room.roomId" 
                            :orderId="orderId"
                            @reloadPage="reloadPage"/>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
    
<script setup>
    import Rating from '../components/comment/Rating.vue';
    const path = import.meta.env.VITE_ROOMIMAGE_URL;
    import { onMounted,ref, defineProps } from 'vue';
    import CommentPathbar from '@/components/comment/CommentPathbar.vue';
    // 獲取當前路由資訊
    import { useRoute } from 'vue-router';
    const route = useRoute();

    // const rooms = ref({});
    const orderId = ref(null);

    // 獲取 pinia 的 commentStore
    import { useCommentStore } from '../stores/comment';
    const commentStore = useCommentStore();

    onMounted(async()=>{
        orderId.value = route.params.orderId; // 獲取路由參數
        console.log("orderId: " +route.params.orderId);
        await commentStore.findOrderRoom(route.params.orderId);
        await commentStore.findOrderComment(route.params.orderId);
    });

    
    // 重新載入頁面
    const reloadPage = () => {
        window.location.reload(); // 重載頁面
    };

</script>
    
<style>

</style>