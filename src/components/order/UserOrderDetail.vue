<template>
    <div class="container my-4">
      <!-- 標題 -->
      <h3 class="text-center mb-4">訂單詳細資訊</h3>
  
      <!-- 訂單列表 -->
      <div class="table-container">
        <table class="table table-striped table-hover">
          <thead>
            <tr>
              <th scope="col">圖片</th>
              <th scope="col">房間名稱</th>
              <th scope="col">購買價格</th>
              <th scope="col">下單時間</th>
              <th scope="col">預定日期</th>
              <th scope="col">單人床數量</th>
              <th scope="col">雙人床數量</th>
              <th scope="col">房間數量</th>
              <th scope="col">入住時間</th>
              <th scope="col">退房時間</th>
              <th scope="col">狀態</th>
              <th scope="col">退款</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="detail in orderDetails" :key="detail.id">
              <td><img :src="'data:image/jpeg;base64,' + detail.mainImage" alt="Room Image" class="img-thumbnail" /></td>
              <td>{{ detail.roomName }}</td>
              <td>{{ detail.purchasedPrice }}</td>
              <td>{{ detail.orderingDate }}</td>
              <td>{{ detail.bookededDate }}</td>
              <td>{{ detail.singleBed && detail.singleBed>0 ? `包含單人床: ${detail.singleBed}張` : '無單人床' }}</td>
              <td>{{ detail.doubleBed && detail.doubleBed>0 ? `包含雙人床: ${detail.doubleBed}張` : '無雙人床' }}</td>
              <td>{{ detail.bedroomCount && detail.bedroomCount>0? `共有: ${detail.bedroomCount}間臥室` : '沒有設定' }}</td>
              <td>{{ detail.checkinTime }}</td>
              <td>{{ detail.checkoutTime }}</td>
              <td><span v-if = "detail.state == '未付款取消'" class = "text-secondary">{{ detail.state}}</span>
        <span v-if = "detail.state == '完成'" class = "text-success" style="font-weight: 600;">{{ detail.state}}</span>
        <span v-if = "detail.state == '已付款'" class = "text-primary" style="font-weight: 600;">{{ detail.state}}</span>
        <span v-if = "detail.state == '退款完成'" class = "text-danger" style="font-weight: 600;">{{ detail.state}}</span>
        <span v-if = "detail.state == '未付款'" class = "text-warning" style="font-weight: 600;">{{ detail.state}}</span></td>
        
              <td>
                <div v-if="detail.state === '已付款' && detail.activeRefundRequest !== 1">
                  <button class="btn btn-warning btn-sm" @click="refund(detail.orderRoomId)">申請退款</button>
                </div>
                <div v-else-if="detail.activeRefundRequest === 1">
                  <span class="badge text-bg-danger">退款目前申請中</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { useRoute } from 'vue-router';
  import axios from '../../plugins/axios.js';
  import Swal from 'sweetalert2';
  const apiBaseUrl = import.meta.env.VITE_API_URL;
  
  const route = useRoute();
  const orderDetails = ref([]);
  
  async function fetchOrderDetails() {
    try {
      const response = await axios.get(
        `${apiBaseUrl}/userOrders/findOrder/${route.params.id}`
      );
      if (response.data.success) {
        console.log(response.data)
        orderDetails.value = response.data.orderDetails;
      }
    } catch (error) {
      console.error("查詢訂單詳細資訊失敗:", error);
    }
  }
  
  async function refund(orderRoomId) {
    try {
      const response = await axios.get(
        `${apiBaseUrl}/userOrders/refund/check/orderDetails/${orderRoomId}`
      );
      let result;
      if (response.data.success) {
        result = await Swal.fire({
          icon: "success",
          title: response.data.message,
          showConfirmButton: true,
          confirmButtonText: "確定申請退款",
          showDenyButton: true,
        });
        if (result.isConfirmed) {
          Swal.fire({
      title: "處理中...",
      text: "請稍候",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });
          const refundRequest = { orderDetailsId: orderRoomId };
          const refundResponse = await axios.post(
            `${apiBaseUrl}/userOrders/refund/autoRefund/Details`,
            refundRequest
          );
          Swal.fire({
            icon: "success",
            title: refundResponse.data.message || "退款申請已提交！",
          });
          fetchOrderDetails();
        }
      } else {
        result = await Swal.fire({
          icon: "warning",
          title: `${response.data.message}\n是否要申請?`,
          showDenyButton: true,
          denyButtonText: "拒絕",
          showConfirmButton: true,
          confirmButtonText: "手動申請退款",
        });
        if (result.isConfirmed) {
          const inputResult = await Swal.fire({
            title: "輸入退款原因",
            input: "textarea",
            inputPlaceholder: "請輸入退款原因...",
            showCancelButton: true,
            confirmButtonText: "提交",
            cancelButtonText: "取消",
            inputValidator: (value) => {
              if (!value) {
                return "退款原因不能為空！";
              }
            },
          });
          if (inputResult.isConfirmed) {
            Swal.fire({
      title: "處理中...",
      text: "請稍候",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });
            const refundRequest = {
              orderRoomId: orderRoomId,
              refundReason: inputResult.value,
            };
            const refundResponse = await axios.post(
              `${apiBaseUrl}/userOrders/refund/applyRefund/OrderDetails`,
              refundRequest
            );
            fetchOrderDetails();
            Swal.fire({
              icon: "success",
              title: refundResponse.data.message || "退款申請已提交！",
            });
          }
        }
      }
    } catch (error) {
      console.error("退款處理失敗:", error);
    }
  }
  
  onMounted(fetchOrderDetails);
  </script>
  
  <style scoped>
  .container {
    max-width: 90%;
    margin: auto;
    padding: 0 1rem;
  }
  
  h3 {
    font-size: 1.8rem;
    color: #333;
  }
  
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
  
  .img-thumbnail {
    max-width: 100px;
    height: auto;
    border: 1px solid #ddd;
    border-radius: 4px;
  }
  </style>

<!-- <template>
    <div>
        <h3>訂單詳細資訊</h3>
        <table class="table">
            <thead>
                <tr>
                    <th scope="col">圖片</th>
                    <th scope="col">房間名稱</th>
                    <th scope="col">購買價格</th>
                    <th scope="col">下單時間</th>
                    <th scope="col">預定日期</th>
                    <th scope="col">單人床數量</th>
                    <th scope="col">雙人床數量</th>
                    <th scope="col">房間數量</th>
                    <th scope="col">入住時間</th>
                    <th scope="col">退房時間</th>
                    <th scope="col">狀態</th>
                    <th scope="col">退款</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="detail in orderDetails" :key="detail.id">
                    <td>
                        <img :src="'data:image/jpeg;base64,' + detail.mainImage" alt="">
                    </td>
                    <td>
                        <h4>
                           <span class="badge text-bg-light">{{ detail.roomName }}</span>
                        </h4> 
                    </td>
                    <td>
                        <h4><span class="badge text-bg-light">{{ detail.purchasedPrice }}</span></h4>
                        
                    </td>
                    <td>
                        <h4><span class="badge text-bg-light">{{ detail.orderingDate}}</span></h4>
                        
                    </td>
                    <td>
                        <h4><span class="badge text-bg-light">{{ detail.bookededDate }}</span></h4>
                        
                    </td>
                    <td>
                        <h4><span class="badge text-bg-light">{{ detail.singleBed && detail.singleBed>0 ? `包含單人床:${detail.singleBed}張` : '無單人床' }}</span></h4>
                        
                    </td>
                    <td>
                        <h4><span class="badge text-bg-light">{{ detail.doubleBed && detail.doubleBed>0 ? `包含雙人床:${detail.doubleBed}張` : '無雙人床' }}</span></h4>
                        
                    </td>
                    <td>
                        <h4><span class="badge text-bg-light">{{ detail.bedroomCount && detail.bedroomCount >0 ? `共有:${detail.bedroomCount}間臥室` : '沒有設定' }}</span></h4>
                        
                    </td>
                    <td>
                        <h4><span class="badge text-bg-light">{{ detail.chechinTime}}</span></h4>
                        
                    </td>
                    <td>
                        <h4><span class="badge text-bg-light">{{ detail.chechoutTime}}</span></h4>
                        
                    </td>
                    <td>
                        <h4> <span class="badge text-bg-light">{{ detail.state}}</span></h4>
                       
                    </td>
                    <td>                     
                        <h5 v-if="detail.state == '完成' && detail.activeRefundRequest!=1">
                            <button class="badge text-bg-warning" @click="refund(detail.orderRoomId)">申請退款</button>
                        </h5>
                        <h5 v-if="detail.activeRefundRequest==1">
                            <span class="badge text-bg-danger">退款目前申請中</span>
                        </h5>
                    </td>
                    
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';
import Swal from 'sweetalert2';

const route = useRoute(); // 取得路由參數
const orderDetails = ref([]);

async function fetchOrderDetails() {
    try {
        const response = await axios.get(`http://localhost:8080/hestia/userOrders/findOrder/${route.params.id}`);
        if (response.data.success) {
            orderDetails.value = response.data.orderDetails;
            console.log(response.data)
            let itemsInOrder = "";
            response.data.orderDetails.forEach(function(orderDetail){
                            itemsInOrder += orderDetail.roomName;
                            itemsInOrder += orderDetail.bookededDate;
                            itemsInOrder +="#";
                        })
                        console.log(itemsInOrder);
        }
    } catch (error) {
        console.error("查詢訂單詳細資訊失敗:", error);
    }
}

async function refund(orderRoomId){
    try{
        
        const response = await axios.get("http://localhost:8080/hestia/userOrders/refund/check/orderDetails/"+orderRoomId);
        console.log(response.data
        )
    let result;
        if (response.data.success){
            result = await Swal.fire({
                    icon: "success",
                    title: response.data.message,
                    showConfirmButton:true,
                    confirmButtonText:"確定申請退款",
                    showDenyButton:true,
                })
                if (result.isConfirmed){
                   
                    const refundRequest = {
                    "orderDetailsId": orderRoomId,
                };

                const refundResponse = await axios.post("http://localhost:8080/hestia/userOrders/refund/autoRefund/Details",refundRequest);

                Swal.fire({
                    icon: "success",
                    title: refundResponse.data.message || "退款申請已提交！",
                });
                fetchOrderDetails();
            }
        }else {
            result = await Swal.fire({
                    icon: "warning",
                    title: response.data.message+"\n是否要申請?",
                    showDenyButton:true,
                    denyButtonText:"拒絕",
                    showConfirmButton:true,
                    confirmButtonText:"手動申請退款",
                    
                });
                if (result.isConfirmed) {
            // 彈出一個輸入框讓用戶輸入退款原因
            const inputResult = await Swal.fire({
                title: "輸入退款原因",
                input: "textarea", // 使用文本輸入框
                inputPlaceholder: "請輸入退款原因...",
                showCancelButton: true,
                confirmButtonText: "提交",
                cancelButtonText: "取消",
                inputValidator: (value) => {
                    if (!value) {
                        return "退款原因不能為空！";
                    }
                },
            });

        if (inputResult.isConfirmed){
            console.log("isConfirmed")
            const refundRequest = {
                    orderRoomId: orderRoomId,
                    refundReason: inputResult.value, // 獲取用戶輸入的退款原因
                };
            
            const refundResponse = await axios.post("http://localhost:8080/hestia/userOrders/refund/applyRefund/OrderDetails",refundRequest)
            fetchOrderDetails();
        // orders.length = 0;

        // orders.push(...response.data.userOrders.content); 

        // console.log("orders",orders);

        Swal.fire({
                    icon: "success",
                    title: refundResponse.data.message || "退款申請已提交！",
                });
            }
        }
        }
        // orders.length = 0;

        // orders.push(...response.data.userOrders.content); 

        // console.log("orders",orders);
     
        }catch(error){

        }
}

onMounted(fetchOrderDetails);
</script> -->