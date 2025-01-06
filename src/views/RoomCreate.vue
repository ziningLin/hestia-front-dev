<template>
    <div class="centered-container">
        <div>
            <router-view></router-view>
            <div>  
            </div>
        </div>
    </div>
        
</template>
    
<script setup >
import { RouterView } from 'vue-router';
import { onMounted } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute(); // 獲取路由信息
const roomId = route.params.roomId; // 從路由參數中提取 roomId

onMounted(() => {
})
    
</script>
    
<style>
.centered-container {
    justify-content: center;
    align-items: center;
}

</style>