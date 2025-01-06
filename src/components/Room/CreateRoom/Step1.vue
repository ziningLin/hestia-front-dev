<template>
    <div class="mb-5 mt-5">
        <!-- Room Name -->
        <div class="space-control">
            <label for="roomName" class="form-label label-style">輸入你的房源名稱</label>
            <input v-model="selectedRoomName" type="text" placeholder="名稱" class="form-control form-control-lg">
        </div>


        <!-- City -->
        <div class="space-control">
            <label for="city" class="form-label label-style">所在城市</label>
            <select v-model="selectedCity" class="form-select form-select-lg mb-3">
                <option selected>選擇城市</option>
                <option v-for="city in cities" :key="city.cityId" :value="city.cityId">{{ city.cityName }}</option>
            </select>
        </div>

        <!-- Room Type -->
        <div class="space-control">
            <label for="roomType" class="form-label label-style">下列哪項最能確切描述你的房源？</label>
            <div class="row g-3">
                <div v-for="roomType in roomTypes" :key="roomType.roomTypeId" class="col-6 col-md-3 col-lg-3">
                    <div @click="selectRoomType(roomType.roomTypeId)" class="card"
                        :class="{ selected: selectedRoomType === roomType.roomTypeId }">
                        <!-- 添加 Font Awesome 圖標 -->
                        <font-awesome-icon :icon="roomType.icon" class="fas-icon" />
                        <div class="card-body">
                            <p class="card-text text-center">{{ roomType.name }}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Step Button -->
        <div class="d-flex justify-content-end">
            <!-- if not completed , disabled button -->
            <button @click="nextStep" :disabled="!selectedRoomType || !selectedRoomName || !selectedCity"
                class="btn btn-dark btn-lg">
                下一步
            </button>
        </div>
    </div>

</template>

<script setup>
import { ref, onMounted } from "vue";
import axiosapi from "@/plugins/axios";
import { useRouter } from "vue-router";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { useUserProfileStore } from '../../../stores/userProfile.js';
// define
const router = useRouter()
const cities = ref([])
const selectedRoomType = ref("")
const selectedRoomName = ref("")
const selectedCity = ref("")

const nextStep1 = ()=>{
    // :disabled="!selectedRoomType || !selectedRoomName || !selectedCity"
    console.log('selectedRoomType',selectedRoomType);
    console.log('selectedRoomName',selectedRoomName);

    console.log('selectedCity',selectedCity);

    
}

const roomTypes = [
    {
        roomTypeId: 1,
        name: '獨棟房屋',
        icon: ['fas', 'house'],
    },
    {
        roomTypeId: 2,
        name: '公寓',
        icon: ['fas', 'building'],
    },
    {
        roomTypeId: 3,
        name: '時尚風格',
        icon: ['fas', 'gem'],
    },
    {
        roomTypeId: 4,
        name: 'B&B',
        icon: ['fas', 'hotel'],
    },
    {
        roomTypeId: 5,
        name: 'Loft',
        icon: ['fas', 'couch'],
    },
    {
        roomTypeId: 6,
        name: '民宿',
        icon: ['fas', 'bed'],
    },
    {
        roomTypeId: 7,
        name: '日式建築',
        icon: ['fas', 'torii-gate'],
    },
    {
        roomTypeId: 8,
        name: '鄉村',
        icon: ['fas', 'tractor'],
    },
    {
        roomTypeId: 9,
        name: '山林',
        icon: ['fas', 'tree'],
    },
    {
        roomTypeId: 10,
        name: '湖畔',
        icon: ['fas', 'water'],
    },
    {
        roomTypeId: 11,
        name: '玻璃屋',
        icon: ['fas', 'cube'],
    },
    {
        roomTypeId: 12,
        name: '露營屋',
        icon: ['fas', 'tents'],
    },
    {
        roomTypeId: 13,
        name: '小木屋',
        icon: ['fas', 'house-chimney'],
    },
    {
        roomTypeId: 14,
        name: '海邊',
        icon: ['fas', 'umbrella-beach'],
    },
    {
        roomTypeId: 15,
        name: '藝術家的屋',
        icon: ['fas', 'palette'],
    },
];

onMounted(() => {
    callCities()
    callRoomTypes()
})

// City
async function callCities() {
    try {
        const response = await axiosapi.get("/city/all")
        cities.value = await response.data
    } catch (error) {
        console.log("error", error.message)

    }
}

// RoomType
async function callRoomTypes() {
    try {
        const response = await axiosapi.get("/room-type/all")
        roomTypes.value = await response.data
    } catch (error) {
        console.log("error", error.message)
    }
}

const selectRoomType = (roomTypeName) => {
    selectedRoomType.value = roomTypeName;
}

const userProfileStore = useUserProfileStore();

// nextStep button
const nextStep = async () => {
    // 傳送到後端的資料
    const roomData = {
        providerId: userProfileStore.providerId,
        stateId: 20,
        roomName: selectedRoomName.value,
        cityId: selectedCity.value,
        roomTypeId: selectedRoomType.value,
        checkinTime: 15.00,
        checkoutTime: 11.00,
        refundPolicyId: 1
    }
    try {
        // 發送 POST 請求到後端
        const response = await axiosapi.post("/room/provider/create/step-one", roomData)
        // 從後端回傳中獲取 roomId (帶到下一步)
        const roomId = response.data.data[0].roomId; // 針對嵌套結構提取

        if (!roomId) {
            throw new Error("後端未回傳 roomId");
        }
        // 跳轉到step two組件畫面
        router.push({
            path: `/roomCreate/step-two/${roomId}`,
            query: { roomId },
        })
    } catch (error) {
        console.log("error", error.message)
    }
}

</script>

<style scoped>
.label-style {
    font-size: 30px;
    /* 調整字體大小 */
    font-weight: bold;
    /* 加粗字體 */
}

.space-control {
    margin-bottom: 40px;
    /* 每個區塊之間增加間距 */
}

.card {
    cursor: pointer;
    display: flex;
    /* 使用彈性盒子橫向排列 */
    align-items: center;
    /* 圖片與文字垂直置中 */
    border: 1px solid #ddd;
    /* 默認邊框 */
    border-radius: 8px;
    /* 卡片圓角 */
    background-color: #fff;
}

.card.selected {
    border: 2px solid #000;
    /* 選中時的黑色邊框 */
}

.fas-icon {
    font-size: 40px;
    margin-top: 10px;
}

.card-body {
    font-size: 14px;
    font-weight: bold;
}

.row {
    gap: 15px;
    /* 卡片間距 */
}
</style>
