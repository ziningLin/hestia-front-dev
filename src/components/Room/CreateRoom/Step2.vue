<template>
    <div class="mb-5 mt-5">
        <!-- Room Address -->
            <div class="space-control">
                <label for="roomAddress" class="form-label label-style" >房源位置在哪裡？</label><br>
                <span>房客在預訂確認之後，我們才會分享房源確切地址。</span><br><br>
                <input v-model="selectedRoomAddress" type="text" placeholder="輸入你的地址" class="form-control form-control-lg" >
            </div>

        <!-- Google Maps -->
         <div>
            <div class="google-map" id="map"></div>
         </div>

        <!-- Step Button -->
            <div class="d-flex justify-content-between">
                <button @click="previousStep" class="btn btn-dark btn-lg" >上一步</button>
                    <!-- if not completed , disabled button -->
                    <button @click="nextStep" :disabled=" !selectedRoomAddress" class="btn btn-dark btn-lg" >
                        下一步
                    </button>
            </div>
    </div>
        
</template>
    
<script setup>
import { ref,onMounted,watch } from "vue";
import axiosapi from "@/plugins/axios";
import { useRouter,useRoute } from "vue-router";
import axios from "axios";


// define
const API_KEY="AIzaSyAt6jFiBQcDRDlsiIFfJkXekaw6ilRx9aw"; // Google Maps
const router = useRouter()
const route = useRoute()
const selectedRoomAddress = ref(""); // 輸入框的地址，初始為空
const defaultAddress = "台灣"; // 預設地圖地址
const roomId = route.params.roomId
const map=ref("")


onMounted(async()=>{
    await loadGoogleMapsApi()
    const location = await fetchCoordinates(defaultAddress); // 使用預設地址初始化
    initMap(location)
    setMarker(location)
    
})

// Google Maps API
    // 建立地圖
    const initMap = (center) => {
        map.value = new google.maps.Map(document.getElementById("map"), {
            center: center,
            zoom: 15,
            maxZoom: 20,
            minZoom: 3,
            streetViewControl: false,
            mapTypeControl: false,
        })
    }
    // 建立地標
    const setMarker=(position)=>{
        // 建立新地標
        const marker=new google.maps.Marker({
            // 設定地標的座標
            position :position,
            // 設定地標要放在哪一個地圖
            map:map.value
        })
    }
    // 由地址轉換為經緯度
    const fetchCoordinates = async (address) => {
        try {
            const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${API_KEY}`)

            return response.data.status === "OK" && response.data.results.length > 0 
            ? response.data.results[0].geometry.location : null

        } catch (error) {
            console.error('請求失敗:', error)
        }
    }

     // 發送地圖 api
    const loadGoogleMapsApi = () => {
        return new Promise((resolve, reject) => {
            if (window.google && window.google.maps) {
                resolve(window.google.maps)
                return
            }

            const script = document.createElement("script");
            script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}`
            script.async = true
            script.defer = true
            script.setAttribute("loading", "async") // 加入最佳化屬性

            script.onload = () => resolve(window.google.maps)
            script.onerror = () => reject(new Error("Failed to load Google Maps API"))
            document.head.appendChild(script)
        })
    }

// 使用 watch 監聽 selectedRoomAddress 的變化
    watch(selectedRoomAddress, async (newAddress, oldAddress) => {
        if (!newAddress.trim()) {
        // 如果地址為空或僅包含空白字元，直接返回，不呼叫 API
        console.warn("地址為空，請輸入有效地址");
        return;
    }
    // console.log(`地址變更：${oldAddress} -> ${newAddress}`)
    const location = await fetchCoordinates(newAddress)
    if (location) {
        // 更新地圖的中心位置和地標
        map.value.setCenter(location)
        setMarker(location)
    }
    })

// previousStep button
const previousStep = () => {
    router.push(`/roomCreate/step-one/${roomId}`)
    }

// nextStep button
const nextStep = async () => {
        if (!roomId) {
            console.error("roomId 不存在，請檢查上一步。")
            return
        }
    
    // 傳送到後端的資料
        const roomData={
            roomAddr:selectedRoomAddress.value,
        }
        try{
            // 發送 POST 請求到後端
                const response=await axiosapi.post(`/room/provider/create/step-two/${roomId}`,roomData)
            
            // 跳轉到step three組件畫面
            router.push({
                path:`/roomCreate/step-three/${roomId}`,
                query: { roomId },
            })
        }catch(error){
            console.log("error",error.message)
        }
}


</script>
    
<style scoped>
#map {
  width: 100%;
  height: 500px;
}
.label-style{
    font-size: 30px;   /* 調整字體大小 */
    font-weight: bold; /* 加粗字體 */
}
.space-control{
    margin-bottom: 40px; /* 每個區塊之間增加間距 */
}
    
</style>