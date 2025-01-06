<template>
    <favoritePathBar :city="city"></favoritePathBar>
        <div style="margin: 15px 0px 15px 0px;">
            <span style="font-size: 30px;"><strong>{{ city }}</strong></span>
            <button  
                class="btn btn-outline-secondary me-md-2" 
                type="button" 
                data-bs-toggle="modal" 
                data-bs-target="#exampleModal"
                style="float: right;">
                    <i class="bi bi-link-45deg"></i>share
            </button>
            <div style="margin: 25px 0px 20px 0px;">
                <span>
                    <span style="padding-right: 10px;">Dates: </span> 
                    <DatePicker 
                        range
                        :value="dateRanges"
                        :disabled-date="disabledDate"
                        @update:value="(value) => getAvailableDate(value)" /> 

                    <span style="padding: 0px 10px 0px 20px;">Guest: </span>

                    <!-- - -->
                    <button 
                        type="button" 
                        class="btn btn-outline-secondary"
                        style="border-radius: 50px; border: 1px solid 	#F0F0F0;"
                        :disabled="guest <= 0"
                        @click="minusGuest">
                        <i class="bi bi-chevron-compact-left"></i>
                    </button>

                    <span style="padding: 0px 10px 0px 10px;">{{ guest }}</span>

                    <!-- + -->
                    <button 
                        type="button" 
                        class="btn btn-outline-secondary"
                        style="border-radius: 50px; border: 1px solid 	#F0F0F0;"
                        @click="plusGuest">
                        <i class="bi bi-chevron-compact-right" ></i>
                    </button>
                </span>
            </div>
        </div>
        <div class="row">
            <div class="col-md-6">
                <div class="row">
                    
                    <FavoriteCard v-for="favItem in filteredFavItems" :favItem="favItem" :dateRanges="dateRanges" :key="favItem.id"></FavoriteCard>
                    
                </div>
            </div>
            <div class="col-md-6">
                <div id="map" ref="mapContainer" style="width: 100%; height: 800px; margin-bottom: 80px; border-radius: 15px;"></div>
            </div>
        </div>
    

    <!-- 分享 modal -->
    <ShareFavListModal/>
</template>
    
<script setup>
    import { onMounted, ref, computed, watch } from 'vue';
    import FavoriteCard from '../components/favorite/FavoriteCard.vue';
    import { useFavoriteStore } from '../stores/favorite';
    import favoritePathBar from '../components/favorite/FavoritePathBar.vue';
    import DatePicker from '@jobinsjp/vue3-datepicker';
    import ShareFavListModal from '../components/favorite/ShareFavListModal.vue';
    import axios from 'axios';
    const API_KEY = import.meta.env.VITE_APP_GOOGLE_MAPS_ZN_API_KEY;
    
    const props = defineProps({
        city: {
            type: String,
            required: true
        }
    });
    
    // 地圖和座標相關的狀態
    const mapContainer = ref(null); // 使用 ref 綁定地圖 DOM 容器
    const map = ref(null);

    // 使用 Pinia 的 cart store
    const favoriteStore = useFavoriteStore();
    const favItems = ref([])
    onMounted(async () => {
        
        await favoriteStore.fetchFavoriteItems();
        try {
            await loadGoogleMapsApi();
            
            const locations = [];
            for (let favItem of favItems.value) {
                const location = await fetchCoordinates(favItem.roomAddr);
                if (location) {
                    locations.push(location);
                }
            }
            
            // 如果超過一個房源，先記酸出地圖中心後顯示。只有一個房源，就拿它本身當中心
            const center = calculateCenter(locations);
            initMap(center); // 將中心點傳遞給初始化地圖的函數
            

            // 確保地圖初始化後添加標記
            locations.forEach((location, index) => {
                setMarker(location, favItems.value[index].roomName);
            });

        }catch (error) {
            console.error("Error loading Google Maps:", error);
        }
    });

     // 初始化地圖
    const initMap = (center) => {
        if (!mapContainer.value) {
            console.error("Map container not found!");
            return;
        }
        map.value = new google.maps.Map(mapContainer.value, {
            center,
            zoom: 13,
            maxZoom: 20,
            minZoom: 3,
            streetViewControl: false,
            mapTypeControl: false,
        });
    };


    // 算出預設中心點位置
    const calculateCenter = (locations) => {

        const total = locations.reduce(
            (acc, loc) => {
                acc.lat += loc.lat;
                acc.lng += loc.lng;
                return acc;
            },
            { lat: 0, lng: 0 }
        );

        return {
            lat: total.lat / locations.length,
            lng: total.lng / locations.length,
        };
    };

    // 設置標記
    const setMarker = (position, name) => {
        if (!position || typeof position.lat !== "number" || typeof position.lng !== "number") {
            console.error("Invalid position for marker:", position);
            return;
        }

        const marker = new google.maps.Marker({
            position,
            map: map.value,
        });

        const infoWindow = new google.maps.InfoWindow({
            content: `<div style="font-size: 14px;">${name}</div>`,
        });

        marker.addListener("click", () => {
            infoWindow.open({
                anchor: marker,
                map: map.value,
                shouldFocus: false,
            });
        });
    };


    // 由地址轉換為經緯度
    const fetchCoordinates = async (searchAddress) => {
        
        try {
            const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${searchAddress}&key=${API_KEY}`)

            return response.data.status === "OK" && response.data.results.length > 0 
            ? response.data.results[0].geometry.location : null;

        } catch (error) {
            console.error('請求失敗:', error);
        }
    }

    // 發送地圖 api
    const loadGoogleMapsApi = () => {
        return new Promise((resolve, reject) => {
            if (window.google && window.google.maps) {
                resolve(window.google.maps);
                return;
            }

            const script = document.createElement("script");
            script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}`;
            script.async = true;
            script.defer = true;
            script.setAttribute("loading", "async"); // 加入最佳化屬性

            script.onload = () => resolve(window.google.maps);
            script.onerror = () => reject(new Error("Failed to load Google Maps API"));
            document.head.appendChild(script);
        });
    };

    // 控制只顯示符合 guest 人數的List
    const filteredFavItems = computed(() => {
        return favItems.value.filter(favItem => favItem.size >= guest.value);
    });


    // 監聽 favoriteStore.items 的變化，當 favoriteStore.items 改變時更新 favItems
    watch(() => favoriteStore.items, (newItems) => {
        favItems.value = newItems.get(props.city);
        
    });

    // 可用人數查詢
    const guest = ref(0);  // 人數
    function plusGuest(){
        guest.value ++;
    }
    function minusGuest(){
        guest.value --;
    }

    
    // 可用日期查詢
    const dateRanges = ref([]);
    function getAvailableDate(value){
        dateRanges.value=value;
    }


    // 今日之前不可選
    const disabledDate = (date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // 清除时分秒，只比较日期
        return date < today
    };

</script>