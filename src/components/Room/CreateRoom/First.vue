<template>
    <div class="container">
        <div class="row">
            <div class="col first-div">
                <h1>在 Hestia 上⁠展⁠開出⁠租⁠業⁠務⁠很⁠簡⁠單</h1>
            </div>
            <div class="col">
                <div class="step">
                    <div class="text-container">
                        <h3>1 向我們介紹你的房源</h3>
                        <h5>請分享一些基本信息，像是房原名稱及所在城市。</h5>
                    </div>
                    <div ref="introAnimation" class="w-64 h-64 animation-container"></div>
                </div>

                <div class="step">
                    <h3>2 精確的地址資訊可協助房客更快找到您的房源。</h3>
                </div>

                <div class="step">
                    <div class="text-container">
                        <h3>3 描述房源特點</h3>
                        <h5>簡單介紹房間及衛浴，用一句话描述房源亮點。</h5>
                    </div>
                </div>

                <div class="step">
                    <div class="text-container">
                        <h3>4 讓房源脱颖而出</h3>
                        <h5>列出房源提供的設施及細則。</h5>
                    </div>
                </div>

                <div class="step">
                    <div class="text-container">
                        <h3>5 完成並發布</h3>
                        <h5>新增至少 5 張相片，接著就能發布房源了。</h5>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <!-- Step Button -->
    <div class="d-flex justify-content-end ">
        <button class="btn btn-dark btn-lg" @click="nextStep">開始吧</button>
    </div>
</template>
    
<script setup>
import { ref,onMounted } from 'vue';
import axiosapi from "@/plugins/axios";
import { useRouter } from 'vue-router';
import lottie from 'lottie-web';

// define
const router =useRouter()
    // 綁定 DOM 容器
    const introAnimation = ref(null);


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
        loadAnimation(introAnimation.value, '/lottie/animation.json')
    })

// nextStep button
    const nextStep=()=>{
        router.push({path:"/roomCreate/step-one",})

    }
    
</script>
    
<style scoped>
.first-div{
    display: flex;
    flex-direction: column; /* 垂直排列元素 */
    justify-content: center; /* 垂直居中 */
    align-items: center; /* 水平居中 */
}
h1{
    font-weight: 900;
    font-size: 80px;

}
.step {
    display: flex;
    align-items: center; /* 垂直居中對齊 */
    gap: 30px; /* 調整文字與圖片之間的間距 */
    margin-bottom: 36px; /* 每個區塊之間增加間距 */
}
.text-container {
  display: flex;
  flex-direction: column; /* 使 h3 和 h5 在同一列显示 */
}
.animation-container {
  width: 150px; /* 設置寬度 */
  height: 150px; /* 設置高度 */
}
h5{
    margin-left: 20px;
    color:gray;
}
    
</style>