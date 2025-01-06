<template>
    
    <div class="login-background">
        <!-- lottie 動畫-->
        <div id="lottie-fire-animation" class="lottie-container"></div>

        <RouterLink  to="/" class="back-home-icon">
            <i class="bi bi-house-door-fill"></i>
            <span> Hestia</span>
        </RouterLink>
    
        <!-- 卡片 -->
        <div class="login-card-container">
            <div class="card">
                <div class="card-body">
                    <h3 class="card-title text-center mb-4">登入</h3>
                    <form @submit.prevent="handleLogin">
                        <div class="form-group mb-3">
                            <label for="email">信箱</label>
                            <input type="email" id="email" v-model="email" class="form-control" placeholder="請輸入您的信箱" required />
                        </div>
                        <div class="form-group mb-4 password-field">
                            <label for="password">密碼</label>
                            <div class="password-input-container">
                                <input :type="passwordFieldType" id="password" v-model="password" class="form-control" placeholder="請輸入您的密碼" required />
                                <button type="button" class="toggle-password-btn" @click="togglePasswordVisibility">
                                    <i :class="passwordFieldType === 'password' ? 'bi bi-eye' : 'bi bi-eye-slash'"></i>
                                </button>
                            </div>
                        </div>
                        <div class="form-group form-check remember-me-forgot-password">
                            <div class="d-flex align-items-center">
                                <input type="checkbox" id="rememberMe" v-model="rememberMe" class="form-check-input me-2" />
                                <label class="form-check-label" for="rememberMe">記住我</label>
                            </div>
                            <router-link to="/auth/forgotPassword" class="forgot-password-link">忘記密碼？</router-link>
                        </div>
                        <div class="d-grid">
                            <button type="submit" class="btn btn-primary">登入</button>
                        </div>
                    </form>
                    <!-- 新增註冊連結 -->
                    <div class="text-center mt-3">
                        <span>新朋友 ? </span><router-link to="/auth/register">註冊</router-link>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>


<script setup>
import { ref } from 'vue';
import Swal from 'sweetalert2';
import axios from '@/plugins/axios';
import { handleApiError } from '../../utils/error/errorHandler';
import router from '../../routers/router.js';
import Lottie from 'lottie-web';
import { onMounted } from 'vue';
import { useUserProfileStore } from '../../stores/userProfile.js';
import { useWsStore } from '../../stores/ws.js'; 

import { useCartStore } from '@/stores/cart';
const cartStore = useCartStore();

const userProfileStore = useUserProfileStore();
const ws = useWsStore(); 
const email = ref('');
const password = ref('');
const rememberMe = ref(false);
const passwordFieldType = ref('password'); 

// 登入
const handleLogin = async () => {
    try {
        const response = await axios.post('/user/auth/login', {
            email: email.value,
            password: password.value,
            rememberMe: rememberMe.value,
        });

        // 成功
        if (response.status === 200) {
            Swal.fire({
                icon: 'success',
                title: '登入成功',
                text: '歡迎回來！',
            }).then(async ()=>{
                localStorage.setItem('isLoggedIn', 'true');
                await fetchUserProfile();
                await cartStore.fetchCartItems();
                await cartStore.addlocalToCart();  //登入的時候把localStorage的商品都加入購物車裡面
                console.log("Login", cartStore.items);
                ws.initWebSocket();
                router.push({ name: 'Home-link' });
            });
        }
    } catch (error) {
        if (error.response && error.response.status === 401) {
            handleApiError(error, '帳號或密碼錯誤');
        } else if(error.response && error.response.status === 400){
            handleApiError(error, '帳號狀態異常，請稍後再試或聯絡管理員');
        }else{
            handleApiError(error);
        }
    }
};

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

// 切換顯示/隱藏密碼
const togglePasswordVisibility = () => {
    passwordFieldType.value = passwordFieldType.value === 'password' ? 'text' : 'password';
};

onMounted(() => {
    // lottie Fire
    const animation = Lottie.loadAnimation({
        container: document.getElementById('lottie-fire-animation'), 
        renderer: 'svg', 
        loop: true, 
        autoplay: true, 
        path: '/lottie/fire_2.json' 
    });
    animation.setSpeed(0.3)
});
</script>

<style scoped>
.login-background {
    background-image: url('../../assets/images/basic/fireplace_2.jpg');
    background-size: cover;
    background-position: center;
    background-attachment: fixed;
    height: 100vh;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.card {
    position: fixed;
    top: 50%;
    left: 70%;
    transform: translate(-50%, -50%);
    width: 100%;
    max-width: 300px;
    padding: 20px;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
    background-color: #E5E5E5;
    border-radius: 15px;
    opacity: 0.9;
}

.btn-primary {
    background-color: #1e6091;
    border: none;
    color: white;
}

.btn-primary:hover {
    background-color: #184e77;
}

.lottie-container {
    position: absolute;
    bottom: 40.5%;
    left: 27%;
    transform: translate(-50%, -50%);
    width: 130px;
    height: 100px;
    pointer-events: none;
    filter: blur(4px);
    opacity: 0.9;
}

@media (max-width: 900px) {
    .lottie-container {
        display: none;
    }
}

.password-field {
    position: relative;
}

.password-input-container {
    position: relative;
    display: flex;
    align-items: center;
}

.toggle-password-btn {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    cursor: pointer;
    font-size: 1.25rem;
    color: #6c757d;
}

.toggle-password-btn:focus {
    outline: none;
}

.toggle-password-btn:hover {
    color: #333;
}

.remember-me-forgot-password {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
}

.forgot-password-link {
    font-size: 0.875rem;
    text-decoration: none;
    color: #007bff;
}

.forgot-password-link:hover {
    color: #0056b3;
    text-decoration: underline;
}

.back-home-icon {
    position: fixed;
    top: 1%;
    left: 10%;
    font-size: 1.5rem;
    color: #333;
    text-decoration: none;
}

.back-home-icon:hover {
    color: #e74c3c;
}

.back-home-icon span {
    font-size: 20px;
}
</style>
