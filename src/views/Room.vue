<template>
    <div>
        <SearchBar @search="handleSearch" :cities="cities">
        </SearchBar>
    </div>
    <hr>
    <div v-if="room">
        <!-- 房間標題列 -->
        <div class="d-flex justify-content-between align-items-center">
            <!-- 房間名稱 -->
            <h2>{{ room.roomName }} </h2>
            <div>
                <!-- 分享按鈕 -->
                <button type="button" class="btn btn-link" data-bs-toggle="modal" data-bs-target="#exampleModalShare"><i
                        class="bi bi-share"></i>分享</button>
                <!-- 分享視窗 -->
                <div class="modal fade" id="exampleModalShare" tabindex="-1" aria-labelledby="exampleModalLabel"
                    aria-hidden="true">
                    <div class="modal-dialog modal-dialog-centered">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title" id="exampleModalLabel">分享此房源</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal"
                                    aria-label="Close"></button>
                            </div>
                            <div class="modal-body">
                                <div>
                                    <div class="d-flex justify-content-between align-items-start">
                                        <div class="main-photo-small">
                                            <img :src="'data:image/jpeg;base64,' + selectedImage"
                                                class="d-block w-100 img-fluid" alt="Room Image" />
                                        </div>
                                        <div style="margin: 0;padding: 0;margin-right: 30px;">
                                            <div>{{ room.roomTypeName }}・{{ room.cityName }}</div>
                                            <div>{{
                                                room.bedroomCount }}間臥室・{{ room.doubleBed }}張雙人床・{{ room.singleBed
                                                }}張單人床・{{
                                                    room.bathroom }}間衛浴</div>
                                        </div>
                                    </div>
                                    <!-- 顯示當前網址 -->
                                    <div class="input-group">
                                        <input type="text" :value="currentUrl" readonly class="input-link" />
                                        <!-- 複製按鈕 -->
                                        <button @click="copyUrl" class="btn btn-outline-secondary">
                                            複製
                                        </button>
                                    </div>
                                    <!-- 成功提示訊息 -->
                                    <p v-if="copySuccess" class="text-success mt-2">已成功複製！</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <!-- 我的最愛按鈕 -->
                <button class="btn btn-link" @click="toggleFavorite"><i
                        :class="isFavorite ? 'bi bi-suit-heart-fill text-danger' : 'bi bi-suit-heart-fill'"></i>我的最愛</button>
            </div>
        </div>
        <!-- 房間照片 -->
        <div class="d-flex justify-content-between align-items-start">
            <!-- 左側大圖 -->
            <div class="main-photo">
                <img :src="'data:image/jpeg;base64,' + selectedImage" class="d-block w-100 img-fluid"
                    alt="Room Image" />
            </div>
            <!-- 右側小圖 -->
            <div class="block">
                <div class="thumbnail-photos">
                    <div v-for="(imageObj, index) in room.roomImages.slice(0)" :key="index" class="thumbnail">
                        <img :src="'data:image/jpeg;base64,' + imageObj" class="img-fluid" alt="Thumbnail"
                            @click="selectImage(imageObj)" />
                    </div>
                </div>
            </div>
        </div>

        <div class="d-flex justify-content-between align-items-center">
            <!-- 房間標題資訊 -->
            <div class="block1">
                <!-- 房間地區和類型 -->
                <p class="city">位於{{ room.cityName }}的{{ room.roomTypeName }}</p>
                <!-- 房間人數床鋪衛浴數量 -->
                <p class="roomsize">{{ room.roomSize }} 人・{{ room.bedroomCount }}間臥室・{{ room.doubleBed }}張雙人床・{{
                    room.singleBed }}張單人床・{{ room.bathroom }}間衛浴</p>
               
                <hr>
                <!-- 房東資訊 -->
                <div class="provider">
                    <img :src="'data:image/jpeg;base64,' + room.photo" alt="Provider Photo"  class="provider-photo"/>
                    房東：{{ room.username }}
                    <button @click=startConversation class="startConversation">
                        連絡房東
                        <i class="bi bi-chat-heart"></i>
                    </button>
                </div>
                <hr>
                <!-- 房源介紹 -->
                <div class="room-content">房源介紹</div>
                <p class="content">{{ room.roomContent }}</p>
                <!-- 房源介紹-顯示更多內容按鈕 -->
                <button type="button" class="more-details btn btn-link" data-bs-toggle="modal"
                    data-bs-target="#exampleModal">顯示更多內容<i class="bi bi-chevron-right"
                        style="font-size: 16px;"></i></button>
                <!-- 顯示更多內容視窗 -->
                <div class="modal fade" id="exampleModal" tabindex="-1" aria-labelledby="exampleModalLabel"
                    aria-hidden="true">
                    <div class="modal-dialog modal-dialog-scrollable">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title" id="exampleModalLabel">房源介紹</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal"
                                    aria-label="Close"></button>
                            </div>
                            <div class="modal-body">
                                <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{{ room.roomContent }}</div>
                            </div>
                        </div>
                    </div>
                </div>
                <hr>
                <!-- 房源地址 -->
                <div class="room-address">住宿地點</div>
                <p v-if="false" class="address">{{ room.roomAddr }}</p>
                <p v-if="true" class="address">台灣 {{ room.cityName }}</p>
            </div>
            <!-- 訂房區塊 -->
            <div class="block2">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">＄{{ pricePerNight }} 台幣/晚</h5>
                        <!-- 日期選擇器 -->
                        <div class="d-flex justify-content-between align-items-center">
                            <div
                                style="border: 1px solid #ddd; border-right: none; border-bottom: none; border-top-left-radius: 5px; width: 150px;">
                                <label class="form-label">入住</label>
                            </div>
                            <div
                                style="border: 1px solid #ddd; border-bottom: none; border-top-right-radius: 5px; width: 150px;">
                                <label class=" form-label">退房</label>
                            </div>
                        </div>
                        <div class="d-flex justify-content-between align-items-center"
                            style="border-left: 1px solid #ddd;; border-right: 1px solid #ddd; border-bottom: 1px solid #ddd;">
                            <div style="padding-left: 10px;">
                                <date-picker v-model:value="checkInDate" value-type="format" format="YYYY-MM-DD"
                                    :disabled-date="disabledCheckInDate" placeholder="選擇日期"></date-picker>
                            </div>
                            <div style="border-left: 1px solid #ddd; padding-left: 10px;">
                                <date-picker v-model:value="checkOutDate" value-type="format" format="YYYY-MM-DD"
                                    :disabled-date="disabledCheckOutDate" placeholder="選擇日期"></date-picker>
                            </div>
                        </div>
                        <!-- 人數選擇器 -->
                        <div>
                            <div class="form-control-guests d-flex justify-content-between align-items-center">
                                <div>
                                    <label class="form-label">旅客</label>
                                    <input type="text" class="form-control" v-model="totalGuests" readonly
                                        style="border: none;" />
                                </div>
                                <button class="btn dropdown-toggle" type="button" id="dropdownMenuClickableInside"
                                    data-bs-toggle="dropdown" data-bs-auto-close="outside"
                                    aria-expanded="false"></button>
                                <!-- 旅客人數下拉視窗 -->
                                <div class="dropdown-menu dropdownGuest" aria-labelledby="dropdownMenuClickableInside">
                                    <div
                                        class="guest-item dropdown-item d-flex justify-content-between align-items-center">
                                        <span>人數</span>
                                        <div>
                                            <button class="buttonGuest" @click="updateGuests(-1)"
                                                :disabled="totalGuests === 1">-</button>
                                            <span>{{ totalGuests }}</span>
                                            <button class="buttonGuest" @click="updateGuests(1)"
                                                :disabled="totalGuests >= room?.roomSize">+</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <button type="button" class="btn btn-danger w-100 mt-3" @click="callInsertCart">加入購物車</button>
                        <div class="d-flex justify-content-between align-items-center">
                            <p class="card-text1">＄{{ pricePerNight }} 台幣 x {{ nights }} 晚</p>
                            <p class="card-text1">＄{{ totalPrice }} 台幣</p>
                        </div>
                        <div class="d-flex justify-content-between align-items-center">
                            <p class="card-text1">服務費</p>
                            <p class="card-text1">＄{{ serviceFee }} 台幣</p>
                        </div>
                        <hr>
                        <div class="d-flex justify-content-between align-items-center">
                            <p class="card-text2">總金額</p>
                            <p class="card-text2">＄{{ totalPrice + serviceFee }} 台幣</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <!-- 地圖 -->
        <div class="map-container border rounded my-4" style="width: 90%; margin: auto;">
            <div class="google-map" id="map"></div>
        </div>
        <hr>
        <!-- 房間評價 -->
        <RoomComment :roomId="roomId"></RoomComment>
        <hr>
        <!-- 房間設施 -->
        <div>
            <div class="room-fcacility">有提供的設施</div>
            <div>
                <!-- 顯示房間設施 -->
                <ul v-if="facilities.length > 0">
                    <div class="row">
                        <p v-for="(facility, index) in facilities" :key="index" class="facility col-md-5">
                            <i class="bi bi-check-circle facility"></i>{{ facility }}
                        </p>
                    </div>

                </ul>
                <!-- 當數據加載中 -->
                <p v-else-if="isLoading">加載中...</p>
                <!-- 當沒有設施數據時 -->
                <p v-else>暫無設施資料。</p>
            </div>
        </div>
        <hr>
        <!-- 注意事項 -->
        <div>
            <p class="room-notice">注意事項</p>
            <div class="row">
                <div class="notice col-md-4">
                    <p>《房屋守則》</p>
                    <div class="rules">
                        <p v-if="Math.floor(room.checkinTime / 100) > 12"><i class="bi bi-clock"></i>入住時間：下午 {{
                            Math.floor(room.checkinTime / 100)
                            - 12
                            }}:{{ room.checkinTime.toString().slice(-2) }}</p>
                        <p v-else><i class="bi bi-clock"></i>入住時間：上午 {{ Math.floor(room.checkinTime / 100)
                            }}:{{ room.checkinTime.toString().slice(-2) }}</p>
                        <p v-if="Math.floor(room.checkoutTime / 100) < 12"><i class="bi bi-clock"></i>退房時間：上午 {{
                            Math.floor(room.checkoutTime /
                                100)
                        }}:{{ room.checkoutTime.toString().slice(-2) }}</p>
                        <p v-else-if="Math.floor(room.checkoutTime / 100) == 12"><i class="bi bi-clock"></i>退房時間：下午 {{
                            Math.floor(room.checkoutTime
                                /
                                100)
                        }}:{{ room.checkoutTime.toString().slice(-2) }}</p>
                        <p v-else><i class="bi bi-clock"></i>退房時間：下午 {{ Math.floor(room.checkoutTime /
                            100) - 12
                            }}:{{ room.checkoutTime.toString().slice(-2) }}</p>
                        <p><i class="bi bi-people-fill"></i>最多 {{ room.roomSize }} 位客人</p>
                        <p>{{ room.roomNotice }}</p>
                    </div>
                </div>
                <div class="notice col-md-4">
                    <p>《規則》</p>
                    <div class="rules">
                        <p v-for="(roomRegulation, index) in room.roomRegulationName" :key="index">
                            <i class="bi bi-ban"></i>{{ roomRegulation }}
                        </p>
                    </div>
                </div>
                <div class="notice col-md-4">
                    <p>《退訂政策》</p>
                    <div class="rules">
                        <p>在入住日期以前取消，可以拿回全額退款。<br>在這之後，該筆預訂則無法退款。<br><br>
                            請仔細閱讀房東採用的政策，以了解詳情。</p>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div v-else>
        <p>加載中...</p>
    </div>
</template>

<script setup>
import { useUserProfileStore } from '@/stores/userProfile.js'
import { ref, onMounted, computed, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import { useRouter } from 'vue-router';
import axiosapi from "@/plugins/axios";
import SearchBar from "@/components/room/SearchBar.vue";
import RoomComment from '../components/comment/RoomComment.vue';
import { useFavoriteStore } from "@/stores/favorite.js";
import { useCartStore } from "@/stores/cart.js";
import DatePicker from "vue-datepicker-next";
import "vue-datepicker-next/index.css";
import 'vue-datepicker-next/locale/zh-tw.js';
import Swal from 'sweetalert2';
import axios from 'axios';
const API_KEY = import.meta.env.VITE_API_KEY_SALLY;
const path = import.meta.env.VITE_API_Front_URL;

defineProps({
    roomId: {
        type: [String, Number],
        required: true,
    },
});

const userProfileStore = useUserProfileStore();
const route = useRoute();
const router = useRouter();
const roomId = route.params.roomId;
const room = ref(null);
const cities = ref([]);
// 從 URL 參數中獲取 checkInDate, checkOutDate 和 totalGuests
const checkInDate = ref(route.query.checkInDate || '');
const checkOutDate = ref(route.query.checkOutDate || '');
const totalGuests = ref(Number(route.query.totalGuests) || 1);

// 收藏
const favoriteStore = useFavoriteStore();
const isFavorite = ref();
const toggleFavorite = async () => {
    // 登入狀態才可使用
    if (userProfileStore.userId) {
        isFavorite.value = !isFavorite.value;
        if (isFavorite.value === true) {

            Swal.fire({
                position: "bottom-end",
                text: "已成功加入收藏清單",
                showConfirmButton: false,
                timer: 1000
            });

            //調用 favoriteStore 的新增方法
            await favoriteStore.addRoomToFavLst(roomId);
        } else {

            Swal.fire({
                position: "bottom-end",
                text: "已成功從收藏清單移除",
                showConfirmButton: false,
                timer: 1000
            });

            //調用 favoriteStore 的刪除方法
            await favoriteStore.removeFavLstByRoomId(roomId);
        }
    }// 若未登入，就叫你去登入或註冊
    else {
        Swal.fire({
            icon: "warning",
            text: "登入以啟用收藏功能",
            showConfirmButton: false,
            footer: `<a href="${path}/auth/login">登入</a> 還沒有帳號嗎?<a href="${path}/auth/register">點此註冊</a>`
        });
    }
}

// 購物車
const cartStore = useCartStore();

// 加入購物車
async function callInsertCart() {
    const dateRange = getDateRange();
    if (dateRange != null && dateRange.length !== 0) {
        // 有登入的情況下 塞到後端資料庫
        if (userProfileStore.userId) {
            const success = await cartStore.addCart(dateRange, roomId);
            if (success) {
                Swal.fire({
                    position: "bottom-end",
                    text: "已成功加入購物車",
                    showConfirmButton: false,
                    timer: 1000
                });
            }
        }
        // 未登入的情況下 塞到local storage
        else {
            const success = await cartStore.addToCart(dateRange, roomId, totalGuests.value);
            if (success) {
                Swal.fire({
                    position: "bottom-end",
                    text: "已成功加入購物車",
                    showConfirmButton: false,
                    timer: 1000
                });
            } else {
                Swal.fire({
                    position: "bottom-end",
                    text: "此商品已加入過購物車",
                    showConfirmButton: false,
                    timer: 1000
                });
            }
        }
    } else {
        Swal.fire({
            position: "bottom-end",
            text: "請選擇有效日期與人數",
            showConfirmButton: false,
            timer: 1000
        });
    }
}

// 抓到日期區間用途：加入 cart
function getDateRange() {
    const startDate = new Date(checkInDate.value); // 將 checkInDate 轉換為 Date 對象
    const endDate = new Date(checkOutDate.value); // 將 checkOutDate 轉換為 Date 對象

    const dateRange = [];

    // 從 startDate 開始，逐日加一天，直到達到 endDate
    while (startDate < endDate) {
        // 將當前日期格式化為 yyyy-MM-dd 並加入結果陣列
        dateRange.push(startDate.toISOString().split('T')[0]);
        startDate.setDate(startDate.getDate() + 1); // 日期加一天
    }

    return dateRange;
}

const handleSearch = (searchResult) => {
    const query = { searchResult: JSON.stringify(searchResult) };
    router.push({ name: 'Home-link', query });
};

const updateGuests = (amount) => {
    const newGuests = totalGuests.value + amount;
    if (newGuests >= 0 && newGuests <= room.value.roomSize) {
        totalGuests.value = newGuests;
    }
};

////////// 分享網址 //////////
// const baseUrl = `${window.location.protocol}//${window.location.host}`;
// const currentUrl = `${baseUrl}/hestia/room/${roomId}`;
const currentUrl = `http://192.168.33.97:5173/room/${roomId}`;

// 控制複製成功提示的狀態
const copySuccess = ref(false);
// 複製網址功能
const copyUrl = () => {
    // navigator.clipboard.writeText(currentUrl)
    //     .then(() => {
            copySuccess.value = true;
            setTimeout(() => {
                copySuccess.value = false;
            }, 2000); // 2 秒後隱藏提示
        // })
        // .catch(err => {
        //     console.error("複製失敗:", err);
        // });
};

////////// 照片 //////////
const selectedImage = ref(null);
onMounted(async () => {
    try {
        // 獲取所有縣市地區
        const cityResponse = await axiosapi.get(`/city/names`);
        cities.value = cityResponse.data;
        // 加載設施數據
        loadFacilities();
        console.log('房間 ID:', roomId);
        // 加載房間
        const response = await axiosapi.get(`/room/search/id/${roomId}`);
        room.value = response.data[0];
        selectedImage.value = room.value.roomImages[0];
        adress.value = room.value.roomAddr;

        if (userProfileStore.useId) {
            // 初始化 favorite
            await favoriteStore.fetchFavoriteItems();
            if (favoriteStore.roomList.includes((parseInt(roomId)))) {
                isFavorite.value = true;
            } else {
                isFavorite.value = false;
            }
        } else {
            // 初始化 localStorage的cart
            cartStore.initializeCart();
        }
        // 加載地圖
        const latAndLng = await fetchCoordinates();
        await loadGoogleMapsApi();
        await nextTick(); // 等待 DOM 完全渲染
        initMap(latAndLng);
        setMarker(latAndLng);
    } catch (error) {
        console.error('無法獲取房間詳細資訊', error);
    }
    try {
        const response = await axiosapi.get(`/room-available-date/dates&prices/${roomId}`);
        // 假設返回格式為 [[日期1, 價格1], [日期2, 價格2], ...]
        availableDates.value = response.data
            .filter(item => new Date(item[0]) >= new Date(today)) // 僅保留今天及之後的日期
            .map(item => ({
                date: item[0],
                price: item[1],
            }))
            .sort((a, b) => new Date(a.date) - new Date(b.date)); // 按日期升序排序
        console.log('處理後的可用日期:', availableDates.value);
    } catch (error) {
        console.error('無法獲取房間可用日期和價格', error);
    }
});

function selectImage(imageObj) {
    selectedImage.value = imageObj;
}

////////// 設施 //////////
const facilities = ref([]); // 保存設施清單
const isLoading = ref(true); // 加載狀態

// 加載設施數據
const loadFacilities = async () => {
    try {
        const response = await axiosapi.get(`/room-facility/${roomId}`);
        facilities.value = response.data;
    } catch (error) {
        console.error('獲取設施失敗', error);
    }
    finally {
        isLoading.value = false;
    }
};

////////// 日期跟價格 //////////
const availableDates = ref([]);
const today = new Date().toISOString().split("T")[0]; // 今日日期（ISO 格式：YYYY-MM-DD）

// 驗證输入日期是否可用
const validateDate = (date) => availableDates.value.some(item => item.date === date);
const disabledCheckInDate = (date) => {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + 1);
    const newDateString = newDate.toISOString().split('T')[0];
    // 禁用日期檢查
    if (!availableDates.value.some(item => item.date === newDateString)) {
        return true; // 如果該日期不可用，返回 true
    }
    // 如果入住日期無效，清空
    if (!validateDate(checkInDate.value)) {
        checkInDate.value = '';
    }
    // 如果退房日期早於入住日期，清空退房日期
    if (checkOutDate.value && checkOutDate.value < checkInDate.value) {
        checkOutDate.value = '';
    }
    return false; // 如果日期有效，返回 false
};

const disabledCheckOutDate = (date) => {
    const dateString = date.toISOString().split('T')[0];
    const checkInDateString = new Date(checkInDate.value).toISOString().split('T')[0]; // 获取入住日期
    const checkIn = new Date(checkInDate.value);
    // 禁用早於入住日期的退房日期
    if (dateString < checkInDateString) {
        return true;
    }
    // 確保退房日期和入住日期是連續的
    const diffInDays = Math.floor((new Date(date) - checkIn) / (1000 * 60 * 60 * 24)); // 計算入住日期和退房日期的天數差
    console.log("diffInDays", diffInDays);
    if (diffInDays < 0) {
        return true; // 如果退房日期與入住日期之間的差距小於 1 天，返回 true，禁用該日期
    }
    // 檢查日期範圍内的所有日期是否可用（即入住到退房日期之間的所有日期）
    for (let i = 1; i <= diffInDays; i++) {
        const tempDate = new Date(checkInDate.value);
        tempDate.setDate(tempDate.getDate() + i); // 獲取入住日期後面的日期
        const tempDateString = tempDate.toISOString().split('T')[0];
        if (!availableDates.value.some(item => item.date === tempDateString)) {
            return true; // 如果任何日期不可用，禁用退房日期
        }
    }
    // 禁用不可用日期
    return !availableDates.value.some(item => item.date === dateString);
};

// 計算入住晚數
const nights = computed(() => {
    if (checkInDate.value && checkOutDate.value) {
        const checkIn = new Date(checkInDate.value);
        const checkOut = new Date(checkOutDate.value);
        const diffTime = checkOut - checkIn;
        const diffDays = diffTime / (1000 * 60 * 60 * 24); // 將毫秒轉換為天
        return diffDays > 0 ? diffDays : 0; // 確保晚數為正數
    }
    return 0;
});

// 每晚價格動態計算
const pricePerNight = computed(() => {
    if (!checkInDate.value || !checkOutDate.value || !availableDates.value.length) {
        return 0; // 如果未選擇日期或無可用日期，價格為 0
    }

    const checkIn = new Date(checkInDate.value);
    const checkOut = new Date(checkOutDate.value);

    // 遍歷 availableDates 找出入住日期範圍內的價格
    const selectedDates = availableDates.value.filter((dateObj) => {
        const currentDate = new Date(dateObj.date);
        return currentDate >= checkIn && currentDate < checkOut; // 入住日期範圍（不包含退房日）
    });

    // 計算總價格
    const totalPrice = selectedDates.reduce((sum, dateObj) => sum + dateObj.price, 0);

    // 確保不會除以 0
    const totalNights = selectedDates.length;
    return totalNights > 0 ? Math.floor(totalPrice / totalNights) : 0; // 取平均數，確保無法選擇負數價格
});

// 總價計算
const totalPrice = computed(() => Math.round(nights.value * pricePerNight.value));
const serviceFee = computed(() => Math.floor(totalPrice.value * 0.08));

////////// Google 地圖 //////////
const map = ref(null);
const adress = ref(null);

// 由地址轉換為經緯度
const fetchCoordinates = async () => {
    try {
        const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${adress.value}&key=${API_KEY}`)

        return response.data.status === "OK" && response.data.results.length > 0
            ? response.data.results[0].geometry.location : null;

    } catch (error) {
        console.error('請求失敗:', error);
    }
}

// 發送地圖 api
const loadGoogleMapsApi = () => {
    return new Promise((resolve, reject) => {
        if (window.google && window.google.maps) {
            resolve(window.google.maps);
            return;
        }

        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&callback=initMap`;
        script.async = true;
        script.defer = true;
        script.setAttribute("loading", "async"); // 加入最佳化屬性

        script.onload = () => resolve(window.google.maps);
        script.onerror = () => reject(new Error("Failed to load Google Maps API"));
        document.head.appendChild(script);
    });
};

// 初始化地圖
const initMap = (latAndLng) => {
    if (!latAndLng) {
        console.error("經緯度未設置，請為 lat 和 lng 賦值。");
        return;
    }

    const mapElement = document.getElementById("map");
    if (!mapElement) {
        console.error("地圖容器未找到，請檢查 HTML 結構和 id 屬性。");
        return;
    }
    // 用 new Map 建立新地圖，並將地圖呈現在 id 為 map 的元素中
    map.value = new google.maps.Map(mapElement, {
        // 地圖中心點
        center: latAndLng,
        // 設定地圖縮放比例（可設定數值為 0-20）
        zoom: 15,
        // 限制使用者能縮放地圖的最大比例
        maxZoom: 20,
        // 限制使用者能縮放地圖的最小比例
        minZoom: 3,
        // 設定為不呈現右下角街景小人
        streetViewControl: false,
        // 設定為不能切換地圖樣式（若設定 true 則使用者可切換一般地圖、衛星圖）
        mapTypeControl: false,
    });
    console.log("地圖初始化成功！");
};

// 設置標記
const setMarker = (latAndLng) => {
    const marker = new google.maps.Marker({
        // 設定地標的座標
        position: latAndLng,
        // 設定地標要放在哪一個地圖
        map: map.value,
    });
};

// **************** 聊天室相關 ****************** //
import { useChatStore } from '../stores/chatStore.js';
const chatStore = useChatStore();

// 連絡房東按鈕
const startConversation = ()=>{
    chatStore.startConversation(room.value.userId,room.value.username)
}
</script>

<style scoped>
hr {
    color: gray;
}

h2 {
    font-size: 30px;
    font-weight: 500;
    margin-top: 5px;
    margin-bottom: 20px;
    letter-spacing: 1px;
}

.input-group {
    margin-top: 10px;
}

.input-link {
    border: 1px solid gray;
    margin: 0;
    padding: 0;
    padding-left: 10px;
    font-size: 14px;
    width: 87%;
    border-top-left-radius: 5px;
    border-bottom-left-radius: 5px;
}

.btn-link {
    margin: 3px;
    padding: 5px;
    color: black;
    font-size: 12px;
}

.btn-link:hover {
    background-color: #eee;
}

.btn-link:active {
    color: black;
}

.main-photo {
    width: 62%;
}

.main-photo img {
    width: 100%;
    height: 400px;
    border-radius: 5px;
    object-fit: cover;
}

.block {
    margin: 0;
    padding: 0;
    width: 35%;
    height: 400px;
    overflow-y: auto;
    overflow-x: hidden;
}

.thumbnail-photos {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
    width: 100%;
    object-fit: cover;
}

.thumbnail {
    cursor: pointer;
}

.thumbnail img {
    width: 90%;
    height: 100px;
    object-fit: cover;
    border-radius: 5px;
    transition: transform 0.3s ease;
}

.thumbnail img:hover {
    transform: scale(1.05);
}

.allImages {
    margin-bottom: 20px;
}

.bi-share,
.bi-suit-heart-fill {
    margin: 3px;
    font-size: 10px;
}

.main-photo-small {
    width: 100px;
}

.main-photo-small img {
    width: 100px;
    height: 100px;
    border-radius: 5px;
    object-fit: cover;
}

.city {
    font-size: 20px;
    margin: 0;
    margin-top: 10px;
}

.roomsize {
    font-size: 15px;
    margin: 0px;
}

.comment {
    font-size: 15px;
    margin: 0px;
}

.provider-photo {
    width: 50px;
    height: 50px;
    object-fit: cover;
    border-radius: 50%;
    margin-right: 15px;
}

.provider {
    font-size: 18px;
}

.room-content {
    font-size: 18px;
    font-weight: 400;
    margin-bottom: 10px;
}

.content {
    margin-left: 10px;
    font-size: 16px;
    overflow: hidden;
    line-height: 2em;
    max-height: 4em;

}

.more-details {
    color: black;
    font-size: 16px;
}

.more-details:hover {
    color: black;
    font-size: 16px;
    background-color: white;
    font-weight: bolder;
}

.modal-body {
    line-height: 2.5em;
}

.room-address {
    font-size: 18px;
    font-weight: 400;
    margin-bottom: 10px;
}

.address {
    padding: 0;
    margin: 0;
    margin-left: 10px;
}

.block1 {
    margin-right: 30px;
    width: 70%;
}

.card {
    margin-top: 40px;
    width: 330px;
    height: 400px;
    margin-left: 50px;
    margin-right: 40px;
}

.card-title {
    margin-top: 5px;
    margin-bottom: 15px;
}

.form-label {
    margin: 0;
    padding: 0;
    font-size: 12px;
    margin-left: 10px;
    margin-top: 10px;
}

.form-label:hover {
    cursor: pointer;
}

.dropdown-toggle {
    border: none;
    margin: 0;
    padding: 0;
    width: 55px;
    height: 55px;
}

.form-control-guests {
    background-color: white;
    width: 100%;
    margin: 0;
    padding: 0;
    font-size: 14px;
    text-align: left;
    border: 1px solid #ddd;
    border-top: none;
    border-bottom-left-radius: 5px;
    border-bottom-right-radius: 5px;
}

.form-control-guests:focus {
    border-color: #fff;
    box-shadow: none;
}

.form-control {
    border: 0;
    box-shadow: none;
    margin: 0;
    padding-top: 0;
    font-size: 14px;
}

.form-control:focus {
    border-color: #fff;
    box-shadow: none;
}

.dropdownGuest {
    position: absolute;
    left: -240px !important;
    z-index: 1050;
    width: 295px;
    border-radius: 10px;
    background: white;
    padding: 0;
    padding-left: 15px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.guest-item {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 0;
    padding: 2px;
}

.guest-item:hover {
    background-color: white;
    cursor: pointer;
}

.buttonGuest {
    width: 30px;
    height: 30px;
    background: #ddd;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    margin: 15px;
}

.card-text1 {
    margin: 0;
    padding: 0;
    margin-top: 20px;
}

.card-text2 {
    margin: 0;
    padding: 0;
}

.room-fcacility {
    font-size: 18px;
    font-weight: 400;
    margin-bottom: 10px;
}

.facility {
    font-size: 16px;
    margin-right: 10px;
}

.room-notice {
    font-size: 18px;
    font-weight: 400;
    margin-bottom: 10px;
}

.notice {
    margin-left: 10px;
    width: 400px;
}

.rules {
    margin-left: 20px;
    font-size: 16px;
}

.rules i {
    font-size: 16px;
    margin-right: 5px;
}

.google-map {
    width: 100%;
    height: 400px;
}

:deep(.mx-datepicker) {
    width: 136px;
}

:deep(.mx-input) {
    height: 28px;
    padding-left: 0px;
    border: 1px solid white;
    box-shadow: inset 0 1px 1px white;
}

:deep(.mx-input:hover) {
    border-color: white;
}

:deep(.mx-input:focus) {
    border-color: white;
}

/* 聊天室按鈕 */
.startConversation {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 2px 8px;
    background: #f2f4f7;
    color: #333;
    font-size: 14px;
    border: 1px solid #d1d9e0;
    border-radius: 4px;
    cursor: pointer;
    transition: background 0.3s, border-color 0.3s;
}

.startConversation:hover {
    background: #e7ebef;
    border-color: #b8c2cc;
}

.startConversation i {
    font-size: 16px;
}
</style>
