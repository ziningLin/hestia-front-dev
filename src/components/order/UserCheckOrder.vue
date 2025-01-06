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
              @change="findOrdersById" 
              class="form-control" 
              placeholder="輸入 起始日期"
            />
          </div>
          <div class="col">
            <label for="status">選擇 結束日期</label>
            <input 
              type="date" 
              v-model="request.endSearchDate" 
              @change="findOrdersById" 
              class="form-control" 
              placeholder="輸入 結束日期"
            />
          </div>
          <div class="col">
            <!-- <input 
              type="text" 
              
              @change="findOrdersById" 
              class="form-control" 
              placeholder="輸入 狀態 ID"
            /> -->
                     <label for="status">請選擇狀態</label>
            <select  v-model="request.stateId" @change="findOrdersById" 
            class="form-control"  placeholder="狀態查詢">
  <option value="38">完成</option>
  <option value="31">已付款</option>
  <option value="33">未付款取消</option>
  <option value="36">退款完成</option>
 
</select>
          </div>
          <div class="col">
            <label for="status">輸入 查詢內容</label>
            <input 
              type="text" 
              v-model="request.searchInput" 
              @change="findOrdersById" 
              class="form-control" 
              placeholder="輸入 查詢內容"
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
              <th scope="col">訂單總價</th>
              <th scope="col">訂購房間數</th>
              <th scope="col">訂購日期</th>
              <th scope="col">狀態</th>
              <th scope="col">詳細訂單</th>
              <th scope="col">退款</th>
              <th scope="col">評價</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in orders" :key="order.orderId">
              <OrderList :item="order" @checkRefund="checkRefund" />
            </tr>
          </tbody>
        </table>
      </div>
  
      <!-- 分頁 -->
      <!-- <div class="row"> -->
        <div class="d-flex justify-content-center mt-3" v-if="totalPages > 1">
          <Paginate 
            v-model="currentPage" 
            :page-count="totalPages" 
            :click-handler="findOrdersById" 
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
  import OrderList from './UserOrderList.vue';
  import { ref, reactive, onMounted } from 'vue';
  import axios from '../../plugins/axios.js';
  import Swal from 'sweetalert2';
  const apiBaseUrl = import.meta.env.VITE_API_URL;
  
  const orders = reactive([]);
  const currentPage = ref(1);
  const totalPages = ref(1);
  const totalElements = ref(0);
  const request = reactive({
    userId: 1,
    startSearchDate: null,
    endSearchDate: null,
    stateId: null,
    searchInput: null
  });
  
  async function findOrdersById() {
    try {
      request.pageNum = currentPage.value - 1;
      const response = await axios.post(
        // 'http://192.168.33.158:8080/hestia/userOrders/findOrders',
        `${apiBaseUrl}/userOrders/findOrders`,
        request
      );
      const responseOrders = response.data.userOrders;
      totalElements.value = responseOrders.totalElements;
      currentPage.value = responseOrders.pageable.pageNumber + 1;
      totalPages.value = responseOrders.totalPages;
      orders.length = 0;

      orders.push(...responseOrders.content);
      for (const order of orders) {
      const detailResponse = await axios.get(
        `${apiBaseUrl}/userOrders/findOrder/${order.orderId}`
      );
      const orderDetails = detailResponse.data.orderDetails;
      
      // 計算房間數量和總金額
      order.orderRoomCount = orderDetails.length;
      order.totalPrice = orderDetails.reduce((sum, detail) => sum + detail.purchasedPrice, 0);
    }
    } catch (error) {
      console.error('查詢訂單失敗:', error);
    }
  }
  
  async function checkRefund(id) {
    try {
      const response = await axios.get(
        // `http://192.168.33.158:8080/hestia/userOrders/refund/check/${id}`
        `${apiBaseUrl}/userOrders/refund/check/${id}`
      );
      let result;
      if (response.data.success) {
        result = await Swal.fire({
          icon: 'success',
          title: response.data.message,
          showConfirmButton: true,
          confirmButtonText: '確定申請退款',
          showDenyButton: true
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
 
          const refundRequest = { orderId: id };
          const refundResponse = await axios.post(
            `${apiBaseUrl}/userOrders/refund/autoRefund`,
            refundRequest
          );
          Swal.fire({
            icon: 'success',
            title: refundResponse.data.message || '退款申請已提交！'
          });
        }
      } else {
        result = await Swal.fire({
          icon: 'warning',
          title: `${response.data.message}\n是否要申請?`,
          showDenyButton: true,
          denyButtonText: '拒絕',
          showConfirmButton: true,
          confirmButtonText: '手動申請退款'
        });
        if (result.isConfirmed) {
          const inputResult = await Swal.fire({
            title: '輸入退款原因',
            input: 'textarea',
            inputPlaceholder: '請輸入退款原因...',
            showCancelButton: true,
            confirmButtonText: '提交',
            cancelButtonText: '取消',
            inputValidator: (value) => {
              if (!value) {
                return '退款原因不能為空！';
              }
            }
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
              orderId: id,
              refundReason: inputResult.value
            };
            const refundResponse = await axios.post(
              `${apiBaseUrl}/userOrders/refund/applyRefund`,
              refundRequest
            );
            Swal.fire({
              icon: 'success',
              title: refundResponse.data.message || '退款申請已提交！'
            });
          }
        }
      }
      findOrdersById();
    } catch (error) {
      console.error('退款處理失敗:', error);
      Swal.fire({
        icon: 'error',
        title: '發生錯誤',
        text: error.message || '無法完成操作，請稍後再試！'
      });
    }
  }
  
  onMounted(()=>{findOrdersById()
  }

  );
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
  </style>

<!-- <template>
    <h3>查詢訂單</h3>
    <input type="text" v-model = "request.userId"  @change = "findOrdersById"  placeholder="輸入 User ID">
    <input type="date" v-model = "request.startSearchDate"  @change = "findOrdersById"  placeholder="輸入 起始日期">
    <input type="date" v-model = "request.endSearchDate"  @change = "findOrdersById"  placeholder="輸入 結束日期">
    <input type="text" v-model = "request.stateId"  @change = "findOrdersById"  placeholder="輸入 狀態 ID">
    <input type="text" v-model = "request.searchInput"  @change = "findOrdersById"  placeholder="輸入 查詢內容">
    <table class="table">
        <thead>
            <tr>
            <th scope="col">訂單編號</th>
            <th scope="col">訂單總價</th>
            <th scope="col">訂購房間數</th>
            <th scope="col">訂購日期</th>
            <th scope="col">狀態</th>
            <th scope="col">詳細訂單</th>
            <th scope="col">退款</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="order in orders" :key="order.orderId">
                <OrderList :item = "order" @checkRefund = "checkRefund"></OrderList>
            </tr>
        </tbody>
    </table>      
    <div class="row">
        <div class="col-6" v-show="totalElements>0">
            <Paginate 
                v-model="currentPage"    
                :page-count="totalPages"
                :click-handler="findOrdersById"
                :initial-page="currentPage"
                :first-last-button="true"
                first-button-text="&lt;&lt;"
                last-button-text="&gt;&gt;"
                prev-text="&lt;"
                next-text="&gt;">
            </Paginate>
        </div>
    </div>


</template>
    
<script setup>
import Paginate from 'vuejs-paginate-next';
import OrderList from './UserOrderList.vue';
import { onMounted, ref } from 'vue';
import { reactive } from 'vue';
import axios from 'axios';
import Swal from 'sweetalert2';
    // const userId = ref(1);
    // const startDate = ref("");
    // const endDate = ref("");
    // const stateId = ref(0);
    const orders = reactive([]);
    const currentPage = ref(1);
    const totalPages = ref(1);
    const totalElements = ref(0);
   
    const request = reactive({
    "userId":1,
    "startSearchDate":null,
    "endSearchDate":null,
    "stateId":null,
    "searchInput":null
})

    async function findOrdersById(){
        try{
            request.pageNum = currentPage.value-1;
        
        const response = await axios.post("http://localhost:8080/hestia/userOrders/findOrders",request);
        console.log(response.data.
userOrders
        )
        let responseOrders = response.data.userOrders;
        totalElements.value = responseOrders.totalElements;
        currentPage.value = responseOrders.pageable.pageNumber +1;
        totalPages.value = responseOrders.totalPages;

        orders.length = 0;

        orders.push(...responseOrders.content); 

        console.log("orders",orders);

        }catch(error){

        }
    }
    onMounted(
        ()=>{
            findOrdersById();
        }
    );
    async function checkRefund(id){
        try{
        
        const response = await axios.get("http://localhost:8080/hestia/userOrders/refund/check/"+id);
        console.log(response.data
        )
    let result;
        if (response.data.success){
            console.log("response.data.success")
            result = await Swal.fire({
                    icon: "success",
                    title: response.data.message,
                    showConfirmButton:true,
                    confirmButtonText:"確定申請退款",
                    showDenyButton:true,
                })
                if (result.isConfirmed){
                    const refundRequest = {
                    orderId: id,
                };
                const refundResponse = await axios.post("http://localhost:8080/hestia/userOrders/refund/autoRefund",refundRequest);
                console.log(refundResponse.data)

                Swal.fire({
                    icon: "success",
                    title: refundResponse.data.message || "退款申請已提交！",
                });

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
                    orderId: id,
                    refundReason: inputResult.value, // 獲取用戶輸入的退款原因
                };
            
            const refundResponse = await axios.post("http://localhost:8080/hestia/userOrders/refund/applyRefund",refundRequest)
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

          
        findOrdersById();
    } catch (error) {
        console.error("發生錯誤:", error);
        Swal.fire({
            icon: "error",
            title: "發生錯誤",
            text: error.message || "無法完成操作，請稍後再試！",
        });
    }
}
</script>
    
<style>
    
</style> -->