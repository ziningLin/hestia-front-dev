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
                        :attributes=highlightedDates.value
                        />
                    </div>
            </div>
            <!-- Setting -->
            <div class="col set-container">
                <div class="space-control">
                    <h2 style="font-weight: bold;">設定</h2>
                </div>
                <!-- Price -->
                    <!-- 以 day 為單位作價格更改 -->   
                    <div class="price-control">
                        <div>
                            <h3 style="font-weight: bold;font-size: 35px">修改價格</h3>
                            <h4>選擇日期</h4>
                            <ul>
                                <li v-for="item in selectedDates" :key="item.date">
                                    {{ item.date }}   ${{ item.price }}<br>
                                    數量：{{ item.roomSum }} <br>
                                    最後可訂時間：{{ item.latestBookingDate }} <br>
                                    上架時間：{{ item.releaseDate }}<br>
                                </li>
                            </ul>
                            </div>
                            <div class="space-control">
                                <label for="price-input" class="form-label label-style">價格</label>
                                <input v-model="newPrice" id="price-input" type="number" placeholder="輸入價格" class="form-control form-control-lg" />   
                            </div>
                        <!-- 其它設定 -->
                            <div class="space-control">
                                <label for="latest-booking-input" class="form-label label-style">房客最後可訂日期</label>
                                <input v-model="latestBook" :min="today" id="latest-booking-input" type="date" class="form-control form-control-lg" />
                            </div>
                            <div class="space-control">
                                <label for="release-date-input" class="form-label label-style">上架時間</label>
                                <input v-model="releaseDate" :min="today" id="release-date-input" type="date" placeholder="" class="form-control form-control-lg" />
                            </div>
                            <div class="space-control">
                                <label for="sum-input" class="form-label label-style">數量</label>
                                <input v-model="newSum" id="sum-input" type="number" class="form-control form-control-lg" />
                            </div>
                            <div class="space-control">
                                <button @click="nextStep" class="btn btn-dark btn-lg" >更新</button>
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
const newPrice=ref("") // 單獨日期價格
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
                            dates: date, // 每個日期
                            price: item.price, // 價格
                            roomSum: item.roomSum, // 房間數量
                            latestBookingDate: item.latestBookingDate, // 最後可訂日期
                            releaseDate: item.releaseDate, // 上架時間
                            popover: { label: `價格：${item.price}` }, // 彈出顯示的價格
                            class: 'price-highlight' // 樣式
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
        const roomSum = foundDate ? foundDate.roomSum : '未設定';
        const latestBookingDate = foundDate ? foundDate.latestBookingDate : '未設定';
        const releaseDate = foundDate ? foundDate.releaseDate : '未設定';
    
    // 檢查 selectedDates 是否已經包含該日期
        const existingIndex = selectedDates.value.findIndex((item) => item.date === clickedDate)

        if (existingIndex === -1) {
        selectedDates.value.push({
            date: clickedDate,
            price,
            roomSum,
            latestBookingDate,
            releaseDate,
        })

        // 更新 highlightedDates，添加選中樣式
        highlightedDates.value.push({
            dates: clickedDate,
            class: 'selected-date', // 添加選中樣式
        })
    } else {
        selectedDates.value.splice(existingIndex, 1)
        // 移除 highlightedDates 中的選中樣式
        const index = highlightedDates.value.findIndex((item) => item.dates === clickedDate && item.class === 'selected-date');
        if (index !== -1) {
            highlightedDates.value.splice(index, 1);
    }
}}

// nextStep button :單個日期價格更新
    const nextStep=async()=>{
        if (!selectedRoom.value) {
            Swal.fire('錯誤', '請先選擇房源', 'error')
            return
        }
        if (!newPrice.value || newPrice.value <= 0) {
            Swal.fire('錯誤', '請輸入有效的價格', 'error')
            return
        }
        if (selectedDates.value.length === 0) {
            Swal.fire('錯誤', '請先選擇日期', 'error')
            return
        }
        if (!latestBook.value) {
            Swal.fire('錯誤', '請選擇最後可訂日期', 'error');
            return;
        }

        if (!releaseDate.value) {
            Swal.fire('錯誤', '請選擇上架時間', 'error');
            return;
        }
        if (!newSum.value || newSum.value <= 0) {
            Swal.fire('錯誤', '請輸入有效的房間數量', 'error');
            return;
        }

        // 傳送到後端的資料
            const roomData = {
                roomId: selectedRoom.value.roomId,
                availableDates: selectedDates.value.map(item => item.date), 
                price: newPrice.value,
                roomSum:newSum.value,
                latestBookingDate:latestBook.value,
                releaseDate:releaseDate.value,
                stateId:22,
            }
            const date=selectedDates.value.map(item => item.date)
            console.log("傳送1111111"+date)

        try{
            // 發送 PUT 請求到後端
                const response=await axiosapi.put(`room-available-date/provider/modify/${selectedRoom.value.roomId}`,roomData,{timeout:10000})
                console.log("後端響應結果:", response.data);
                Swal.fire('成功', '更新成功', 'success');
            // 更新成功後重新獲取資料
            basicDate(selectedRoom.value.roomId);
                // 
                router.push({
                    path:`/roomCreate/each-available-date`,
                    query: { roomId },
                })
        }catch(error){
            Swal.fire('錯誤', '更新失敗', 'error');
            console.log("error",error.message)
        }
    }  
    
</script>
    
<style>
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