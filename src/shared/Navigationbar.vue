<template>
    <nav class="navbar bg-white">
        <div class="container-fluid">
            <RouterLink class="navbar-brand" to="/">Hestia</RouterLink>
            <div class="d-flex">
                <div class="nav-item dropdown flexBox">  
                    <CartDropDown />
                    <!-- 登入後渲染 -->
                    <div  class="nav-link user-button" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                        <div v-if="userProfileStore.userId" class="user-info">
                            <img :src=avatarUrl alt="Avatar" class="avatar" />
                            <span class="user-name">{{ userProfileStore.name || userProfileStore.email }} &nbsp; <i class="bi bi-chevron-down"></i></span>               
                        </div>
                    </div>
                    <!-- 未登入渲染 -->
                    <div v-if="!userProfileStore.userId" class="auth-container">
                        <router-link class="auth-button" to="/auth/login">登入</router-link>
                        <span class="auth-separator">|</span>
                        <router-link class="auth-button" to="/auth/register">註冊</router-link>
                    </div>
                    <!-- 登入後渲染 -->
                    <ul v-if="userProfileStore.userId" class="dropdown-menu">
                        <li>
                            <router-link class="dropdown-item" to="/profile/info">會員中心</router-link>
                        </li>
                        <li>
                            <router-link class="dropdown-item" to="/order/userCheckOrder">訂單記錄</router-link>
                        </li>
                        <li>
                            <RouterLink v-if="userProfileStore.isProvider" class="dropdown-item" to="/provOrder/providerCheckOrder">訂單記錄 (房東)</RouterLink>
                        </li>
                        <li>
                            <router-link class="dropdown-item" to="/favoriteList">心願單</router-link>
                        </li>
                        <li>
                            <RouterLink v-if="userProfileStore.isProvider" class="dropdown-item" to="/roomCreate/roomlist">管理房源</RouterLink>
                        </li>
                        <li>
                            <a class="dropdown-item" href="#" @click.prevent="logout">登出</a>
                        </li>
                    </ul>
                </div>

            </div>
        </div>
        
    </nav>
</template>

<script setup>
import { ref,onMounted , computed} from 'vue';
import CartDropDown from '@/components/cart/CartDropDown.vue';
import { RouterLink } from 'vue-router';
import Swal from 'sweetalert2';
import axios from '@/plugins/axios';
import router from '../routers/router.js';
import {useUserProfileStore} from '../stores/userProfile.js'
import {useCartStore} from '../stores/cart.js'
import { useFavoriteStore } from '@/stores/favorite.js';
const favoriteStore = useFavoriteStore();

const userProfileStore = useUserProfileStore();
const cartStore = useCartStore();

// 計算圖片路徑
const avatarUrl = computed(() => {
  if (userProfileStore.photo && userProfileStore.photo.startsWith('/9j/')) {
    return `data:image/jpeg;base64,${userProfileStore.photo}`;
  } else {
    return userProfileStore.photo;
  }
});

// 登出
const logout = async () => {
    try {
        await axios.post('/user/auth/logout');
        Swal.fire({
            icon: 'success',
            title: '登出成功',
            text: '您已經成功登出。',
        }).then(() => {
            localStorage.removeItem('isLoggedIn');
            userProfileStore.clearUserProfile();
            cartStore.cleanCartPiniaData();
            favoriteStore.removeFavoritePiniaData();
            router.push({ name: 'Login-link' });
        })
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: '登出失敗',
            text: '系統異常，請稍後再試。',
        });
    }
};

</script>

<style>
nav {
    margin-top: 20px;
}

.flexBox{
    display: flex;
}

.user-button {
    display: flex;
    align-items: center;
    cursor: pointer;
    gap: 8px;
    transition: background-color 0.3s ease;
}

.user-info{
    padding: 10px;
}

.user-info:hover{
    background-color: #f5f5f5;
    border-radius: 15px;
}

.avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); 
    transition: transform 0.3s ease; 
}

.avatar:hover {
    transform: scale(1.2); 
}

.user-name {
    font-family: Arial, sans-serif;
    font-size: 14px;
    font-weight: bold;
    color: #333;
    transition: color 0.3s ease; 
    margin-left: 5px;
}

.user-name:hover {
    color: #007bff; 
}

.dropdown-menu {
    padding: 10px;
    border-radius: 6px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); 
}

.dropdown-item {
    font-family: Arial, sans-serif;
    font-size: 14px;
    color: #333;
    transition: background-color 0.3s ease, color 0.3s ease;
}

.dropdown-item:hover {
    background-color: #f5f5f5; 
    color: #007bff; 
}

.auth-container {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px; 
}

.auth-button {
    font-family: Arial, Helvetica, sans-serif;
    font-size: 14px;
    font-weight: bold;
    color: #333;
    text-decoration: none; 
    padding: 6px 12px;
    border: 1px solid #ccc; 
    border-radius: 4px;
    background-color: #f9f9f9; 
    transition: all 0.3s ease; 
    cursor: pointer;
}

.auth-button:hover {
    background-color: #eaeaea; 
    border-color: #bbb; 
}

.auth-separator {
    font-family: Arial, Helvetica, sans-serif;
    font-size: 14px;
    font-weight: bold;
    color: #555; 
    padding: 0 4px; 
}

</style>