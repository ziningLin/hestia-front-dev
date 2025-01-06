<template>
    <div class="mb-5 mt-5">
        <!-- Facility -->
        <div class="space-control">
            <label for="roomFacility" class="form-label label-style">讓房客知道房源內有提供哪些設備與服務</label><br>
            <span>你可以在發布房源後新增更多設備與服務。</span><br><br>
            <div class="row g-3" >
                <div v-for="facility in facilities" :key="facility.facilityId" class="col-6 col-md-3 col-lg-3" >
                    <div  @click="selectFacility(facility.facilityId)" class="card" :class="{ selected: selectedFacility.includes(facility.facilityId)}">
                            <!-- 添加 Font Awesome 圖標 -->
                                <font-awesome-icon
                                    :icon="facility.icon"
                                    class="fas-icon"
                                />
                            <div class="card-body">
                                <p class="card-text text-center">{{ facility.name }}</p>
                            </div>
                    </div>
                </div>
            </div>
        </div>
        <!-- Regulation -->
        <h3 class="label-style">維護你的房源品質</h3><br>
        <div v-for="regulation in regulations" :key="regulation.regulationId" class="form-check regulation-item">
            <input v-model="selectedRegulation" class="form-check-input" type="checkbox" :value="regulation.regulationId" id="regulation">
            <label class="form-check-label" for="regulation">
                {{ regulation.name }}
            </label>
        </div>

        <!-- Step Button -->
        <div class="d-flex justify-content-between">
            <button class="btn btn-dark btn-lg" @click="previousStep">上一步</button>
            <!-- if not completed , disabled button -->
            <button class="btn btn-dark btn-lg" @click="nextStep">
                下一步
            </button>
        </div>
    </div>

</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import axiosapi from "@/plugins/axios";
import { useRoute,useRouter } from 'vue-router';
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

// define
const router =useRouter()
const route =useRoute()
const roomId = route.params.roomId
const regulations=ref([])
const selectedFacility=ref([])
const selectedRegulation=ref([])

onMounted(async()=>{
    await callFacilities()
    await callRegulations()
})

// Facilites
const facilities = ref([]) // 後端數據會填充到這裡

const iconMapping = {
    1: ['fas', 'wifi'], // Wi-Fi
    2: ['fas', 'tv'], // 電視
    3: ['fas', 'fa-utensils'], // 廚房
    4: ['fas', 'snowflake'], // 冰箱
    5: ['fas', 'fa-bowl-food'], // 早餐
    6: ['fas', 'fa-mug-hot'], // 咖啡機
    7: ['fas', 'fan'], // 空調設備
    8: ['fas', 'fa-temperature-high'], // 暖氣
    9: ['fas', 'fa-wind'], // 吹風機
    10: ['fas', 'fa-tshirt'], // 熨斗
    11: ['fas', 'soap'], // 洗衣機
    12: ['fas', 'fa-box'], // 烘衣機
    13: ['fas', 'fa-baby'], // 嬰兒床
    14: ['fas', 'fa-laptop'], // 專屬工作空間
    15: ['fas', 'fa-hot-tub'], // 按摩浴池
    16: ['fas', 'fa-bed'], // 加大雙人床
    17: ['fas', 'fa-dumbbell'], // 健身房
    18: ['fas', 'parking'], // 免費停車
    19: ['fas', 'money-check-dollar'], // 收費停車
    20: ['fas', 'fa-charging-station'], // 電動車充電站
    21: ['fas', 'swimmer'], // 泳池
    22: ['fas', 'fire'], // 烤肉區
    23: ['fas', 'utensils'], // 戶外用餐區
    24: ['fas', 'shower'], // 戶外淋浴空間
    25: ['fas', 'water'], // 湖畔
    26: ['fas', 'umbrella-beach'], // 直達海灘
    27: ['fas', 'kit-medical'], // 急救包
    28: ['fas', 'fire-extinguisher'], // 滅火器
    29: ['fas', 'fa-bell'], // 煙霧警報器
    30: ['fas', 'fa-skull-crossbones'], // 一氧化碳警報器
}
async function callFacilities() {
    try {
        const response = await axiosapi.get("/facility/all")
        facilities.value = response.data.map(facility => ({
            ...facility,
            icon: iconMapping[facility.facilityId] || ['fas', 'question-circle'], // 根據 ID 設置圖標，沒有匹配時設置默認圖標
        }))
    } catch (error) {
        console.error("無法獲取設施數據:", error.message);
    }
}

const selectFacility = (facilityId) => {
    const index = selectedFacility.value.indexOf(facilityId);
    if (index === -1) {
        // 如果該設施未被選中，則添加
        selectedFacility.value.push(facilityId);
    } else {
        // 如果該設施已被選中，則移除
        selectedFacility.value.splice(index, 1);
    }
}

//Regulations
async function callRegulations() {
    try {
        const response = await axiosapi.get("/regulation/all")
        regulations.value = await response.data
    } catch (error) {
        console.log("error", error.message)
    }
}

// previousStep button
    const previousStep=()=>{
        router.push(`/roomCreate/step-three/${roomId}`)
    }

// nextStep button
const nextStep = async () => {
    if (!roomId) {
        console.error("roomId 不存在，請檢查上一步。")
        return
    }
    // 傳送到後端的資料
    const roomData = {
        facilityId: selectedFacility.value,
        regulationId: selectedRegulation.value,
    }

    try {
        // 發送 POST 請求到後端
        await axiosapi.post(`/room/provider/create/step-four/${roomId}`, roomData)
        // 跳轉到step five組件畫面
        router.push({
            path: `/roomCreate/step-five/${roomId}`,
            query: { roomId },
        })
    } catch (error) {
        console.log("error", error.message)
    }
}
</script>
<style>
.label-style{
    font-size: 40px;   /* 調整字體大小 */
    font-weight: bold;
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

.regulation-item {
    font-size: 25px;
    margin-bottom: 1rem;
    /* 調整為所需的行距，例如 1rem、1.5rem 等 */
}

.regulation-item {
    font-size: 25px;
    margin-bottom: 1rem; /* 調整為所需的行距，例如 1rem、1.5rem 等 */
}
 
</style>