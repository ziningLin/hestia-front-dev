<template>
     <div class="container my-4">
      <!-- 標題 -->
      <!-- <h3 class="text-center mb-4">查詢訂單</h3> -->
  
      <!-- 查詢條件 -->
      <div class="mb-3">
        <div class="row g-3">

          <div class="col">
            <label for="status">選擇 起始日期</label>
            <input 
              type="date" 
              v-model="request.startSearchDate" 
              @change="getReservedRooms" 
              class="form-control" 
              placeholder="輸入 起始日期"
            />
          </div>
          <div class="col">
            <label for="status">選擇 結束日期</label>
            <input 
              type="date" 
              v-model="request.endSearchDate" 
              @change="getReservedRooms" 
              class="form-control" 
              placeholder="輸入 結束日期"
            />
          </div>

         
        </div>
      </div>
  
  
      <!-- 訂單列表 -->
      <div class="table-container">
        <table class="table table-striped table-hover">
          <thead>
            <tr>
              <th scope="col">訂單編號</th>
              <th scope="col">圖片</th>
              <th scope="col">房間名稱</th>
              <th scope="col">下單時間</th>
              <th scope="col">入住日期</th>
              <th scope="col">結束日期</th>
              <th scope="col">訂購房間數</th>
              <th scope="col">訂購人姓名</th>
              <th scope="col">訂購人信箱</th>
              <th scope="col"></th>
             
              
            </tr>
          </thead>
          <tbody>
            <template v-for="reseveredRoom in reseveredRooms">
            <tr  @click="toggleRowDetails(reseveredRoom.roomId,reseveredRoom.orderId,reseveredRoom.checkInDate)">
                <td>{{ reseveredRoom.orderId }}</td>
                <td><img :src="'data:image/jpeg;base64,' + reseveredRoom.mainImage" alt="Room Image" class="img-thumbnail" style="  max-width: 160px;"/></td>
              <td>{{ reseveredRoom.roomName }}</td>
              <td>{{ reseveredRoom.orderingDate }}</td>

              <td>{{ reseveredRoom.checkInDate }}</td>
              <td>{{ reseveredRoom.maxDatePlusOne}}</td>
              <td>{{ reseveredRoom.roomCount}}</td>
              <td>{{ reseveredRoom.userName}}</td>
              <td><span>{{ reseveredRoom.userContactInfo}}</span>
                <br>
 <a :href="`mailto:${reseveredRoom.providerContactInfo
}?subject=房間訂購問題-訂單${reseveredRoom.orderId }?body=您好:`" style="text-decoration: none;"><button type="button" class="btn btn-outline-primary">發送信件</button></a>
              </td>
              <td><button type="button" class="btn btn-success" @click="completeTheOrder( reseveredRoom.roomId,reseveredRoom.orderId,reseveredRoom.checkInDate)">完成訂單</button></td>
 
            </tr>
            <tr
          v-if="expandedRowId.roomId === reseveredRoom.roomId &&
                expandedRowId.orderId === reseveredRoom.orderId &&
                expandedRowId.checkInDate === reseveredRoom.checkInDate"
          :key="'details-' + reseveredRoom.roomId + '-' + reseveredRoom.orderId + '-' + reseveredRoom.checkInDate"
        >
          <td colspan="9">
            <div class="details-container">
              <table class="table">
                <thead>
                  <tr>
                    <th>日期</th>
                    <template v-for="detail in expandedDetails" :key="detail.date">
                      <th>{{ detail.availableDate }}</th>
                    </template>
                   
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th>數量</th>
                    <template v-for="detail in expandedDetails" :key="detail.date">
                      <td>{{ detail.roomCount }}</td>
                    </template>
                  </tr>
                </tbody>
              </table>
            </div>
          </td>
        </tr>
      </template>
          </tbody>
        </table>
      </div>
  
      <!-- 分頁 -->
      <!-- <div class="row"> -->
        <div class="d-flex justify-content-center mt-3" v-if="totalPages > 1">
          <Paginate 
            v-model="currentPage" 
            :page-count="totalPages" 
            :click-handler="getReservedRooms" 
            :initial-page="currentPage" 
            :first-last-button="true" 
            first-button-text="&lt;&lt;" 
            last-button-text="&gt;&gt;" 
            prev-text="&lt;" 
            next-text="&gt;"
          />
        </div>
      </div>
    <!-- </div> -->
        
</template>
    
<script setup>
  import Paginate from 'vuejs-paginate-next';
  import { ref, reactive, onMounted } from 'vue';
  import axios from '../../plugins/axios.js';
  import Swal from 'sweetalert2';
  const apiBaseUrl = import.meta.env.VITE_API_URL;
const currentPage = ref(1);
const totalPages = ref(1);
const totalElements = ref(0);
const reseveredRooms = reactive([]);
const expandedRowId  = reactive({

}); // 紀錄展開的行 ID
const expandedDetails = reactive([]); // 紀錄展開行的詳細資料

const  request = reactive({
        "providerId":1,
        startSearchDate: null,
        endSearchDate: null,
        searchInput: null
        })

async function getReservedRooms()
    {
        try {
            request.pageNum = currentPage.value - 1;
            const response = await axios.post(
                `${apiBaseUrl}/providerOrders/reserved`,
                request
                );
               const responseData = response.data;
               reseveredRooms.length = 0;
               console.log("responseData")
               console.log(responseData)
               reseveredRooms.push(...responseData.reservedRoom.content
               );
               totalElements.value = responseData.reservedRoom.totalElements;
      currentPage.value = responseData.reservedRoom.pageNumber + 1;
      totalPages.value = responseData.reservedRoom.totalPages;
               console.log("reseveredRooms")
        console.log(reseveredRooms)
        } catch (error) {
            error
        }
    }

    async function toggleRowDetails(roomId, orderId, checkInDate) {
  if (
    expandedRowId.roomId === roomId &&
    expandedRowId.orderId === orderId &&
    expandedRowId.checkInDate === checkInDate
  ) {
    // 如果點擊的是相同行，則隱藏
    expandedRowId.roomId = null;
    expandedRowId.orderId = null;
    expandedRowId.checkInDate = null;
    expandedDetails.length = 0;
  } else {
    // 展開新的行
    expandedRowId.roomId = roomId;
    expandedRowId.orderId = orderId;
    expandedRowId.checkInDate = checkInDate;

    try {
      const response = await axios.post(
        `${apiBaseUrl}/providerOrders/reservedRoomDetails`,
        {
          roomId,
          orderId,
          checkInDate,
        }
      );
      expandedDetails.length = 0;
      console.log(response.data)
      expandedDetails.push(...response.data); // 假設 API 回傳為 details 陣列
    } catch (error) {
      console.error(error);
    }
  }
}

//     async function toggleRowDetails(roomId,orderId,checkInDate) {
//   if (expandedRow.roomId === roomId &&expandedRow.orderId ===orderId && expandedRow.checkInDate === checkInDate) {
//     // 如果點擊的是相同行，則隱藏
//     expandedRowId.value = null;
//     expandedDetails.length = 0;
//   } else {
//     // 展開新的行
//     expandedRowId.value = roomId;
//     try {
//       const response = await axios.get(
//         `${apiBaseUrl}/providerOrders/reserved/${roomId}/details`
//       );
//       expandedDetails.length = 0;
//       expandedDetails.push(...response.data.details); // 假設 API 回傳為 details 陣列
//     } catch (error) {
//       console.error(error);
//     }
//   }
// }
    async function    completeTheOrder(roomId,orderId,checkInDate){

      const result = await Swal.fire({
          icon: 'warning',
          title: "確認是否完成訂單",
          showDenyButton: true,
          denyButtonText: '拒絕',
          showConfirmButton: true,
          confirmButtonText: '確定'
        });
        if (result.isConfirmed){
          const completeOrderRequest = {
            "roomId":roomId,
            "orderId":orderId,
            "checkInDate":checkInDate
      }
      Swal.fire({
        title: "處理中...",
        text: "請稍候",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      })
      const response = await axios.post(
                `${apiBaseUrl}/providerOrders/orderComplete`,
                completeOrderRequest
                );
                const responseData = response.data;
                if(responseData.success){
                await Swal.fire({
                  icon: 'success',
                  title:"成功完成訂單"
                });
                getReservedRooms();
                }
                else{
                  await Swal.fire({
                  icon: 'error',
                  title:"發生錯誤"
                });
                }

        }
      
    }
    
    onMounted(
        ()=>{
            getReservedRooms();
        }
    )
</script>
    
<style scoped>
.table-container {
    overflow-x: auto;
  }
  
  .table {
    font-size: 0.9rem;
    border: 1px solid #dee2e6;
    border-radius: 4px;
  }
  
  .table th,
  .table td {
    text-align: center;
    vertical-align: middle;
  }
  
  .table-striped tbody tr:nth-child(odd) {
    background-color: #f2f2f2;
  }
  
  .table-hover tbody tr:hover {
    background-color: #e9ecef;
  }
    
</style>