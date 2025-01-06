<template>
    <div class="profile-header text-center">
        <img :src="avatarUrl" alt="頭貼" class="profile-avatar" />
        <p class="profile-welcome">
            歡迎！<strong>{{ userProfileStore.name || userProfileStore.email }}</strong>
        </p>
    </div>

    <div class="container">
        <div class="row">
            <!-- 垂直導航列 -->
            <div class="col-md-12">
                <div class="list-group">
                    <span href="#" class="list-group-item list-group-item-action active" aria-current="true">
                        <i class="bi bi-person-circle"></i> 我的帳戶
                    </span>
                    <router-link class="list-group-item list-group-item-action" to="/profile/info"><i class="bi bi-person"></i>個人檔案</router-link>
                    <router-link v-if="!userProfileStore.isProvider === true" class="list-group-item list-group-item-action" to="/profile/provider/register"><i class="bi bi-house-add"></i>成為房東</router-link>
                    <router-link v-if="userProfileStore.isProvider === true" class="list-group-item list-group-item-action" to="/profile/provider/info"><i class="bi bi-house-gear"></i>關於房東</router-link>
                    <router-link class="list-group-item list-group-item-action" to="/auth/updatePassword"><i class="bi bi-gear"></i>更改密碼</router-link>
                    <router-link class="list-group-item list-group-item-action"  to="" @click="terminateAccoint"><i class="bi bi-x-circle"></i>註銷帳號</router-link>
                </div>
            </div>
        </div>
    </div>

</template>
  
<script setup>
import { ref,computed  } from 'vue';
import { useUserProfileStore } from '../../stores/userProfile';
import Swal from 'sweetalert2';
import axios from '../../plugins/axios.js';
import router from '../../routers/router.js';

// Pinia
const userProfileStore = useUserProfileStore();
// 動態生成頭像 URL
const avatarUrl = computed(() => {
  if (userProfileStore.photo && userProfileStore.photo.startsWith('/9j/')) {
    return `data:image/jpeg;base64,${userProfileStore.photo}`;
  } else {
    return userProfileStore.photo;
  }
});

// 用來追蹤哪些選項是展開的
const expandedItems = ref([]);

// 切換展開狀態
const toggleExpand = (item) => {
    // 如果已經展開，則關閉
    if (expandedItems.value.includes(item)) {
        expandedItems.value = expandedItems.value.filter(i => i !== item);
    // 展開列表
    } else {
        expandedItems.value.push(item);
    }
};

const terminateAccoint = async() => {
    Swal.fire({
        title: "確認註銷",
        text: "請輸入「確認註銷」以完成操作，此操作無法恢復！",
        input: "text",
        inputAttributes: {
            autocapitalize: "off",
            placeholder: "輸入: 確認註銷",
        },
        showCancelButton: true,
        confirmButtonText: "確認",
        cancelButtonText: "取消",
        showLoaderOnConfirm: true,
        preConfirm: async (inputValue) => {
            if (inputValue !== "確認註銷") {
                Swal.showValidationMessage("請正確輸入「確認註銷」！");
                return false;
            }
            try {
                const response = await axios.delete("/user/terminate")
                if (response.status === 200) {
                    return true; // 註銷成功
                }
            } catch (error) {
                Swal.showValidationMessage(`請求失敗: ${error.message}`);
                return false; 
            }
        },
        allowOutsideClick: () => !Swal.isLoading(),
    }).then(async(result) => {
        if (result.isConfirmed) {
            await logout();
        }
    });
}

const logout = async () => {
    try {
        await axios.post('/user/auth/logout');
        Swal.fire({
            icon: 'success',
            title: '註銷成功',
            text: '您已經成功登出。',
        }).then(() => {
            localStorage.removeItem('isLoggedIn');
            userProfileStore.clearUserProfile();
            router.push({ name: 'Login-link' });
        });
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: '登出失敗',
            text: '系統異常，請稍後再試。',
        });
    }
};
</script>
  
  <style scoped>
.list-group-item {
    background-color: #E5E5E5; 
    border: none;
}

.list-group-item:hover {
    background-color: #33415c;
    color: #fff;
}

.list-group-item.active {
    background-color: #33415c;
    border: none;
    color: #fff;
}

.list-group-item i {
    margin-right: 8px; /* 增加圖標與文字之間的距離 */
}   

.profile-header {
    margin: auto auto 20px auto;
    width: 200px;
    padding: 20px;
    background-color: #E5E5E5; 
    border-radius: 10px; 
}

.profile-avatar {
    width: 50px; 
    height: 50px; 
    border-radius: 50%; 
    border: 2px solid #22223b;
    object-fit: cover; 
    margin-bottom: 10px; 
}

.profile-welcome {
    font-size: 1rem;
    color: #444; 
}

.profile-welcome strong {
    color: #22223b; 
}
  </style>
  