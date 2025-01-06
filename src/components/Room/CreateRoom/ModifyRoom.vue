<template>
    <div class="container">
        <div class="row">
            <!-- NavBar -->
            <div class="col-3">
                <div>
                    <h3>你的房源</h3>
                </div>
                <div class="space-control room-nav">
                    <button @click="showSection('basic')" class="btn btn-light btn-lg" >
                        房源基本介紹<h6>名稱、城市、房源類型</h6>
                    </button><br>
                        
                    <button @click="showSection('address')" class="btn btn-light btn-lg">房源地址</button><br>
                    <button @click="showSection('features')" class="btn btn-light btn-lg">
                        房源特點<h6>房間/衛浴數量、房源描述</h6>
                    </button><br>
                        
                    <button @click="showSection('details')" class="btn btn-light btn-lg">房源設施及細則</button><br>
                    <button @click="showSection('checkin')" class="btn btn-light btn-lg">房客入住事項</button><br>
                    <button @click="showSection('images')" class="btn btn-light btn-lg">房源圖片</button><br>
                    
                    <!-- 優惠設定 -->
                        <button @click="openModal" class=" btn btn-light btn-lg promotion-btn">設定優惠方案</button>
                        <PlatformPromotionModal ref="platformpromotionModal" :roomId="roomId"/>

                </div> 
            </div>

            <!-- Setting -->
            <div class="col set-container">
                <div class="space-control d-flex align-items-center justify-content-between">
                    <h2 style="font-weight: bold;font-size: 40px;">設定</h2>
                    <!-- Button -->
                        <div class="save-and-delete">
                            <button @click="saveRoom" class="btn btn-dark btn-lg" >儲存</button>
                            <button v-if="roomData.stateId!='24'" @click="tempRemoveRoom" class="btn btn-warning btn-lg" >暫時下架</button>
                            <button @click="removeRoom" class="btn btn-danger btn-lg" >下架</button>
                        </div>
                </div>
                <!-- 要編輯的內容 -->
                    <!-- 房源基本介紹：basic -->
                        <div v-if="currentSection === 'basic'">
                            <!-- Room Name -->
                                <div class="space-control">
                                    <label for="roomName" class="form-label label-style" >房源名稱</label>
                                    <input v-model="selectedRoomName" type="text" placeholder="" class="form-control form-control-lg">
                                </div>
                            <!-- City -->
                                <div class="space-control">
                                    <label for="city" class="form-label label-style" >所在城市</label>
                                    <select v-model="selectedCity" class="form-select form-select-lg mb-3">
                                        <option selected>選擇城市</option>
                                        <option v-for="city in cities" :key="city.cityId" :value="city.cityId">{{city.cityName}}</option>
                                    </select>
                                </div>
                            <!-- Room Type -->
                                <div class="space-control">
                                    <label for="roomType" class="form-label label-style" >房源類型</label>
                                    <select v-model="selectedRoomType" class="form-select form-select-lg mb-3">
                                        <option selected>選擇類型</option>
                                        <option v-for="roomType in roomTypes" :key="roomType.roomTypeId" :value="roomType.roomTypeId">{{roomType.name}}</option>
                                    </select>
                                </div>
                        </div>
                    <!-- 房源地址：address -->
                        <div v-show="currentSection === 'address'">
                            <div class="space-control">
                                <label for="roomAddress" class="form-label label-style" >房源位置</label><br>
                                <input v-model="selectedRoomAddress" type="text" placeholder="輸入你的地址" class="form-control form-control-lg">
                                <!-- Google Maps -->
                                    <div>
                                        <div class="google-map" id="map"></div>
                                    </div>
                            </div>
                        </div>
                    <!-- 房源特點：features -->
                        <div v-if="currentSection === 'features'">
                            <!-- BedroomCount / RoomSize / DoubleBed / SingleBed / Bathroom  -->
                                <div v-for="(item,index) in items" :key="index" class="mb-3 d-flex justify-content-between align-items-center">
                                    <label class="col-form-label label-style">{{ item.label }}</label>
                                    <div class="col-3 d-flex justify-content-between align-items-center">
                                        <button @click="decrease(index,item.step)" class="item-btn btn btn-outline-secondary rounded-circle">－</button>
                                        <span class="mx-3">{{ item.value}}</span>
                                        <button @click="increase(index,item.step)" class="item-btn btn btn-outline-secondary rounded-circle">＋</button>
                                    </div>
                                </div>
                            <!-- roomContent -->
                                <div class="space-control">
                                    <label for="roomContent" class="form-label label-style">撰寫房源描述</label><br>
                                    <textarea v-model="selectedRoomContent" class="form-control" id="roomContent" rows="10" 
                                                placeholder=""></textarea>
                                </div>
                        </div>
                    <!-- 房源設施及細則：details -->
                        <div v-if="currentSection === 'details'">
                            <!-- Facility -->
                            <div class="space-control">
                                <label for="roomFacility" class="form-label label-style" >設施</label><br>
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
                                <h3 class="label-style">維護你的房源品質</h3>
                                <div v-for="regulation in regulations" :key="regulation.regulationId" class="form-check regulation-item">
                                    <input v-model="selectedRegulation" class="form-check-input" type="checkbox" :value="regulation.regulationId"
                                     :id="'regulation-' + regulation.regulationId">
                                    <label class="form-check-label" :for="'regulation-' + regulation.regulationId">
                                        {{ regulation.name }}
                                    </label>
                                </div>
                        </div>
                    <!-- 房客入住事項：check in/check out 、注意事項 -->
                        <div v-if="currentSection === 'checkin'">
                            <!-- check in / check out -->
                                <div class="space-control">
                                    <label for="roomName" class="form-label label-style" >入住時間</label>
                                    <input v-model="selectedCheckIn" type="text" placeholder="" class="form-control form-control-lg">
                                    <span style="color:gray;font-size: 15px;">24小時制(範例：下午3點，請輸入1500；早上8點45分，請輸入0845。)</span>
                                </div>
                                <div class="space-control">
                                    <label for="roomName" class="form-label label-style" >退房時間</label>
                                    <input v-model="selectedCheckOut" type="text" placeholder="" class="form-control form-control-lg">
                                    <span style="color:gray;font-size: 15px;">24小時制(範例：下午3點，請輸入1500；早上8點45分，請輸入0845。)</span>          
                                </div>
                            <!-- roomNotice -->
                                <div class="space-control">
                                    <label for="roomNotice" class="form-label label-style">撰寫注意事項</label><br>
                                    <textarea v-model="selectedRoomNotice" class="form-control" id="roomNotice" rows="10" 
                                            placeholder=""></textarea>
                                </div>

                        </div>
                    <!-- 房源圖片：images -->
                        <div v-if="currentSection === 'images'">
                            <!-- 新增圖片 -->
                            <div class="space-control">
                                <div class="img-div">
                                    <img src="/src/assets/room/camera.svg"><br>
                                    <button @click="showImgsUpload" class="img-btn">新增相片</button>
                                </div>
                            </div>
                            <!-- 顯示圖片 -->
                            <div class="space-control">
                                <h4>房源圖片</h4>
                                    <div class="row">
                                        <div class="col-md-4 position-relative"  v-for="(image, index) in selectedImages" :key="image.id || index">
                                            <img :src="image.src" class="img-fluid rounded" :alt="'Image ' + image.id">
                                            <!-- 刪除按钮：垃圾桶 -->
                                            <button class="btn btn-link delete-btn" @click="removeImage(image.id)">
                                                <font-awesome-icon :icon="['fas', 'trash']" />
                                            </button>
                                        </div>
                                    </div>  
                            </div>
                        </div>
            </div>
        </div>
    </div>
</template>
    
<script setup>
import { ref,onMounted,reactive,watch,nextTick } from 'vue';
import axiosapi from "@/plugins/axios";
import axios from "axios";
import { useRouter,useRoute } from 'vue-router';
import Swal from 'sweetalert2';
import { errorMessages } from 'vue/compiler-sfc';
import { useUserProfileStore } from '../../../stores/userProfile.js';

// define
const router =useRouter()
const route =useRoute()
const roomId = route.params.roomId
const userProfileStore = useUserProfileStore()
const cities=ref([])
const regulations=ref([])
const roomTypes=ref([])
const roomData=ref([])

const currentSection=ref('basic')

const selectedRoomName=ref("")
const selectedCity=ref("")
const selectedRoomType = ref("")
const selectedRoomContent = ref("")
const selectedFacility = ref([])
const selectedRegulation=ref([])
const selectedCheckIn=ref("")
const selectedCheckOut=ref("")
const selectedRoomNotice=ref("")
const selectedImages=ref([])

onMounted(async ()=>{
    try {
        await loadGoogleMapsApi(); // 確保 Google Maps API 加載完成

        // 加載其他資料
        await callCities();
        await callRoomTypes();
        await callFacilities();
        await callRegulations();

        // 獲取房源資料並初始化地圖
        await basicData();
    } catch (error) {
        console.error("初始化過程出錯:", error.message);
    }
})

// City
    async function callCities(){
        try{
            const response = await axiosapi.get("/city/all")
            cities.value = await response.data
        }catch(error){
            console.log("error",error.message)
        }
    }

// RoomType
    async function callRoomTypes(){
        try{
            const response=await axiosapi.get("/room-type/all")
            roomTypes.value=await response.data
        }catch(error){
            console.log("error",error.message)
        }
    }

    const selectRoomType = (roomTypeName) => {
        selectedRoomType.value = roomTypeName;
    }
// Address：Google maps
const API_KEY="AIzaSyAt6jFiBQcDRDlsiIFfJkXekaw6ilRx9aw"; // Google Maps
const selectedRoomAddress = ref(""); // 輸入框的地址，初始為空
const map=ref("")

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
                console.warn("地址為空，請輸入有效地址")
                return
            }
            // console.log(`地址變更：${oldAddress} -> ${newAddress}`)
            const location = await fetchCoordinates(newAddress)
            if (location) {
                // 更新地圖的中心位置和地標
                console.log("map.value:", map.value);

                map.value.setCenter(location)
                setMarker(location)
            }
        })

// BedroomCount / RoomSize / DoubleBed / SingleBed / Bathroom
    const items = reactive([
        { id: 'roomSize', label: '房客人數', value: 1 , step:1 , },
        { id: 'bedroomCount', label: '臥室', value: 0 , step:1 ,  },
        { id: 'singleBed', label: '單人床', value: 0 , step:1 ,  },
        { id: 'doubleBed', label: '雙人床', value: 0 , step:1 , },
        { id: 'bathroom', label: '衛浴', value: 0.5 , step:0.5 ,  },
        ])
        // increase
            const increase=(index,step)=>{
                items[index].value+=step
            }
        // decrease
            const decrease=(index,step)=>{
                    items[index].value=Math.max(0,items[index].value-step)
            }

// Facilites
    const facilities = ref([]) // 後端數據會填充到這裡

    const iconMapping = {
        1: ['fas', 'wifi'], // Wi-Fi
        2: ['fas', 'fan'], // 空調設備
        3: ['fas', 'tv'], // 電視
        4: ['fas', 'snowflake'], // 冰箱
        5: ['fas', 'coffee'], // 咖啡機
        6: ['fas', 'soap'], // 洗衣機
        7: ['fas', 'parking'], // 免費停車
        8: ['fas', 'parking'], // 收費停車
        9: ['fas', 'swimmer'], // 泳池
        10: ['fas', 'fire'], // 烤肉區
        11: ['fas', 'utensils'], // 戶外用餐區
        12: ['fas', 'water'], // 湖畔
        13: ['fas', 'umbrella-beach'], // 直達海灘
        14: ['fas', 'shower'], // 戶外淋浴空間
        15: ['fas', 'bell'], // 煙霧警報器
        16: ['fas', 'kit-medical'], // 急救包
        17: ['fas', 'fire-extinguisher'], // 滅火器
    }
    async function callFacilities(){
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
    async function callRegulations(){
            try{
                const response=await axiosapi.get("/regulation/all")
                regulations.value=await response.data
            }catch(error){
                console.log("error",error.message)
            }
    }

// Images
const showImgsUpload = () => {
    Swal.fire({
        title: "上傳相片",
        html: `<div>
                    <div class="upload-div">
                        <button id="upload-button" class="upload-btn">瀏覽</button>
                        <input type="file" id="file-input" multiple accept="image/*" style="display: none;" />
                    </div>
            </div>`,
        showCloseButton: true,
        showCancelButton: true,
        focusConfirm: false,
        cancelButtonText: "取消",
        confirmButtonText: "上傳",
        didOpen: () => {
            // 綁定事件
            const uploadButton = document.getElementById("upload-button");
            const fileInput = document.getElementById("file-input");

            uploadButton.addEventListener("click", () => {
                fileInput.click();
            });
        },
        preConfirm: async () => {
            const files = document.getElementById("file-input").files;
            if (!files.length) {
                await Swal.fire("請至少選擇一張圖片");
                return false; 
            }
            return Array.from(files); 
        },
    }).then(async (result) => {
        if (result.isConfirmed) {
            const newImages = await Promise.all(
                result.value.map(async (file) => {
                    // 將 File 物件轉換為符合 selectedImages.value 結構的物件
                    const base64 = await fileToBase64(file);
                    return {
                        id: Date.now() + Math.random(), // ******生成臨時 ID******
                        src: base64,
                    };
                })
            );
            selectedImages.value = [...selectedImages.value, ...newImages];
            Swal.fire(`${newImages.length}張圖片已成功上傳`);
        }
    });
};

    // 將 File 轉換為 Base64
    const fileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
            reader.readAsDataURL(file); 
        });
    };

    // remove image
    const removeImage = async (imageId) => {
        if (!roomId) {
            console.error("roomId 不存在，請檢查上一步。")
            return;
        }

        try {
            const response=await axiosapi.delete(`/room-images/provider/remove/${imageId}`,)
            console.log(imageId)
            console.log(response)
            
            Swal.fire("成功", "圖片已刪除", "success")

            // 刪除後刷新頁面或更新本地圖片數據
            // 更新圖片列表
            selectedImages.value = selectedImages.value.filter((image) => image.id !== imageId)
        } catch (error) {
            console.error("刪除圖片失敗:", error.message)
            Swal.fire("錯誤", "無法刪除圖片", "error")
        }
    }

// 獲取資料
    const basicData = async () => {
        if (!roomId) {
            console.error("roomId 不存在，請檢查上一步。")
            return
        }
        try {
            const response = await axiosapi.get(`room/provider/findByRoomId/${roomId}`)
            if (response.data && response.data.data && response.data.data.length > 0) {
                
                    roomData.value = response.data.data[0] // 提取第一個房源的數據
                    /* roomName */
                        selectedRoomName.value = roomData.value.roomName // 初始化房源名稱
                    /* city */
                        selectedCity.value = roomData.value.cityId
                    /* roomType */
                        selectedRoomType.value = roomData.value.roomTypeId
                    /* roomAddress */
                        selectedRoomAddress.value = roomData.value.roomAddr
                            /* 加載地圖 */
                                await loadGoogleMapsApi(); // 確保地圖 API 加載完成
                                const location = await fetchCoordinates(selectedRoomAddress.value);
                                if (location) {
                                    await loadGoogleMapsApi();
                                    initMap(location); // 初始化地圖
                                    setMarker(location); // 設置標記
                                }
                    /* BedroomCount / RoomSize / DoubleBed / SingleBed / Bathroom */
                        items.find(item => item.id === 'roomSize').value = roomData.value.roomSize || 1;
                        items.find(item => item.id === 'bedroomCount').value = roomData.value.bedroomCount || 0;
                        items.find(item => item.id === 'singleBed').value = roomData.value.singleBed || 0;
                        items.find(item => item.id === 'doubleBed').value = roomData.value.doubleBed || 0;
                        items.find(item => item.id === 'bathroom').value = roomData.value.bathroom || 0.5;
                    /* roomContent */
                        selectedRoomContent.value = roomData.value.roomContent
                    /* facility */
                        selectedFacility.value = roomData.value.facilityId
                    /* regulation */
                        selectedRegulation.value = roomData.value.regulationId
                    /* check in */
                         selectedCheckIn.value = roomData.value.checkinTime
                    /* check out */
                        selectedCheckOut.value = roomData.value.checkoutTime
                    /* 注意事項 */
                        selectedRoomNotice.value = roomData.value.roomNotice
                    /* images */
                        if (roomData.value && roomData.value.roomImages && typeof roomData.value.roomImages === 'object') {
                            // 遍歷 roomImages 並生成圖片列表
                                selectedImages.value = Object.entries(roomData.value.roomImages).map(([id, base64Image]) => {
                                    if (base64Image.startsWith('/9j/')) { // 基本檢查 Base64 是否正確
                                        return {
                                            id: parseInt(id, 10), // 確保 id 是數字
                                            src: `data:image/jpeg;base64,${base64Image}` // 拼接圖片 URL
                                        };
                                    }
                            return null; // 跳過無效圖片
                        }).filter(image => image !== null); // 過濾掉無效數據
                }
            } else {
                console.warn(error,errorMessages)
            }
        } catch (error) {
            console.error('無法獲取房源資料：', error)
        }
    }

// showSection
    const showSection=(section)=>{
        currentSection.value=section
    }

const saveRoom = async () => {
    if (!roomId) {
        console.error("roomId 不存在，請檢查上一步。");
        return;
    }
    const roomImagesBase64 = await Promise.all(
        selectedImages.value.map(image => {
            if (typeof image.src === "string" && image.src.startsWith("data:image")) {
                // 已是 Base64 字串，直接提取
                return Promise.resolve(image.src.split(",")[1]);
            } else if (image instanceof Blob) {
                // Blob 類型，轉換為 Base64
                return convertToBase64(image);
            } else {
                console.error("無法處理的圖片格式：", image);
                return Promise.resolve(null);
            }
        })
    );
    const roomImagesMap = roomImagesBase64.reduce((map, image, index) => {
        map[index] = image;
        return map;
    }, {});

    // 準備要發送的資料
    const roomData = {
        roomId: roomId,
        roomName: selectedRoomName.value,
        roomAddr: selectedRoomAddress.value,
        roomSize: items.find(item => item.id === "roomSize").value,
        roomContent: selectedRoomContent.value,
        roomNotice: "歡迎入住TOKYO的特色房源！",
        doubleBed: items.find(item => item.id === "doubleBed").value,
        singleBed: items.find(item => item.id === "singleBed").value,
        bedroomCount: items.find(item => item.id === "bedroomCount").value,
        bathroom: items.find(item => item.id === "bathroom").value,
        checkinTime: 14.30,
        checkoutTime: 11.00,
        providerId: userProfileStore.providerId,
        stateId: 24,
        roomTypeId: selectedRoomType.value,
        cityId: selectedCity.value,
        refundPolicyId: 1,
        facilityId: selectedFacility.value,
        regulationId: selectedRegulation.value,
        mainImage: roomImagesBase64.length > 0 ? roomImagesBase64[0] : null, // 主圖
        roomImages: roomImagesMap
    };

    try {
        await axiosapi.put(`/room/provider/modify/${roomId}`, roomData);
        router.push({ path: `/roomCreate/roomlist` });
    } catch (error) {
        console.error("上傳失敗：", error.message);
    }
};
    // 轉換 -> Base64 格式
    const convertToBase64 = file => {
        return new Promise((resolve, reject) => {
            if (!(file instanceof Blob)) {
                reject(new Error("文件不是 Blob 類型"));
                return;
            }
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result.split(",")[1]);
            reader.onerror = error => reject(error);
        });
    };

    // tempRemoveRoom
        const tempRemoveRoom = async () => {
                    if (!roomId) {
                        console.error("roomId 不存在，請檢查上一步。")
                        return
                    }
                
                // 傳送到後端的資料
                    const roomData={
                        roomId:roomId,
                        roomName: selectedRoomName.value, 
                        roomAddr: selectedRoomAddress.value, 
                        roomSize: items.find(item => item.id === 'roomSize').value,
                        roomContent: selectedRoomContent.value, 
                        roomNotice:selectedRoomNotice.value,
                        doubleBed: items.find(item => item.id === 'doubleBed').value,
                        singleBed: items.find(item => item.id === 'singleBed').value,
                        bedroomCount: items.find(item => item.id === 'bedroomCount').value,
                        bathroom: items.find(item => item.id === 'bathroom').value,
                        checkinTime:selectedCheckIn.value,
                        checkoutTime:selectedCheckOut.value,
                        providerId:userProfileStore.providerId,
                        stateId:24,
                        roomTypeId: selectedRoomType.value,
                        cityId: selectedCity.value,
                        refundPolicyId:1,
                        roomImages: selectedImages.value.reduce((acc, image) => {
                            acc[image.id] = image.src.split(",")[1]; // 提取 Base64 的主要部分
                            return acc;
                        }, {}),
                        facilityId: selectedFacility.value,
                        regulationId: selectedRegulation.value, 
                    }
                    console.log("roomData:", roomData);

                    try{
                        // 發送 PUT 請求到後端
                            await axiosapi.put(`/room/provider/modify/${roomId}`,roomData)

                        // 跳轉到 roomlist 組件畫面
                        router.push({ path:`/roomCreate/roomlist`,})
                    }catch(error){
                        console.log("error",error.message)
                    }
            }

    // removeRoom
        const removeRoom = async () => {
                    if (!roomId) {
                        console.error("roomId 不存在，請檢查上一步。")
                        return
                    }
                
                // 傳送到後端的資料
                    const roomData={
                        roomId:roomId,
                        roomName: selectedRoomName.value, 
                        roomAddr: selectedRoomAddress.value, 
                        roomSize: items.find(item => item.id === 'roomSize').value,
                        roomContent: selectedRoomContent.value, 
                        roomNotice:selectedRoomNotice.value,
                        doubleBed: items.find(item => item.id === 'doubleBed').value,
                        singleBed: items.find(item => item.id === 'singleBed').value,
                        bedroomCount: items.find(item => item.id === 'bedroomCount').value,
                        bathroom: items.find(item => item.id === 'bathroom').value,
                        checkinTime:selectedCheckIn.value,
                        checkoutTime:selectedCheckOut.value,
                        providerId:userProfileStore.providerId,
                        stateId:23,
                        roomTypeId: selectedRoomType.value,
                        cityId: selectedCity.value,
                        refundPolicyId:1,
                        roomImages: selectedImages.value.reduce((acc, image) => {
                            acc[image.id] = image.src.split(",")[1]; // 提取 Base64 的主要部分
                            return acc;
                        }, {}),
                        facilityId: selectedFacility.value,
                        regulationId: selectedRegulation.value, 
                    }
                    console.log("roomData:", roomData);

                    try{
                        // 發送 PUT 請求到後端
                            await axiosapi.put(`/room/provider/modify/${roomId}`,roomData)

                        // 跳轉到 roomlist 組件畫面
                        router.push({ path:`/roomCreate/roomlist`,})
                    }catch(error){
                        console.log("error",error.message)
                    }
            }


    
    //*******************************優惠相關*****************************************/ 
    import PlatformPromotionModal from '../../promotion/PlatformPromotionModal.vue';
    const platformpromotionModal = ref(null);
    // 開啟所有優惠模態框
    const openModal = () => {
        platformpromotionModal.value.openModal();
    };
</script>
    
<style scoped>
#map {
  width: 100%;
  height: 500px;
}
.save-and-delete{
    display: flex;
    justify-content: end; /* 将内容靠右对齐 */
    align-items: center; /* 垂直居中 */
    gap: 8px; /* 按钮之间的间距 */
    padding: 10px 0; /* 添加上下内边距 */
}
.room-nav{
    background-color: 	#F0F0F0; /* 灰色背景 */
    border-right: 1px solid #dee2e6; /* 添加右边框分割 */
    padding: 20px; /* 内边距 */
    min-height: 100vh; /* 占满屏幕高度 */
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: stretch;
    margin-bottom: 20px; /* 标题和按钮之间的间距 */
    text-align: center;
    border-radius: 15px;
}
.label-style{
    font-size: 25px;   /* 調整字體大小 */
    white-space: nowrap; /* 防止换行 */
}
.item-btn {
    width: 35px; /* 固定按钮宽度 */
    height: 35px; /* 固定按钮高度 */
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0; /* 移除内边距 */
    font-size: 1rem;
    line-height: 1;
}
.space-control{
    margin-top: 20px;
    margin-bottom: 20px; 
}
.btn{
    border-radius: 15px;
}
.btn-light:hover{
    background-color: #F0F0F0;
    transform: scale(0.97); 
}
.card{
    cursor: pointer; 
}
.card.selected {
    border: 3px solid black !important;
}
.regulation-item {
    font-size: 25px;
    margin-bottom: 1rem; /* 調整為所需的行距，例如 1rem、1.5rem 等 */
}
h6{
    margin-left: 20px;
    color:gray;
}
img{
    width:150px;
    height:100px;
}
.img-div{
    border:2px dashed gray;
    background-color: #F0F0F0;
    width:700px;
    height:350px;
    border-radius: 20px;
}
.img-btn{
    width:110px;
    height:50px;
    background-color:white;
    border-radius: 8px;
}
.upload-div{
    border: 2px dashed #ccc;
    padding: 20px;
    text-align: center;
    border-radius: 10px;
}
.upload-btn{
    padding: 10px 20px; 
    background-color: #000; 
    color: #fff; 
    border: none; 
    border-radius: 5px; cursor: pointer;
}
.btn.btn-link.position-absolute {
    color: gray;
    font-size: 35px;
    
}
.img-div{
    border:2px dashed gray;
    background-color: #F0F0F0;
    width:700px;
    height:350px;
    border-radius: 20px;
    display: flex;
    flex-direction: column; /* 垂直排列元素 */
    justify-content: center; /* 垂直居中 */
    align-items: center; /* 水平居中 */
}
.delete-btn {
    position: absolute;
    color: red; /* 垃圾桶按鈕顏色 */
    background-color: transparent; /* 按鈕背景透明 */
    border: none; /* 移除邊框 */
    font-size: 20px; /* 按鈕圖標大小 */
    cursor: pointer; /* 鼠標指針變成手型 */
}
.delete-btn:hover {
    color: darkred; /* 滑鼠懸停時顏色變化 */
}
/********* 優惠 **********/

.promotion-btn:hover {
    background-color: #f2f2f2; 
    color: #000000; 
    transform: scale(1.03); 
}

.promotion-btn:active {
    background-color: #e0e0e0; 
    transform: scale(0.97); 
}

</style>