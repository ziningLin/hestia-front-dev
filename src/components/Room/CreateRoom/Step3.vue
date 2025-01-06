<template>
    <div class="mb-5 mt-5">
        <!-- Title -->
            <div class="">
                    <h3 class="form-label label-style" >分享房源的基本資訊</h3>
                    <span>你可以之後再新增更多詳細資訊。</span><br><br>
            </div>

        <!-- BedroomCount / RoomSize / DoubleBed / SingleBed / Bathroom  -->
            <div v-for="(item,index) in items" :key="index" class="mb-3 d-flex justify-content-between align-items-center space-control ">
                <label class="col-form-label item-style">{{ item.label }}</label>
                <div class="col-3 d-flex justify-content-between align-items-center">
                    <button @click="decrease(index,item.step)" class="item-btn btn btn-outline-secondary rounded-circle">－</button>
                    <span class="mx-3">{{ item.value}}</span>
                    <button @click="increase(index,item.step)" class="item-btn btn btn-outline-secondary rounded-circle">＋</button>
                </div>
            </div>
           
        <!-- roomContent -->
        <div class="space-control">
            <label for="roomContent" class="form-label label-style">撰寫房源描述</label><br>
            <span>分享你的房源有哪些特點。</span><br><br>
            <textarea v-model="selectedRoomContent" class="form-control" id="roomContent" rows="10" 
                        placeholder="在這個舒適的住處度過一段愉悅的時光。"></textarea>
        </div>

        <!-- Step Button -->
            <div class="d-flex justify-content-between">
                    <button class="btn btn-dark btn-lg" @click="previousStep">上一步</button>
                        <!-- if not completed , disabled button -->
                        <button class="btn btn-dark btn-lg" @click="nextStep" :disabled=" !selectedRoomContent ">
                            下一步
                        </button>
            </div>
    </div>
        
</template>
    
<script setup>
import { ref,onMounted,reactive } from 'vue';
import axiosapi from "@/plugins/axios";
import { useRouter,useRoute } from 'vue-router';

// define
const router =useRouter()
const route =useRoute()
const roomId = route.params.roomId
const selectedRoomContent=ref("")

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

// previousStep button
    const previousStep=()=>{
        router.push(`/roomCreate/step-two/${roomId}`)
    }

// nextStep button
    const nextStep=async()=>{
        if(!roomId){
            console.error("roomId 不存在，請檢查上一步。")
            return
        }
        // 傳送到後端的資料
            const roomData = items.reduce((acc, item) => {
                    acc[item.id] = item.value; 
                    return acc;
            }, {});
        roomData.roomContent = selectedRoomContent.value;

        try{
            // 發送 POST 請求到後端
                const response=await axiosapi.post(`/room/provider/create/step-three/${roomId}`,roomData)

            // 跳轉到step four組件畫面
            router.push({
                    path:`/roomCreate/step-four/${roomId}`,
                    query: { roomId },
            })
        }catch(error){
            console.log("error",error.message)
        }
    }
    
</script>
    
<style scoped>
.space-control{
    margin-bottom: 40px; /* 每個區塊之間增加間距 */
}
.item-btn {
  width: 40px;
  height: 40px;
  font-size: 18px;
  line-height: 1.2;
  display: flex;
  align-items: center;
  justify-content: center;
}
.label-style{
    font-size: 40px;   /* 調整字體大小 */
    font-weight: bold;
}
.item-style{
    font-size: 25px;
}
    
</style>