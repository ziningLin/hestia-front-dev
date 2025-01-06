<template>
    <!-- Title -->
    <div>
        <h1>你的房源</h1>
    </div>
    <!-- Function -->
    <div class="btn-div space-control">
        <!-- 搜尋輸入框 -->
            <div class="input-group">
                <input 
                    type="text" 
                    class="form-control" 
                    placeholder="請輸入房源名稱查詢" 
                    v-model="searchQuery" 
                    @keyup.enter="search" 
                />
                <button @click="search" class="btn btn-outline-secondary">
                    <font-awesome-icon icon="fas fa-search" />
                </button>
            </div>
        <div>
        <button @click="openDate" type="button" class="btn btn-outline-secondary">
            日曆
        </button>
        </div>

        <div>
        <button @click="createOneRoom" type="button" class="btn btn-outline-secondary">
            新增
        </button>
        </div>
    </div>

    <!-- RoomList -->
        <!-- 搜尋結果 -->
            <div v-if="searched.length" class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>房源</th>
                            <th>位置</th>
                            <th>狀態</th>
                            <th>上架</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="room in searched" :key="room.roomId">
                            <td> 
                                <button @click="modifyRoom(room.roomId)" class="btn btn-light btn-title">
                                    <img 
                                        :src="`data:image/jpeg;base64,${room.mainImage}`" 
                                        alt="房間圖片" 
                                        style="width: 80px; height: 80px; object-fit: cover; border-radius: 5px;margin-right: 10px;"
                                    />
                                    <span> {{ room.roomName }}</span>
                                </button>  
                            </td>
                            <td>{{ room.roomAddr }}</td>
                            <td :class="stateColorMapping[room.state.stateId] || 'text-muted'" style="font-weight: bold;">
                                {{ stateMapping[room.state.stateId] || "未知狀態" }} 
                            </td>
                            <td>
                                <button v-if="roomAvailableDate.get(room.roomId)!=0 && room.state.stateId!=22" @click = publish(room.roomId) class="btn btn-dark">上架</button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        <!-- 未搜尋時的 Room List -->
            <div v-else class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>房源</th>
                            <th>位置</th>
                            <th>狀態</th>
                            <th>上架</th>
                        </tr>
                    </thead>
                    <tbody>        
                        <tr v-for="room in rooms" :key="room.roomId">
                            <td> 
                                <button @click="modifyRoom(room.roomId)" class="btn btn-light btn-title">
                                    <img 
                                        :src="`data:image/jpeg;base64,${room.mainImage}`" 
                                        alt="房間圖片" 
                                        style="width: 80px; height: 80px; object-fit: cover; border-radius: 5px;margin-right: 10px;"
                                    />
                                    <span> {{ room.roomName }}</span>
                                </button>  
                            </td>
                            <td>{{ room.roomAddr }}</td>
                            <td :class="stateColorMapping[room.stateId] || 'text-muted'" style="font-weight: bold;">
                                {{ stateMapping[room.stateId] || "未知狀態" }} 
                            </td>
                            <td>
                                <button v-if="roomAvailableDate.get(room.roomId)!=0 && room.stateId!='22'" @click = publish(room.roomId) class="btn btn-dark">上架</button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>    
</template>
    
<script setup>
import { ref,onMounted } from 'vue';
import axiosapi from "@/plugins/axios";
import { useRouter } from 'vue-router';
import Swal from 'sweetalert2';
import { useUserProfileStore } from '../../stores/userProfile.js';

// define
const router =useRouter()
const rooms = ref([])
const roomAvailableDate=ref(new Map())
const searchQuery = ref(""); // 綁定輸入框內容
const searched = ref([]); // 用於存儲查詢結果

async function publish(roomId){
    try {
        console.log("roomId"+roomId)
        const response = await axiosapi.get(`/room/provider/publish/${roomId}`)
    fetchRooms();
    } catch (error) {
        console.log(error)
    }
}

const userProfileStore = useUserProfileStore()
const stateMapping = {
    20:"未審核",
    21:"審核通過",
    22:"已上架",
    23:"下架",
    24:"暫時下架",
    26:"售完"
}
const stateColorMapping = {
    20: "text-secondary",    
    21: "text-success",   
    22: "text-primary", 
    23:"text-danger",  
    24: "text-danger",   
    26: "text-warning",    
};

onMounted(async() => {
    await fetchRooms()
    getAvailableDate()
})

const getAvailableDate=async()=>{
    // console.log(rooms.value)
    for( let room of rooms.value){
        try {
            const response = await axiosapi.get(`/room-available-date/dates&prices/${room.roomId}`)
            console.log(response)
            if (response.data) {
                // roomAvailableDate.value = response.data.data
                roomAvailableDate.value.set(room.roomId, response.data.length)
            } else {
                rooms.value = []
            }
        } catch (error) {
            rooms.value = []
        }
    }
    console.log(roomAvailableDate.value)
}

// roomlist
    const fetchRooms = async () => {
    //   const providerId = router.currentRoute.providerId
    try {
        const response = await axiosapi.get(`/room/provider/findByProvider/${userProfileStore.providerId}`)
        if (response.data.success) {
        rooms.value = response.data.data
        console.log(rooms.value)
        } else {
            rooms.value = []
            Swal.fire({
                title: "目前無房源資料",
                icon: "warning"
            })
        }
    } catch (error) {
        rooms.value = []
        console.log("無法載入房源資料")
    }
    }

// search
    const search=async()=>{
        if (!searchQuery.value.trim()) {
            console.log("請輸入查詢內容");
            Swal.fire("提示", "請輸入查詢內容", "info");
            return;
        }
        try{
            const response = await axiosapi.get(`/room/provider/search/name?roomName=${encodeURIComponent(searchQuery.value)}`)
            console.log("查詢結果:", response.data);
            searched.value = response.data; 
        }catch(error){
            console.log("error",error.message)
        }
    }

// openDate
    const openDate=()=>{
        router.push({path:"/roomCreate/available-date",})
    }

// createOneRoom
    const createOneRoom=()=>{
        router.push({path:"/roomCreate/first",})
    }

// modifyRoom
    const modifyRoom=(roomId)=>{
        router.push({path:`/roomCreate/modify-room/${roomId}`,})
    }
    
</script>
    
<style scoped>
.space-control{
    margin-bottom: 20px; /* 每個區塊之間增加間距 */
}
.btn-div{
    display: flex; /* 使用 Flexbox 排列按鈕 */
    justify-content: flex-end; /* 對齊到右邊 */
    gap: 10px; 
}
.btn-title{
    font-size: 20px;
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    cursor: pointer;
}
.input-group{
    width: 25%;
}
/* 標題區域 */
.title-section {
    text-align: center;
    margin-bottom: 2rem;
}

/* 表格樣式 */
.table-container {
    background-color: white;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    border-radius: 0.75rem;
    overflow: hidden;
}

table {
    width: 100%;
    border-collapse: collapse;
}

thead {
    background-color: #f3f4f6;
}

thead tr th {
    padding: 1rem;
    text-align: left;
    font-size: 18px;
    text-transform: uppercase;
    color: black;
    border-bottom: 1px solid #e5e7eb;
}

tbody tr {
    transition: background-color 0.2s;
    font-size: 18px;
    color:gray;

}

tbody tr:hover {
    background-color: #f9fafb;
}

tbody td {
    padding: 1rem;
    border-bottom: 1px solid #e5e7eb;
}

</style>