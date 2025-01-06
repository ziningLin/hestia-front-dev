<template>
    <div class="container">
        <div class="row">
            <div class="col space-control">
                <h1>恭喜</h1><br>
                <h3>歡迎你加入 Hestia 房東社群這個大家庭。<br>
                    感謝你分享房源，我們期待你的房源為更多人帶來家的溫暖與美好。</h3><br><br>

                <h5 class="text-control">Hestia 開發團隊</h5><br>
                <div class=" text-control">
                    <button class="col-3 btn btn-dark btn-lg " @click="nextStep">我們開始吧</button>
                </div> 
            </div>
            <div class="col d-flex justify-content-between">
                <div ref="finishRoom" class="w-64 h-64 animation-container"></div> 
            </div>
        </div>

        <!-- Step Button -->
        <div class="d-flex justify-content-end ">
           
        </div>
    </div>
</template>
    
<script setup>
import { ref,onMounted} from 'vue';
import axiosapi from "@/plugins/axios";
import { useRouter } from 'vue-router';
import lottie from 'lottie-web';

// define
const router =useRouter()
    // 綁定 DOM 容器
    const finishRoom = ref(null);

// 初始化 Lottie 動畫
const loadAnimation = async (container, path) => {
    try {
        const response = await fetch(path);
        const animationData = await response.json()

        lottie.loadAnimation({
        container,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        animationData, // 直接使用預加載的 JSON 數據
        });
    } catch (error) {
        console.error('Failed to load animation:', error)
    }
    }

// 動畫初始化
    onMounted(() => {
        loadAnimation(finishRoom.value, '/lottie/room-finish.json')
    })

// nextStep button
const nextStep=()=>{
    router.push({path:"/roomCreate/roomlist",})
}

    
</script>
    
<style scoped>
.space-control{
    margin-top: 30px;
    margin-bottom: 40px; /* 每個區塊之間增加間距 */
    display: flex;
    flex-direction: column; /* 垂直排列元素 */
    justify-content: center; /* 垂直居中 */
}
.animation-container {
  width: 650px; /* 設置寬度 */
  height: 650px; /* 設置高度 */
}
.text-control{
    display: flex;
    justify-content: end;
    margin-right: 10px;
}

    
</style>
