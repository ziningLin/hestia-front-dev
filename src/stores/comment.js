import { defineStore } from "pinia";
import axiosapi from "@/plugins/axios.js"


export const useCommentStore = defineStore('comment', {
    state: () => ({
        rooms: []
    }),
    getters: {
    },
    actions: {

        // 查詢此 order 的所有 room
        async findOrderRoom(orderId){
            // 清空
            this.rooms = [];

            try{
                // 送去後端
                let s = await axiosapi.get(`/orderDetails/findOrderRoom/${orderId}`);
                this.rooms = s.data.rooms;
                
            }catch (error) {
                    console.error('Failed to fetch cart items:', error);
            }
        },

        // 查詢此 order 所有 room 的評價
        async  findOrderComment(orderId){
            try{
                let request ={
                    "start": 0,
                    "max": 100,
                    "order": "overallScore",
                    "desc": true,
                    "orderId": orderId
                }
                
                // 送去後端
                let response = await axiosapi.post('/order/comment/find', request);

                // 將 s.data.list 轉換成 Map
                if(response.data.list){
                    const roomMap = new Map(response.data.list.map(item => [item.roomId, item]));
    
                    // 更新 rooms.value
                    this.rooms.forEach(room => {
                        room.comment = roomMap.get(room.roomId) || null;
    
                    });
                }
            }catch (error) {
                    console.error('Failed to fetch cart items:', error);
            }
        },

        // 查詢此 roomId 的評價
        async fetchCartItemsComment(roomId){
            try{
                const response = await axiosapi.get(`/order/comment/avg/${roomId}`);
                return response.data.obj.overallTotalScore;
            }catch (error) {
                console.error('Failed to fetch roomIds comment:', error);
            }
        },
    }
})