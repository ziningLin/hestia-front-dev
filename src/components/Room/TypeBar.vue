<template>

    <div class="d-flex justify-content-between align-items-center">
        <!-- 篩選條件 -->
        <button type="button" class="btn btn-white col-md-1 filter" data-bs-toggle="modal"
            data-bs-target="#exampleModal"><i class="bi bi-sliders"></i>篩選條件</button>
        <!-- 左箭頭 -->
        <button class="btn btn-white arrow" @click="scrollLeft">
            <i class="bi bi-chevron-left"></i>
        </button>
        <!-- 滑動的roomType -->
        <div class="button-container d-flex overflow-auto">
            <button type="button" class="btn btn-white col-md-1 type" @click="handleType()">
                全部
            </button>
            <button v-for="(roomType, index) in roomTypes" :key="index" type="button"
                class="btn btn-white col-md-1 type" @click="handleType(roomType)">
                {{ roomType }}
            </button>
        </div>
        <!-- 右箭頭 -->
        <button class="btn btn-white arrow" @click="scrollRight">
            <i class="bi bi-chevron-right"></i>
        </button>
    </div>

    <!-- 篩選條件視窗 -->
    <div class="modal fade" id="exampleModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-scrollable">
            <div class="modal-content">
                <div class="modal-header d-flex justify-content-between align-items-center">
                    <h5 class="modal-title text-center" id="exampleModalLabel">篩選條件</h5>
                    <button type="button" class="btn-close ms-auto" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>

                <div class="modal-body">
                    <!-- 每晚價格範圍 -->
                    <label class="form-label">每晚價格範圍</label>
                    <div class="range-slider">
                        <div class="slider">
                            <Slider class="slider-blue" v-model="value" :max="30000" :min="0" :format="format"
                                tooltip-position="bottom"></Slider>
                        </div>
                    </div>
                    <div class="d-flex justify-content-between align-items-center">
                        <div class="price">最低金額</div>
                        <div class="price">最高金額</div>
                    </div>
                    <div class="d-flex justify-content-between align-items-center">
                        <div class="price">$<input type="number" v-model="minPrice"
                                @input="updateSliderFromInput"></input></div>
                        <div class="price">$<input type="number" v-model="maxPrice"
                                @input="updateSliderFromInput"></input></div>
                    </div>
                    <hr>
                    <!-- 臥室、床鋪、衛浴 -->
                    <label class="form-label">臥室和床鋪</label>
                    <div class="house-item">
                        <span>臥室</span>
                        <div>
                            <button class="buttonHouse" @click="updateBedroom(-1)"
                                :disabled="totalBedroom === 0">-</button>
                            <span>{{ totalBedroom }}</span>
                            <button class="buttonHouse" @click="updateBedroom(1)">+</button>
                        </div>
                    </div>
                    <div class="house-item">
                        <span>雙人床</span>
                        <div>
                            <button class="buttonHouse" @click="updateDoubleBed(-1)"
                                :disabled="totalDoubleBed === 0">-</button>
                            <span>{{ totalDoubleBed }}</span>
                            <button class="buttonHouse" @click="updateDoubleBed(1)">+</button>
                        </div>
                    </div>
                    <div class="house-item">
                        <span>單人床</span>
                        <div>
                            <button class="buttonHouse" @click="updateSingleBed(-1)"
                                :disabled="totalSingleBed === 0">-</button>
                            <span>{{ totalSingleBed }}</span>
                            <button class="buttonHouse" @click="updateSingleBed(1)">+</button>
                        </div>
                    </div>
                    <div class="house-item">
                        <span>衛浴</span>
                        <div>
                            <button class="buttonHouse" @click="updateBathroom(-1)"
                                :disabled="totalBathroom === 0">-</button>
                            <span>{{ totalBathroom }}</span>
                            <button class="buttonHouse" @click="updateBathroom(1)">+</button>
                        </div>
                    </div>
                    <hr>
                    <!-- 設施 -->
                    <label class="form-label">設施</label>
                    <div>
                        <button v-for="(facility, index) in facilities" :key="index" type="button"
                            :class="['btn', 'btn-white', 'buttonFacility', { selected: selectedFacilities.includes(facility) }]"
                            @click="handleFacility(facility)">
                            {{ facility }}
                        </button>
                    </div>
                </div>

                <div class="modal-footer d-flex justify-content-between align-items-center">
                    <button type="button" class="btn btn-link" @click="clearAllFilters">清除全部</button>
                    <button type="button" class="btn btn-outline-dark" @click="applyFilters"
                        data-bs-dismiss="modal">確定並關閉</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import axiosapi from "@/plugins/axios";
import Slider from '@vueform/slider';

defineProps({
    roomTypes: {
        type: Array,
        required: true,
    },
    facilities: {
        type: Array,
        required: true,
    },
});

const emit = defineEmits(["search", "type", "facility"]);
const handleType = (type) => {
    emit("type", type);
};

const selectedFacilities = ref([]);
const handleFacility = (facility) => {
    // 確保 selectedFacilities 始終是數組
    if (!Array.isArray(selectedFacilities.value)) {
        selectedFacilities.value = [];
    }

    const index = selectedFacilities.value.indexOf(facility);
    if (index > -1) {
        // 如果已選中，則取消選中
        selectedFacilities.value.splice(index, 1);
    } else {
        // 如果未選中，則加入選中列表
        selectedFacilities.value.push(facility);
    }
    // 將當前選中的設施列表傳給父組件
    // emit("facility", selectedFacilities.value);
};

////////// roomType欄位的滑動方式 //////////
const scrollLeft = () => {
    const container = document.querySelector('.button-container');
    container.scrollBy({ left: -300, behavior: 'smooth' });
};
const scrollRight = () => {
    const container = document.querySelector('.button-container');
    container.scrollBy({ left: 300, behavior: 'smooth' });
};

////////// 每晚價格的Slider滑軌 //////////
const value = ref([0, 30000]);// Slider 的值
const format = ref({
    prefix: '$',
    decimals: 0,
    thousand: ',',
});
const minPrice = ref(value.value[0]); // 最低金額
const maxPrice = ref(value.value[1]); // 最高金額

// 監聽 Slider 的值變化
watch(value, (newValue) => {
    minPrice.value = newValue[0];
    maxPrice.value = newValue[1];
});

// 更新滑軌值
const updateSliderFromInput = () => {
    // 限制輸入值在允許範圍內
    minPrice.value = Math.max(0, Math.min(minPrice.value, maxPrice.value));
    maxPrice.value = Math.min(30000, Math.max(maxPrice.value, minPrice.value));

    // 更新滑軌
    value.value = [minPrice.value, maxPrice.value];
};

////////// 臥室和床鋪 //////////
const totalBedroom = ref(0);
const totalDoubleBed = ref(0);
const totalSingleBed = ref(0);
const totalBathroom = ref(0);

const updateBedroom = (amount) => {
    if (totalBedroom.value === null) {
        totalBedroom.value = 0;
    }
    if (totalBedroom.value + amount >= 0) {
        totalBedroom.value += amount;
    }
};

const updateDoubleBed = (amount) => {
    if (totalDoubleBed.value === null) {
        totalDoubleBed.value = 0;
    }
    if (totalDoubleBed.value + amount >= 0) {
        totalDoubleBed.value += amount;
    }
};

const updateSingleBed = (amount) => {
    if (totalSingleBed.value === null) {
        totalSingleBed.value = 0;
    }
    if (totalSingleBed.value + amount >= 0) {
        totalSingleBed.value += amount;
    }
};

const updateBathroom = (amount) => {
    if (totalBathroom.value === null) {
        totalBathroom.value = 0;
    }
    if (totalBathroom.value + amount >= 0) {
        totalBathroom.value += amount;
    }
};

// 確定並關閉按鈕
const applyFilters = async () => {
    try {
        const searchCriteria = new URLSearchParams({
            minPrice: minPrice.value || 0,
            maxPrice: maxPrice.value || 0,
            doubleBed: totalDoubleBed.value || 0,
            singleBed: totalSingleBed.value || 0,
            bedroomCount: totalBedroom.value || 0,
            bathroom: totalBathroom.value || 0,
        });

        if (selectedFacilities.value.length > 0) {
            selectedFacilities.value.forEach(facility => {
                searchCriteria.append('facilityNames', facility);
            });
        }
        const response = await axiosapi.get(`/room/search/filter`, {
            params: searchCriteria,
        });
        // 將搜尋結果傳遞給父組件 Home.vue
        emit("search", response.data);
    } catch (error) {
        console.error('價格房間床鋪衛浴設施篩選失敗:', error);
    }
};

// 清除全部條件
const clearAllFilters = () => {
    value.value = [0, 30000];
    minPrice.value = 0;
    maxPrice.value = 30000;
    totalBedroom.value = 0;
    totalDoubleBed.value = 0;
    totalSingleBed.value = 0;
    totalBathroom.value = 0;
    selectedFacilities.value = [];
};
</script>

<style scoped>
.button-container {
    display: flex;
    overflow-x: auto;
    gap: 10px;
    max-width: 100%;
    scroll-behavior: smooth;
}

.button-container button {
    flex: 0 0 auto;
}

.button-container::-webkit-scrollbar {
    display: none;
}

.arrow:active {
    border: white;
}

.filter {
    border-radius: 0;
    border-right: 1px solid rgb(100, 100, 100);
}

.filter:hover {
    font-weight: bolder;
}

.filter:active {
    border: white;
    border-right: 1px solid rgb(100, 100, 100);
}

.type {
    color: rgb(100, 100, 100);
}

.type:hover {
    color: black;
    font-weight: bolder;
}

.type:active {
    border: white;
}

.modal-title {
    width: 400px;
    margin-left: 40px;
}

.price {
    font-size: 12px;
}

input[type="number"] {
    width: 40px;
    padding: 0;
    border: none;
    background-color: white;
    outline: none;
}

input[type="number"]:hover {
    cursor: pointer;
}

input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
}


.form-label {
    font-weight: bolder;
}

.slider {
    margin: 15px 25px 40px 25px;
}

.slider-blue {
    --slider-connect-bg: #3B82F6;
    --slider-tooltip-bg: #3B82F6;
    --slider-handle-ring-color: #3B82F630;
}

hr {
    margin: 0;
    margin-top: 20px;
    margin-bottom: 20px;
}

.house-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 15px;
}

.house-item:hover {
    cursor: pointer;
}

.buttonHouse {
    width: 30px;
    height: 30px;
    background-color: #fff;
    border: 1px solid black;
    border-radius: 50%;
    cursor: pointer;
    margin: 10px 25px;
}

.buttonHouse:hover {
    background-color: #ddd;
}

.buttonFacility {
    width: auto;
    height: 35px;
    background: #fff;
    border: 1px solid #eee;
    border-radius: 25px;
    cursor: pointer;
    padding: 5px 10px;
    margin: 5px 7px;
    text-align: center;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.buttonFacility:hover {
    font-weight: bolder;
}

.buttonFacility.selected {
    background: rgb(49, 137, 236);
    color: white;
    border: 1px solid rgb(49, 137, 236);
}

.btn-link {
    color: black;
    text-decoration: none;
}

.btn-link:hover {
    color: black;
    text-decoration: underline;
    font-weight: bolder;
}

.btn-link:active {
    color: black;
    font-weight: bolder;
}

.btn-outline-dark {
    margin-right: 17px;
}
</style>