<template>
    <div class="d-flex justify-content-center align-items-center" @mousedown="handleOutsideClick">
        <form class="search-bar row align-items-center p-2 rounded-pill" @submit.prevent="searchRooms">
            <!-- 地點 -->
            <div class="col-md-3">
                <button class="form-control" type="button" data-bs-toggle="collapse" data-bs-target="#collapseExample1"
                    aria-expanded="false" aria-controls="collapseExample1" style="text-align: left;">
                    <label for="location" class="form-label">地點</label>
                    <input type="search" class="form-control" id="location" v-model="searchCriteriaStore.location"
                        placeholder="搜尋住宿">
                </button>
            </div>

            <!-- 入住日期 -->
            <div class="col-md-3">
                <label for="check_in_date" class="form-label">入住</label>
                <!-- <input type="date" id="check_in_date" class="form-control" :min="minDate" v-model="checkInDate"
                    @change="onCheckInDateChange" placeholder="選擇日期" /> -->
                <div>
                    <date-picker v-model:value="searchCriteriaStore.checkInDate" value-type="format" format="YYYY-MM-DD"
                        :disabled-date="disabledCheckInDate" placeholder="選擇日期"></date-picker>
                </div>
            </div>

            <!-- 退房日期 -->
            <div class="col-md-3">
                <label for="check_out_date" class="form-label">退房</label>
                <!-- <input type="date" id="check_out_date" class="form-control" :min="checkOutMinDate"
                    v-model="checkOutDate" placeholder="選擇日期" /> -->
                <div>
                    <date-picker v-model:value="searchCriteriaStore.checkOutDate" value-type="format"
                        format="YYYY-MM-DD" :disabled-date="disabledCheckOutDate" placeholder="選擇日期"></date-picker>
                </div>
            </div>

            <!-- 旅客人數 -->
            <div class="col-md-2">
                <button class="form-control" type="button" data-bs-toggle="collapse" data-bs-target="#collapseExample2"
                    aria-expanded="false" aria-controls="collapseExample2" style="text-align: left;">
                    <label for="guests" class="form-label">旅客</label>
                    <input type="text" class="form-control" placeholder="新增人數" v-model="guests" readonly></input>
                </button>
            </div>

            <!-- 搜尋按鈕 -->
            <div class="col-md-1">
                <button type="submit" class="btn btn-white rounded-circle">
                    <i class="bi bi-search"></i>
                </button>
            </div>
        </form>
    </div>
    <!-- 縣市地區下拉視窗 -->
    <div class="collapse dropdownLocation" id="collapseExample1">
        <div class="location-item">
            <div style="margin: 5px 15px; font-weight: bolder;">地區搜尋</div>
            <div>
                <button v-for="(city, index) in cities" :key="index" type="button" class="btn btn-white buttonLocation"
                    @click="handleList(city)">
                    {{ city }}
                </button>
            </div>
        </div>
    </div>
    <!-- 旅客人數下拉視窗 -->
    <div class="collapse dropdownGuest" id="collapseExample2">
        <div class="guest-item">
            <span>人數</span>
            <button class="buttonGuest" @click="searchCriteriaStore.updateGuests(-1)"
                :disabled="searchCriteriaStore.totalGuests === 0">-</button>
            <span>{{ searchCriteriaStore.totalGuests }}</span>
            <button class="buttonGuest" @click="searchCriteriaStore.updateGuests(1)">+</button>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useSearchCriteriaStore } from "../../stores/searchCriteria.js";
import axiosapi from "@/plugins/axios";
import DatePicker from "vue-datepicker-next";
import "vue-datepicker-next/index.css";
import 'vue-datepicker-next/locale/zh-tw.js';

defineProps({
    cities: {
        type: Array,
        required: true,
    },
    searchCriteria: {
        type: Object,
        required: false,
    },
});

const emit = defineEmits(["search", "list"]);

////////// 縣市地區欄位 /////////
const location = ref(null);

const handleList = (city) => {
    location.value = city;
    searchCriteriaStore.location = city;
    // emit("list", city);
    // 自動收起下拉菜單
    const collapseElement = document.getElementById("collapseExample1");
    if (collapseElement) {
        collapseElement.classList.remove("show");
    }
};

////////// 入住日期 ＆ 退房日期欄位 //////////
const checkInDate = ref(null);
const checkOutDate = ref(null);

const disabledCheckInDate = (date) => {
    const newDate = new Date(date);
    const today = new Date();
    // 將時間部份清零，確保只比較日期
    today.setHours(0, 0, 0, 0);
    newDate.setHours(0, 0, 0, 0);
    // 禁用今天以前的日期
    if (newDate < today) {
        return true;
    }
    // 如果退房日期早於入住日期，清空退房日期
    if (searchCriteriaStore.checkOutDate && searchCriteriaStore.checkOutDate < searchCriteriaStore.checkInDate) {
        searchCriteriaStore.checkOutDate = '';
    }
    return false; // 如果日期有效，返回 false
};

const disabledCheckOutDate = (date) => {
    const newDate = new Date(date);
    const today = new Date();
    // 將時間部份清零，確保只比較日期
    today.setHours(0, 0, 0, 0);
    newDate.setHours(0, 0, 0, 0);
    // 禁用今天以前的日期
    if (newDate < today) {
        return true;
    }
    const dateString = date.toISOString().split('T')[0];
    const checkInDateString = new Date(searchCriteriaStore.checkInDate).toISOString().split('T')[0];
    // 禁用早於入住日期的日期
    if (dateString < checkInDateString) {
        return true;
    }
    return false;
};


////////// 旅客人數欄位 //////////
const totalGuests = ref(0);

const guests = computed(() => {
    if (searchCriteriaStore.totalGuests === null || searchCriteriaStore.totalGuests === 0) {
        return "";
    }
    return searchCriteriaStore.totalGuests;
});

const updateGuests = (amount) => {
    if (totalGuests.value === null) {
        totalGuests.value = 0;
    }
    if (totalGuests.value + amount >= 0) {
        totalGuests.value += amount;
        searchCriteriaStore.totalGuests = totalGuests.value;
    }
};

////////// 搜尋條件按鈕 //////////
const searchCriteriaStore = useSearchCriteriaStore();
const searchRooms = async () => {
    try {
        const criteria = searchCriteriaStore.searchCriteria();
        const isEmptySearch =
            !criteria.keyword &&
            !criteria.roomSize &&
            !criteria.checkinDate &&
            !criteria.checkoutDate;

        const endpoint = isEmptySearch
            ? "/room"
            : "/room/search/search-bar";

        const response = await axiosapi.get(endpoint, {
            params: isEmptySearch ? {} : criteria,
        });

        // 將搜尋結果傳遞給父組件 Home.vue
        emit("search", response.data);
        console.log("地點日期人數查詢結果：", response.data);
    } catch (error) {
        console.error("地點日期人數查詢失敗：", error);
    }
};

///// 點擊事件，判斷是否點擊了下拉菜單外部區域 /////
const handleOutsideClick = (event) => {
    const collapseLocation = document.getElementById("collapseExample1");
    const collapseGuest = document.getElementById("collapseExample2");

    // 如果點擊的區域不是下拉菜單及其按鈕，收起下拉菜單
    if (
        collapseLocation &&
        !collapseLocation.contains(event.target) &&
        !event.target.closest("[data-bs-target='#collapseExample1']")
    ) {
        collapseLocation.classList.remove("show");
    }

    if (
        collapseGuest &&
        !collapseGuest.contains(event.target) &&
        !event.target.closest("[data-bs-target='#collapseExample2']")
    ) {
        collapseGuest.classList.remove("show");
    }
};
</script>

<style scoped>
.search-bar {
    border: 1px solid rgb(209, 209, 209);
    margin-top: 10px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.form-label {
    margin: 0;
    padding: 0;
    font-size: 12px;
}

.form-label:hover {
    cursor: pointer;
}

.form-control {
    border: 0;
    box-shadow: none;
    margin: 0;
    padding: 0;
    font-size: 14px;
}

.form-control:focus {
    border-color: #fff;
    box-shadow: none;
}

.dropdownLocation {
    position: absolute;
    left: 22%;
    z-index: 1050;
    width: 580px;
    height: auto;
    border-radius: 20px;
    background: white;
    padding: 15px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.dropdownGuest {
    position: absolute;
    left: 58%;
    z-index: 1050;
    width: 200px;
    border-radius: 10px;
    background: white;
    padding: 15px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.location-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;

}

.guest-item {
    width: 170px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.buttonLocation {
    width: 90px;
    height: 35px;
    background: #fff;
    border: 1px solid #ddd;
    border-radius: 20px;
    cursor: pointer;
    padding: 5px 10px;
    margin: 10px;
    text-align: center;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.buttonLocation:hover {
    font-weight: bolder;
}

.buttonGuest {
    width: 30px;
    height: 30px;
    background: #ddd;
    border: none;
    border-radius: 50%;
    cursor: pointer;
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
</style>
