<template>
    <div>
        <SearchBar @search="handleSearch" :cities="cities">
        </SearchBar>
    </div>
    <hr>
    <div>
        <TypeBar @search="handleFilter" :roomTypes="roomTypes" @type="filterRoomsByType" :facilities="facilities">
        </TypeBar>
        <!-- @facility="updateSelectedFacilities" -->
    </div>
    <hr>
    <RoomCard :rooms="filteredRooms">{{ searchResult }}</RoomCard>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import RoomCard from "@/components/room/RoomCard.vue";
import SearchBar from "@/components/room/SearchBar.vue";
import TypeBar from "@/components/room/TypeBar.vue";
import axiosapi from "@/plugins/axios";
import { useRoute } from 'vue-router';
import Swal from "sweetalert2";

const route = useRoute();
const parseSearchResult = async () => {
    const searchResult = route.query.searchResult;
    if (searchResult) {
        try {
            const processedRooms = await processRooms(JSON.parse(searchResult));
            filteredRooms.value = processedRooms;
        } catch (error) {
            console.error("解析搜索结果失败：", error);
            filteredRooms.value = [];
        }
    }
};
// 當路由變化時，重新解析
watch(() => route, parseSearchResult);

const rooms = ref([]);// 所有房間數據
const filteredBySearchRooms = ref([]);// 根據Search篩選後的房間數據
const filteredRooms = ref([]);// 最終房間數據
const cities = ref([]);// 縣市地區數據
const roomTypes = ref([]);// 房間類型數據
const facilities = ref([]);// 設施數據
const selectedFilters = ref({ roomType: "全部", filterResult: null, }); // 儲存篩選條件

// 初始化數據
onMounted(async () => {
    Swal.fire({
        title: "Loading...",
        text: "Please Wait",
        allowOutsideClick: false, // 禁止点击外部关闭弹窗
        didOpen: () => {
            Swal.showLoading(); // 显示加载动画
        }
    });
    try {
        // 獲取所有縣市地區
        const cityResponse = await axiosapi.get(`/city/names`);
        cities.value = cityResponse.data;

        // 獲取所有房間類型
        const typeResponse = await axiosapi.get(`/room-type/names`);
        roomTypes.value = typeResponse.data;

        // 獲取所有設施
        const facilityResponse = await axiosapi.get(`/facility/names`);
        facilities.value = facilityResponse.data;

        // 獲取所有房間資訊
        const roomResponse = await axiosapi.get(`/room`);
        rooms.value = await processRooms(roomResponse.data);

        filteredBySearchRooms.value = rooms.value;
        filteredRooms.value = rooms.value; // 預設顯示所有房間
        selectedFilters.value.roomType = "全部";
        selectedFilters.value.filterResult = rooms.value;
        parseSearchResult();

    } catch (error) {
        console.error("初始化數據失敗：", error);
        Swal.fire({
            icon: "error",
            title: "失敗",
            text: "請檢查網絡或稍後重試",
        });
    } finally {
        Swal.close(); // 关闭加载视窗
    }
});

// 根據多個設施篩選
// const updateSelectedFacilities = (facilityName) => {
//     console.log("facilityName:", facilityName)
//     filteredRooms.value = facilityName === null || facilityName.length === 0
//         ? filteredBySearchRooms.value  // 如果未選擇設施，則返回所有房間
//         : filteredBySearchRooms.value.filter((room) =>
//             facilityName.every((name) =>
//                 room.roomFacility.some(
//                     (facility) => facility.facility.facilityName.includes(name)
//                 ))
//         );
//     console.log("filteredRooms.value:", filteredRooms.value)
// };

// 按篩選條件應用篩選邏輯
const applyFilters = () => {
    const { roomType, filterResult } = selectedFilters.value;
    // 1. 根據房間類型篩選
    let result =
        roomType === "全部"
            ? filteredBySearchRooms.value
            : filteredBySearchRooms.value.filter((room) => room.roomTypeName === roomType);

    // 2. 根據其他條件進一步篩選
    result = result.filter((room) =>
        filterResult.some((filterRoom) => filterRoom.roomId === room.roomId)
    );

    // 更新最終篩選結果
    filteredRooms.value = result;
};

// 根據房間類型篩選(第二順序)
const filterRoomsByType = (roomType) => {
    if (!roomType) {
        selectedFilters.value.roomType = "全部";
        applyFilters();
    }
    else {
        selectedFilters.value.roomType = roomType;
        applyFilters();
    }
};

// 根據篩選结果(價格/臥室床鋪衛浴/設施)篩選(第二順序)
const handleFilter = (filterResult) => {
    Swal.fire({
        title: "Loading...",
        text: "Please Wait",
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });
    selectedFilters.value.filterResult = filterResult;
    applyFilters();
    setTimeout(() => {
    Swal.close();
    }, 500);
};

// 根據搜尋结果(地點/日期/人數)篩選(第一順序)
const handleSearch = async (searchResult) => {
    Swal.fire({
        title: "Loading...",
        text: "Please Wait",
        allowOutsideClick: false, // 禁止点击外部关闭弹窗
        didOpen: () => {
            Swal.showLoading(); // 显示加载动画
        }
    });
    try {
        const processedRooms = await processRooms(searchResult);
        rooms.value = processedRooms;
        filteredBySearchRooms.value = processedRooms;
        filteredRooms.value = processedRooms;
        // 重置篩選條件
        selectedFilters.value.roomType = "全部";
        selectedFilters.value.filterResult = processedRooms;
    } catch (error) {
        console.error("處理搜尋結果失敗：", error);
        rooms.value = [];
        filteredBySearchRooms.value = [];
        filteredRooms.value = [];
        Swal.fire({
            icon: "error",
            title: "加载失敗",
            text: "請檢查網絡或稍後重試",
        });
    } finally {
        Swal.close(); // 关闭加载视窗
    }
};

// 處理房間的圖片和價格
const processRooms = async (roomData) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const processedRooms = await Promise.all(
        roomData.map(async (room) => {
            // 獲取房間照片
            try {
                const imageResponse = await axiosapi.get(`/room-images/${room.roomId}`);
                room.images = imageResponse.data || [];
            } catch (error) {
                console.error(`獲取房間 ${room.roomId} 的照片失敗：`, error);
                room.images = [];
            }

            // 獲取房間最接近今日的價格
            try {
                const dateResponse = await axiosapi.get(`/room-available-date/dates&prices/${room.roomId}`);
                const availableDates = dateResponse.data;

                // 篩選日期並找到最近日期的價格
                const filteredDates = availableDates
                    .map(([date, price]) => ({ date: new Date(date), price }))
                    .filter((item) => item.date >= today);

                room.closestPrice = filteredDates.length
                    ? filteredDates.reduce((prev, curr) => (prev.date < curr.date ? prev : curr)).price
                    : null;
            } catch (error) {
                console.error(`獲取房間 ${room.roomId} 的價格失敗：`, error);
                room.closestPrice = null;
            }

            return room;
        })
    );

    return processedRooms;
};
</script>

<style scoped>
hr {
    margin: 10px;
}
</style>