<template>
    <div class="row">
        <!-- 動態生成卡片 -->
        <div v-for="room in localRoom" :key="room.roomId" class="item col-lg-3">
            <div class="card h-100">
                <!-- 照片輪播 -->
                <div v-if="room.images.length" @click="goToRoom(room.roomId)" :id="'carousel-' + room.roomId"
                    class="carousel slide" data-bs-ride="carousel" style="cursor: pointer;">
                    <!-- 控制項 -->
                    <div class="carousel-inner">
                        <div v-for="(image, imageIndex) in room.images" :key="imageIndex" class="carousel-item"
                            :class="{ active: imageIndex === 0 }">
                            <img :src="'data:image/jpeg;base64,' + image" loading="lazy" class="d-block w-100 img-fixed"
                                alt="Room Image" />
                        </div>
                    </div>
                    <!-- 控制項的左右控制按鈕 -->
                    <button class="carousel-control-prev" type="button" :data-bs-target="'#carousel-' + room.roomId"
                        data-bs-slide="prev" @click.stop>
                        <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                        <span class="visually-hidden">Previous</span>
                    </button>
                    <button class="carousel-control-next" type="button" :data-bs-target="'#carousel-' + room.roomId"
                        data-bs-slide="next" @click.stop>
                        <span class="carousel-control-next-icon" aria-hidden="true"></span>
                        <span class="visually-hidden">Next</span>
                    </button>
                    <!-- 指示器 -->
                    <div class="carousel-indicators">
                        <button v-for="(image, imageIndex) in room.images" :key="imageIndex"
                            :data-bs-target="'#carousel-' + room.roomId" :data-bs-slide-to="imageIndex"
                            :class="{ active: imageIndex === 0 }" type="button" aria-current="true"
                            :aria-label="'Slide ' + (imageIndex + 1)" @click.stop></button>
                    </div>
                </div>
                <!-- 如果沒有圖片，顯示一個空白頁面 -->
                <div v-else class="card-img-top placeholder bg-secondary"></div>
                <!-- 收藏按钮 -->
                <button class="btn btn-link position-absolute top-0 end-0" @click="toggleFavorite(room)">
                    <i
                        :class="computeValue(room) ? 'bi bi-suit-heart-fill' : 'bi bi-suit-heart-fill text-secondary'"></i>
                </button>
                <!-- 房間資訊 -->
                <div class="card-body">
                    <h5 class="card-title" @click="goToRoom(room.roomId)" style="cursor: pointer;">{{ room.roomName }}
                    </h5>
                    <p class="card-city">{{ room.cityName }}</p>
                    <p class="card-amount">{{ room.roomSize }}人·{{ room.bedroomCount }}房·{{
                        room.doubleBed }}張雙人床·{{
                            room.singleBed }}張單人床·{{ room.bathroom }}間衛浴</p>
                    <p class="card-provider">房東：{{ room.username }}</p>
                    <div class="d-flex justify-content-between align-items-center">
                        <p class="card-price fw-bold">${{ room.closestPrice || 'N/A' }} 台幣/晚</p>
                        <p class="card-star fw-bold" v-if="room.overallScore!='NaN'"><i class="bi bi-star-fill"></i>{{ room.overallScore }}</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { useFavoriteStore } from "@/stores/favorite.js";
import { useUserProfileStore } from "@/stores/userProfile.js";
import { ref, reactive, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import Swal from "sweetalert2";
import axiosapi from '@/plugins/axios.js'
import { useSearchCriteriaStore } from "../../stores/searchCriteria";
const router = useRouter();
const searchCriteriaStore = useSearchCriteriaStore();
const userProfileStore = useUserProfileStore();
const favoriteStore = useFavoriteStore();
const favoriteSet = reactive(new Set());
const path = import.meta.env.VITE_API_Front_URL;

const props = defineProps({
    rooms: {
        type: Array,
        required: true,
    },
});

onMounted(async () => {
    // 登入狀態才加載 pinia
    if (userProfileStore.userId != null) {
        await favoriteStore.fetchFavoriteItems();
        initializeFavorites();
    }
});

const initializeFavorites = async () => {
    while (!favoriteStore.roomList.length) {
        await new Promise((resolve) => setTimeout(resolve, 100)); // 等待資料加載
    }
    favoriteStore.roomList.forEach((roomId) => favoriteSet.add(roomId));
};

// 计算是否收藏
const computeValue = (room) => favoriteSet.has(room.roomId);
// 切換收藏狀態
async function toggleFavorite(room) {
    // 登入狀態才可使用
    if (localStorage.getItem("isLoggedIn")) {
        if (favoriteSet.has(room.roomId)) {
            favoriteSet.delete(room.roomId); // 從收藏中移除

            Swal.fire({
                position: "bottom-end",
                text: "已成功從收藏清單移除",
                showConfirmButton: false,
                timer: 1000
            });

            //調用 favoriteStore 的刪除方法
            await favoriteStore.removeFavLstByRoomId(room.roomId);
        } else {
            favoriteSet.add(room.roomId); // 添加到收藏

            Swal.fire({
                position: "bottom-end",
                text: "已成功加入收藏清單",
                showConfirmButton: false,
                timer: 1000
            });

            //調用 favoriteStore 的新增方法
            await favoriteStore.addRoomToFavLst(room.roomId);

        }
    }
    // 若未登入，就叫你去登入或註冊
    else {
        Swal.fire({
            icon: "warning",
            text: "登入以啟用收藏功能",
            showConfirmButton: false,
            footer: `<a href="${path}/auth/login">登入</a> 還沒有帳號嗎?<a href="${path}/auth/register">點此註冊</a>`
        });
    }
};

// 處理 room 評價
const localRoom = ref();
// 監聽 props.rooms 的變化，當數據完成載入， 就開始查他的總評價
watch(() => props.rooms, async (newItems) => {
    // 使用 Promise.all 來並行處理每個房間的 API 請求
    const updatedRooms = await Promise.all(
        newItems.map(async (room) => {
            // 發送 API 請求獲取每個房間的平均分數
            const response = await axiosapi.get(`/order/comment/avg/${room.roomId}`);

            // 將 overallScore 塞進對應的 room 物件
            room.overallScore = response.data.obj.overallTotalScore;

            // 返回修改過的 room 物件
            return room;
        })
    );
    // 將更新後的房間資料賦值給 localRoom
    localRoom.value = updatedRooms;
});

//連結到房間頁面
const goToRoom = (roomId) => {
    const { checkInDate, checkOutDate, totalGuests } = searchCriteriaStore;
    router.push({
        name: 'room-link',
        params: { roomId },
        query: {
            checkInDate,
            checkOutDate,
            totalGuests
        }
    });
    // 清空搜尋欄
    searchCriteriaStore.location = '';
    searchCriteriaStore.setCheckInDate('');
    searchCriteriaStore.setCheckOutDate('');
    searchCriteriaStore.updateGuests(-searchCriteriaStore.totalGuests); // 重置為 0
};
</script>

<style scoped>
.item {
    margin-bottom: 20px;
}

.card {
    border: none;
    margin-bottom: 20px;
}

.img-fixed {
    width: 100%;
    height: 245px;
    object-fit: cover;
    border-radius: 10px;
}

.carousel-control-prev-icon,
.carousel-control-next-icon {
    display: none;
    color: black;
    width: 40px;
    height: 40px;
    background-size: 50%;
}

.item:hover .carousel-control-prev-icon,
.item:hover .carousel-control-next-icon {
    display: block;
}

.carousel-indicators button {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background-color: #fff;
    opacity: 0.5;
    border: none;
}

.carousel-indicators .active {
    background-color: #007bff;
    opacity: 1;
}

.placeholder {
    width: 100%;
    height: 200px;
}

.btn.btn-link.position-absolute {
    z-index: 15;
    color: red;
}

.card-body {
    margin: 0;
    padding: 0;
}

.card-title {
    font-size: 16px;
    font-weight: bolder;
    margin-top: 10px;
}

.card-city {
    font-size: 12px;
    margin-top: 8px;
    margin-bottom: 0;
}

.card-comment {
    font-size: 12px;
    margin-top: 8px;
    margin-bottom: 0;
}

.card-amount {
    font-size: 12px;
    margin-bottom: 0;
}

.card-provider {
    font-size: 12px;
    margin-top: 5px;
    margin-bottom: 0;
}

.card-price {
    font-size: 14px;
    margin-top: 10px;
    margin-bottom: 0;
}

.card-star {
    font-size: 14px;
    margin-top: 10px;
    margin-bottom: 0;
}
</style>