<template>
    <router-view></router-view>
</template>

<script setup>
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "bootstrap-icons/font/bootstrap-icons.min.css";
import "@vueform/slider/themes/default.css";
import axios from './plugins/axios.js';
import { onMounted } from "vue";
import { useUserProfileStore } from './stores/userProfile';
import { useWsStore } from './stores/ws.js'; 


const userProfileStore = useUserProfileStore();

const ws = useWsStore(); 

// isLoggedIn 作為登入識別，處於登入狀態且沒有 User 資料才發請求
onMounted(async () => {
    
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    // 登入狀態
    if (isLoggedIn === 'true' && !userProfileStore.userId) {
        await fetchUserProfile();
    }
    // 初始化 WebSocket 連線
    if (isLoggedIn === 'true' && !ws.isConnected) {
        ws.initWebSocket();
    }
})

// 初始化個人資料並存入 pinia
const fetchUserProfile = async () => {
    try {
        const response = await axios.get('/user/info');
        if(response.status === 200){
            userProfileStore.setUserProfile(response.data);
        }else if(response.status === 401){
            localStorage.removeItem('isLoggedIn'); // 如果未登入，清除 localStorage 標識
        }
    } catch (error) {
        console.error('無法獲取使用者資料:', error);
    }
};

defineOptions({
    name: 'App',
})


</script>

<style scoped></style>