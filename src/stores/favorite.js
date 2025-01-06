import { defineStore } from "pinia";
import axiosapi from "@/plugins/axios.js"


export const useFavoriteStore = defineStore('favorite', {
    state: () => ({
        items: new Map(),
        favList:[],
        roomList:[]
    }),
    actions: {
        // 調閱所有此 user 的 favorite
        async fetchFavoriteItems(){
            try {
                const response = await axiosapi.get('/favorite/getFavorite');

                const map = new Map(); // 假设 items 是购物车的列表数据
                let cityName=''

                if(response.data.list != null){

                    // 清空
                    this.favList = []
                    this.roomList = []

                    // 逐筆處理資料
                    for( let fav of response.data.list){

                        // 先將 roomId, favoriteID 都個別加入 roomList, favList 中
                        this.roomList.push(fav.roomId);
                        this.favList.push(fav.favoriteId);
                        
                        cityName = fav.cityName;
                        
                        // 未將此 city 加入過 map : map 中無 cityName 這個 key
                        if(!map.has(cityName)){
                            
                            // 準備好 val 資料
                            let arr = []
                            let room = {
                                "favoriteId": fav.favoriteId,
                                "roomName":fav.roomName,
                                "roomAddr":fav.roomAddress,
                                "cityName": fav.cityName,
                                "note": fav.note,
                                "isFavorited": true,
                                "roomId":fav.roomId,
                                "doubleBed": fav.doubleBed,
                                "singleBed": fav.singleBed,
                                "bathroom": fav.bathroom,
                                "bedroom": fav.bedroom,
                                "price": fav.price,
                                "size": fav.size
                            }

                            // 塞進 val
                            arr.push(room);
                            
                            // 塞進 map
                            map.set(cityName, arr);
                        }
                        else{
                            // 已加入過 map 先 get 現在的 val arr
                            let arr = map.get(cityName);

                            // 準備好 room 資料
                            let room = {
                                "favoriteId": fav.favoriteId,
                                "roomName":fav.roomName,
                                "roomAddr":fav.roomAddress,
                                "cityName": fav.cityName,
                                "note": fav.note,
                                "isFavorited": true,
                                "roomId":fav.roomId,
                                "doubleBed": fav.doubleBed,
                                "singleBed": fav.singleBed,
                                "bathroom": fav.bathroom,
                                "bedroom": fav.bedroom,
                                "price": fav.price,
                                "size": fav.size
                            }

                            // 塞 room 進 val
                            arr.push(room);
                            
                            // 塞 val 進 map
                            map.set(cityName, arr);
                        }
                    }
                    this.items = map;
                }
            }catch (error) {
                console.error('Failed to fetch cart items:', error);
            }
        },

        // 更改某筆 favorite 資料的 note
        async editFavoriteNote(favoriteId, note){
            try {

                // 準備 request
                const request={
                    note: note
                }
                const a = await axiosapi.post(`/favorite/editFavorite/${favoriteId}`, request);

            }catch (error) {
                console.error('Failed to fetch cart items:', error);
            }
        },

        // 移除 removeLst By favoriteId
        async removeFavLst(lst){
            try{

                for (let favId of lst){
                    await axiosapi.get(`/favorite/deleteFavorite/${favId}`);
                }

            }catch (error) {
                console.error('Failed to fetch cart items:', error);
            }
        },

        // 移除 removeLst By roomId
        async removeFavLstByRoomId(roomId){
            try{
                let s = await axiosapi.get(`/favorite/deleteRoomFromFavorite/${roomId}`);
                console.log(s);
            }catch (error) {
                console.error('Failed to fetch cart items:', error);
            }
        },

        // 處理新增
        async addRoomToFavLst(roomId){
            try{
                let request = {
                        userId:1,
                        roomId:roomId,
                        note: ""
                }

                let res = await axiosapi.post('/favorite/addToFavorite', request);
                console.log(res)
                

            }catch (error) {
                console.error('Failed to fetch cart items:', error);
            }
        },
        // 清除favorite資料
        removeFavoritePiniaData(){
            this.items=new Map();
            this.favList=[];
            this.roomList=[];
        }


    }
});