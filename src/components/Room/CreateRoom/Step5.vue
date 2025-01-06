<template>
    <div class="mb-5 mt-5">
        <!-- Images -->
        <div class="space-control">
            <label for="roomFacility" class="form-label label-style" >為你的房源新增幾張相片</label><br>
            <span>首先，你需要至少選擇 5 張相片。之後還可以新增或變更。</span><br><br>
            <div class="img-div">
                 <!-- 動態顯示上傳的圖片 -->
                    <template v-if="showImg.length">
                        <div v-for="(imgSrc, index) in showImg" :key="index" class="uploaded-img-container">
                            <img :src="imgSrc" alt="上傳的圖片" class="uploaded-img" />
                        </div>
                    </template>
                <!-- 預設按鈕，當前沒有圖片時顯示 -->
                    <div v-if="!showImg.length || showImg.length < 5" class="img-container">
                        <img src="/src/assets/room/camera.svg"><br>
                        <button @click="showImgsUpload" class="img-btn">新增相片</button>
                    </div>
            </div>
        </div>

         <!-- mainImage -->
         <div class="space-control">
            <label for="roomFacility" class="form-label label-style" >做為主要相片</label><br>
            <span>只能選擇 1 張做為主要相片。</span><br><br>
            <div class="mainImg-div">
                 <!-- 動態顯示上傳的圖片 -->
                    <template v-if="showMainImg.length">
                        <div v-for="(imgSrc, index) in showMainImg" :key="index" class="uploaded-img-container">
                            <img :src="imgSrc" alt="上傳的圖片" class="uploaded-img" />
                        </div>
                    </template>
                <!-- 預設按鈕，當前沒有圖片時顯示 -->
                    <div v-if="!showMainImg.length" class="img-container">
                        <img src="/src/assets/room/camera.svg"><br>
                        <button @click="showMainImgUpload" class="img-btn">新增相片</button>
                    </div>
            </div>
        </div>

        <!-- Step Button -->
        <div class="d-flex justify-content-between">
                    <button class="btn btn-dark btn-lg" @click="previousStep">上一步</button>
                        <!-- if not completed , disabled button -->
                        <button class="btn btn-dark btn-lg" @click="nextStep">
                            完成
                        </button>
        </div>
    </div>
        
</template>
    
<script setup>
import { ref } from 'vue';
import axiosapi from "@/plugins/axios";
import { useRoute,useRouter } from 'vue-router';
import Swal from 'sweetalert2';

// define
const router =useRouter()
const route =useRoute()
const roomId = route.params.roomId
const selectedImgs=ref([])
const selectedMainImg=ref([])
const showImg=ref([])
const showMainImg=ref([])

// mainImage
const showMainImgUpload=()=>{
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
        didOpen:()=>{
            // 在 SweetAlert2 彈窗打開後，綁定事件
                const uploadButton=document.getElementById("upload-button")
                const fileInput = document.getElementById("file-input");
                
                uploadButton.addEventListener("click", () => {
                    fileInput.click();
                });
            },
        preConfirm: async ()=>{
            const files=document.getElementById("file-input").files
            if(!files.length){
                await Swal.fire("請至少選擇 1 張圖片")
                return false; // 中止流程
            }
            if (files.length > 1) {
                await Swal.fire("只能選擇 1 張作為主圖片！");
                return false; // 中止流程
            }
            return Array.from(files)
        }, 
    }).then((result)=>{
        if (result.isConfirmed) {
            // 生成圖片預覽 URL 並保存到 selectedImgs
            showMainImg.value = result.value.map((file) => URL.createObjectURL(file));
            selectedMainImg.value=result.value

            Swal.fire(`${result.value.length} 張圖片已成功上傳`);
        }
    })
}

// Images
const showImgsUpload=()=>{
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
        didOpen:()=>{
            // 在 SweetAlert2 彈窗打開後，綁定事件
                const uploadButton=document.getElementById("upload-button")
                const fileInput = document.getElementById("file-input");
                
                uploadButton.addEventListener("click", () => {
                    fileInput.click();
                });
            },
        preConfirm: async ()=>{
            const files=document.getElementById("file-input").files
            if(!files.length){
                await Swal.fire("請至少選擇 1 張圖片")
                return false; // 中止流程
            }
            if (files.length < 5) {
                await Swal.fire("至少需要上傳 5 張圖片！");
                return false; // 中止流程
            }
            return Array.from(files)
        }, 
    }).then((result)=>{
        if (result.isConfirmed) {
            // 生成圖片預覽 URL 並保存到 selectedImgs
            showImg.value = result.value.map((file) => URL.createObjectURL(file));
            selectedImgs.value=result.value

            Swal.fire(`${result.value.length} 張圖片已成功上傳`);
        }
    })
}

// previousStep button
    const previousStep=()=>{
        router.push(`/roomCreate/step-four/${roomId}`)
    }

// nextStep button
    const nextStep=async()=>{
        console.log(selectedImgs.value)
        console.log(selectedMainImg.value)
        if(!roomId){
            console.error("roomId 不存在，請檢查上一步。")
            return
        }

        // 傳送到後端的資料
            const formData = new FormData()
            formData.append("roomId", roomId)

            // 添加 images 到 FormData
            if (selectedImgs.value.length) {
                selectedImgs.value.forEach((file) => {
                formData.append("roomImages", file)
            })
            } else {
                await Swal.fire("請至少上傳 5 張圖片")
                return
            }

            // 添加 mainImage 到 FormData

            if (selectedMainImg.value.length) {
                formData.append("mainImage", selectedMainImg.value[0]); // 只取第一張作為主圖 
            } else {
                console.error("mainImage 不存在，請檢查主圖是否已上傳。")
                await Swal.fire("請選擇 1 張主圖片")
                return
            }

        try{
            // 發送 POST 請求到後端
            console.log(formData.mainImage);
            

                await axiosapi.post(`/room/provider/create/step-five/${roomId}`,formData,
                 {headers: { "Content-Type": "multipart/form-data" }},)
            // 跳轉到 Finish 組件畫面
            router.push({path:"/roomCreate/finish",})
        }catch(error){
            console.log("error",error.message)
        }
    }
    
</script>
    
<style scoped>
.space-control{
    margin-bottom: 40px; /* 每個區塊之間增加間距 */
}
.label-style{
    font-size: 30px;   /* 調整字體大小 */
    font-weight: bold; /* 加粗字體 */
}
img{
    width:150px;
    height:100px;
}
.img-div{
    border:2px dashed gray;
    background-color: #F0F0F0;
    width:100%;
    height:350px;
    border-radius: 20px;
    display: flex;
    flex-direction: column; /* 垂直排列元素 */
    justify-content: center; /* 垂直居中 */
    align-items: center; /* 水平居中 */
    display: grid;
    grid-template-columns: repeat(5, 1fr); /* 每行顯示 3 張圖片 */
    gap: 10px; /* 每張圖片之間的間距 */
    justify-items: center;
}
.mainImg-div{
    border:2px dashed gray;
    background-color: #F0F0F0;
    width:100%;
    height:350px;
    border-radius: 20px;
    display: flex;
    flex-direction: column; /* 垂直排列元素 */
    justify-content: center; /* 垂直居中 */
    align-items: center; /* 水平居中 */
    display: grid;
    justify-items: center;

}
.uploaded-img-container {
    display: flex;
    flex-direction: column; /* 垂直排列元素 */
    justify-content: center; /* 垂直居中 */
    align-items: center; /* 水平居中 */
    width: 200px;
    height: 200px;
    overflow: hidden;
    border: 1px solid #ddd;
    border-radius: 5px;
    position: relative;
}
.uploaded-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}
.img-btn{
    width:110px;
    height:50px;
    background-color:white;
    border-radius: 8px;
}
.img-container{
    display: flex;
    flex-direction: column; /* 垂直排列元素 */
    justify-content: center; /* 垂直居中 */
    align-items: center; /* 水平居中 */
    height: 100%; /* 保證容器有高度 */
    width: 100%; /* 保證容器有寬度 */
    position: absolute; /* 絕對定位 */
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
    
</style>