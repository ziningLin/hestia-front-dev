<template>
    <div class="card" style="width: 18rem; position: relative; overflow: hidden;">
        <div 
            class="card-img" 
            :style="{ backgroundImage: `url(${imageUrl})` }">
        </div>
        <div class="card-body" @click="goToCityList" >
            <h5 class="card-title">Favorite in: <strong>{{ city }}</strong></h5>
        </div>
    </div>
</template>
    
<script setup>
    import { defineProps, ref } from 'vue';
    import router from '@/routers/router';
    const path = import.meta.env.VITE_ROOMIMAGE_URL;

    // 接收父組件傳入的標題和分數
    const props = defineProps({
        city: String,
        item: Object
    });

    // 設置 background img 為此 list 的第一筆資料的照片
    const imageUrl = ref(`${path}${props.item[0].roomId}`)
    
    //連結到房間頁面
    const goToCityList = () => {
        router.push({ name: 'favorite-link', params: { city: props.city } });
    };
</script>
    
<style scoped>
.card {
    width: 18rem;
    height: 18rem; /* 保持比例 */
    position: relative;
    border: 1px solid #ddd;
    border-radius: 8px;
    overflow: hidden;
}
.card-img {
    width: 100%;
    height: 100%;
    background-size: cover;
    background-position: center;
    filter: blur(8px); /* 添加模糊效果 */
    transform: scale(1.2); /* 圖片放大避免模糊區域出現邊緣空隙 */
}
.card-body {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    color: white;
    background: rgba(0, 0, 0, 0.2);  /*半透明背景讓文字更清晰 */
    padding: 10px;
    border-radius: 5px;
}
.card-title {
    font-size: 1.25rem;
    margin: 0;
}
</style>