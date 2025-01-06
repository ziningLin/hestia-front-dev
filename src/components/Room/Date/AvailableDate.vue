<template>
    <div class="container">
        <div class="row">
            <div class="col-9">
                <!-- Select Room -->
                    <div class="dropdown space-control select-container">
                        <button class="btn btn-secondary dropdown-toggle btn-lg" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                            {{ selectedRoomName || '選擇房源' }}
                        </button>
                        <ul class="dropdown-menu">
                            <li v-if="rooms.length === 0">無可用房源</li>
                            <li v-for="room in rooms" :key="room.roomId">
                                <a class="dropdown-item" @click="selectRoom(room)">{{ room.roomName }}</a>
                            </li>
                        </ul>
                    </div>
                <!-- Calendar -->
                    <div class="cal-container">
                        <vue-cal
                        hide-view-selector
                        :disable-views="['years','year', 'week', 'day']"
                        is-range
                        :time="false"
                        @cell-click="onDateSelect"
                        :attributes="toRaw(highlightedDates.value)"
                        />
                    </div>
            </div>
            <!-- Setting -->
            <div class="col set-container">
                <div style="margin-bottom: 20px;">
                    <h2 style="font-weight: bold;">設定</h2>
                </div>
                <!-- Price -->
                    <div class="space-control">
                        <!-- 基本價格：套用所有日期  -->
                         <div class="price-control">
                            <div>
                                <div class="space-control">
                                    <h3 style="font-weight: bold;font-size: 35px">先設定基本價格</h3>
                                    <label for="price-input" class="form-label label-style">價格</label>
                                    <input v-model="normalPrice" id="price-input" type="number" placeholder="輸入價格" class="form-control form-control-lg" />
                                </div>
                                <!-- 其它設定 -->
                                    <!-- <div class="space-control">
                                        <label for="latest-booking-input" class="form-label label-style">房客最後可訂日期</label>
                                        <input v-model="latestBook" id="latest-booking-input" type="date" class="form-control form-control-lg" />
                                    </div> -->
                                    <div class="space-control">
                                        <label for="release-date-input" class="form-label label-style">上架時間</label>
                                        <input v-model="releaseDate" id="release-date-input" type="date" :min="today"  placeholder="" class="form-control form-control-lg" />
                                    </div>
                                    <div class="space-control">
                                        <label for="sum-input" class="form-label label-style">數量</label>
                                        <input v-model="newSum" id="sum-input" type="number" class="form-control form-control-lg" />
                            </div>

                                </div>
                                <div class="space-control">
                                    <button @click="setNormalPrice" class="btn btn-dark btn-lg" >設定</button>
                                </div>
                                <div class="space-control">
                                    <button @click="oneDatePrice" class="btn btn-primary btn-lg">修改特定日期價格</button>
                                </div> 
                        </div>
                    </div>
            </div>
        </div>
    </div>   
        
</template>
    
<script setup>
import { ref,onMounted,toRaw,watch } from 'vue';
import axiosapi from "@/plugins/axios";
import { useRoute,useRouter } from 'vue-router';
import VueCal from 'vue-cal';
import 'vue-cal/dist/vuecal.css';
import Swal from 'sweetalert2';
import dayjs from 'dayjs';
import Room from '../../../views/Room.vue';
import { useUserProfileStore } from '../../../stores/userProfile.js';

// define
const router =useRouter()
const route =useRoute()
const roomId = route.params.roomId
const userProfileStore = useUserProfileStore();
const rooms=ref([])
const selectedRoom=ref("")
const latestBook=ref("")
const releaseDate=ref("")
const newSum=ref("")
const selectedRoomName=ref("")

const highlightedDates = ref([])

// define date and price
const selectedDates=ref([])
const normalPrice = ref(""); // 基本價格
const availableDates = ref([]); // 確保是響應式數據
const latestBookingDates = ref([]); // 定義 latestBookingDates
const today = dayjs().format("YYYY-MM-DD"); // 取得今天的日期，格式化為 YYYY-MM-DD


onMounted(() => {
    fetchRooms()
})

// roomlist
    const fetchRooms = async () => {
        // const providerId = router.currentRoute.value.params.providerId;
    try {
        
        const response = await axiosapi.get(`/room/provider/findProviderRoomsByState/${userProfileStore.providerId}`)
        if (response.data.success) {
        rooms.value = response.data.data
        } else {
            rooms.value = []
            Swal.fire('錯誤', response.data.message, 'error')
        }
    } catch (error) {
        rooms.value = []
        Swal.fire('錯誤', '無法載入房源資料', 'error')
    }
    }

// selectedRoom
const selectRoom = (room) => {
    selectedRoomName.value = room.roomName // 更新按鈕顯示名稱
    selectedRoom.value = room // 保存選中的房源

    // 調用 basicDate 方法並傳入 roomId
    basicDate(room.roomId)
}

// 獲取資料
    const basicDate = async (id) => {
        const targetRoomId = id // 接收選中的 roomId
        if (!targetRoomId) {
            console.error("roomId 未定義，請選擇房源後再調用 basicDate")
            return
        }

        try {
            const response = await axiosapi.post(`/room-available-date/provider/findByRoom/${targetRoomId}`)
            console.log("後端返回的日曆數據:", response.data)

            if (response.data && response.data.data && response.data.data.length > 0) {

                // 格式化資料，展開 availableDates 陣列並設置價格
                    // 使用 flatMap 遍歷每個資料項的 availableDates 陣列，並為每個日期附上 price，形成 highlightedDates 正確的格式。
                    highlightedDates.value = response.data.data.flatMap(item =>
                        item.availableDates.map(date => ({
                            dates: `${item.startDate} ~ ${item.endDate}`, // 用日期范围代替逐个日期
                            popover: { label: `價格：${item.price}` },
                            class: 'price-highlight'
                        }))
                    )
            } else {
                highlightedDates.value = []
                console.warn("後端數據為空或未找到")
            }

            console.log("highlightedDates 更新成功:", highlightedDates.value)
        } catch (error) {
            console.error("無法獲取房源日曆：", error)
        }
    }

// onDateSelect
    const onDateSelect = (day) => {
    const clickedDate = day.toISOString().split('T')[0] // 格式化日期

    // 從 highlightedDates 中查找價格
        const foundDate = highlightedDates.value.find((item) => item.dates === clickedDate)
        const price = foundDate ? foundDate.popover.label.replace('價格：', '') : '未設定'
    
    // 檢查 selectedDates 是否已經包含該日期
        const existingIndex = selectedDates.value.findIndex((item) => item.date === clickedDate)

    if (existingIndex === -1) {
        selectedDates.value.push({ date: clickedDate, price })
    } else {
        selectedDates.value.splice(existingIndex, 1)
    }
    console.log("選中的日期與價格:", selectedDates.value)
}


// 基本價格：套用所有日期
    const generateAllDates = (startDate, endDate) => {
        const dates = [];
        let currentDate = dayjs(startDate)
        const lastDate = dayjs(endDate)

        while (!currentDate.isAfter(lastDate)) {
            dates.push(currentDate.format('YYYY-MM-DD')) // 格式化日期
            currentDate = currentDate.add(1, 'day') // 增加一天
        }
        return dates
    }

// 計算後的最後可訂日期
    // 計算 latestBookingDate，將 availableDates 的每個日期減一天
        latestBookingDates.value = availableDates.value.map(date => 
            dayjs(date).subtract(1, 'day').format('YYYY-MM-DD')
        )

// 檢查 room 是否已經新增過價格
    const checkExistingPrice = async () => {
            try {
                const response = await axiosapi.post(`room-available-date/provider/findRoomByAvailableDate/${selectedRoom.value.roomId}`);
                console.log(response.data)
                return response.data; // 後端返回是否存在的布林值
                
            } catch (error) {
                console.error('Error checking existing price:', error.message);
                Swal.fire('錯誤', '檢查價格失敗', 'error');
                return false;
            }
        }

    const setNormalPrice= async () => {
        if (!selectedRoom.value) {
                Swal.fire('錯誤', '請先選擇房源', 'error')
                return
            }
        if (!normalPrice.value || normalPrice.value <= 0) {
            Swal.fire('錯誤', '請輸入有效的基本價格', 'error')
            return
        }
        if (!releaseDate.value) {
            Swal.fire('錯誤', '請選擇上架時間', 'error');
            return;
        }
        if (!newSum.value || newSum.value <= 0) {
            Swal.fire('錯誤', '請輸入有效的房間數量', 'error');
            return;
        }

        // 動態計算日期範圍：startDate 為當天，endDate 為一個月後
            const startDate = dayjs().format('YYYY-MM-DD');
            const endDate = dayjs().add(1, 'month').format('YYYY-MM-DD');

        // 使用 generateAllDates 生成 availableDates
            availableDates.value = generateAllDates(startDate, endDate);

        // 計算 latestBookingDates
            latestBookingDates.value = availableDates.value.map(date =>
                dayjs(date).subtract(1, 'day').format('YYYY-MM-DD')
            );

        // 傳送到後端的資料
            const roomData={
                roomId: selectedRoom.value.roomId,
                availableDates: availableDates.value,
                price:normalPrice.value ,
                roomSum:newSum.value,
                latestBookingDate: latestBookingDates.value, // 確保與 availableDates 一一對應 
                releaseDate:releaseDate.value,
                stateId:22,
        }
        console.log("請求數據"+roomData)

        try {
            const exists = await checkExistingPrice();
            if (exists) {
                // 如果已經存在，調用修改方法
                console.log('修改請求數據:', roomData);
                    await axiosapi.put(`room-available-date/provider/modifyAllDates/${selectedRoom.value.roomId}`, roomData,{timeout:20000})
                    Swal.fire('成功', '基本價格已更新', 'success');
            }else{
                // 如果不存在，調用新增方法
                    await axiosapi.post('/room-available-date/provider/insert', roomData);
                    Swal.fire('成功', '基本價格已新增', 'success')
            }
        } catch (error) {
            Swal.fire('錯誤', '操作失敗', 'error');
            console.error('Error:', error.message);
        }
    }

// oneDatePrice button：
    const oneDatePrice=()=>{
            router.push({path:"/roomCreate/each-available-date",})
    }

</script>
    
<style scoped>
.space-control{
    margin-bottom: 40px; /* 每個區塊之間增加間距 */
}
.label-style{
    font-size: 25px;   /* 調整字體大小 */
}
.price-control{
    border: 1px solid #E0E0E0;
    border-radius: 15px;
    padding: 10px;
    width: 100%;
    height: 100%;
}

.dropdown-item{
    cursor: pointer;
}
.edit-price-control{
    background-color: #E0E0E0;
    border-radius: 15px;
    padding: 10px;
    margin-top: 40px; /* 每個區塊之間增加間距 */
}
.select-container{
    display: flex;
    justify-content: flex-end;
}
.vuecal__header{
    font-size:15px;
}

.cal-container{
    width:100%;
    height:90%;
    font-size:25px;
    font:bold;
}
.set-container{
    margin-left: 15px;

}
:deep(.vuecal__cell.highlighted-date){
    border:2px solid black;
  background-color: black;
  color:red;
}
h2{
    font-size: 50px;
    font:800;
}
    
</style>