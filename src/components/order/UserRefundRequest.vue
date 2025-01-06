<template>
    <div class="mb-3">
        <div class="row g-3">

          <div class="col">
            <label for="status">選擇 起始日期</label>
            <input 
              type="date" 
              v-model="request.startSearchDate" 
              @change="findRefundRequestById" 
              class="form-control" 
              placeholder="輸入 起始日期"
            />
          </div>
          <div class="col">
            <label for="status">選擇 結束日期</label>
            <input 
              type="date" 
              v-model="request.endSearchDate" 
              @change="findRefundRequestById" 
              class="form-control" 
              placeholder="輸入 結束日期"
            />
          </div>

          
        </div>
      </div>
      <div class="table-container">
        <table class="table table-striped table-hover">
        <thead >
          <tr>
            <th scope="col">退款申請編號</th>
            <th scope="col">退款時間</th>
            <th scope="col">退款理由</th>
            <th scope="col">退款金額</th>
            <th scope="col">退款狀態</th>
            <th scope="col">詳細</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="refundRequest in refundRequests" :key="refundRequest.refundRequestId">
            <td>
              <span class="badge text-bg-light">{{ refundRequest.refundRequestId }}</span>
            </td>
            <td>
              <span class="badge text-bg-light">{{ refundRequest.date }}</span>
            </td>
            <td>
              <span class="badge text-bg-light">{{ refundRequest.refundReason }}</span>
            </td>
            <td>
              <span class="badge text-bg-light">{{ refundRequest.totalPriceRefund }}</span>
            </td>
            <!-- <td>
              <span
                :class="{
                  'badge bg-success': refundRequest.stateContent === '已完成',
                  'badge bg-warning': refundRequest.stateContent === '進行中',
                  'badge bg-danger': refundRequest.stateContent === '被拒絕',
                }"
                class="fs-6"
              >
                {{ refundRequest.stateContent }}
              </span>
            </td> -->
            <td>{{ refundRequest.stateContent }}
              <!-- <span v-if = "refundRequest.stateContent == '退款申請中'" class = "text-warning" style="font-weight: 600;">{{ refundRequest.stateContent}}</span>
        <span v-if = "refundRequest.stateContent == '退款申請通過'" class = "text-success" style="font-weight: 600;">{{ refundRequest.stateContent}}</span>

        <span v-if = "refundRequest.stateContent == '退款申請拒絕'" class = "text-danger" style="font-weight: 600;">{{ refundRequest.stateContent}}</span> -->
</td>
            <td>
              <button class="btn btn-primary btn-sm" @click="viewOrderDetail(refundRequest.orderId)">
                查看訂單
              </button>
            </td>
          </tr>
        </tbody>
      </table>
  
      <!-- 分頁 -->
      <div class="d-flex justify-content-center mt-3" v-if="totalPages > 1">
        <Paginate
          v-model="currentPage"
          :page-count="totalPages"
          :click-handler="findRefundRequestById"
          :initial-page="currentPage"
          :first-last-button="true"
          first-button-text="&laquo;"
          last-button-text="&raquo;"
          prev-text="&lsaquo;"
          next-text="&rsaquo;"
          class="pagination"
        ></Paginate>
      </div>
    </div>
  </template>
    
<script setup>
import Paginate from 'vuejs-paginate-next';
import { ref, onMounted, reactive } from 'vue';
import { useRoute } from 'vue-router';
import axios from '../../plugins/axios.js';
import Swal from 'sweetalert2';
import router from '../../routers/router';
const apiBaseUrl = import.meta.env.VITE_API_URL;
const route = useRoute(); // 取得路由參數
const currentPage = ref(1);
    const totalPages = ref(1);
    const totalElements = ref(0);

const request = reactive({
    startSearchDate:null,
    endSearchDate:null

})
const refundRequests = reactive([]);

async function findRefundRequestById(){
    request.pageNum = currentPage.value-1;
    try {

      console.log(request);
        const response = await axios.post(`${apiBaseUrl}/userOrders/refundRequests`,request);
        let userRefundRequest = response.data.userRefundRequest;
    totalElements.value = userRefundRequest.totalElements;
    currentPage.value = userRefundRequest.pageable.pageNumber +1;
    totalPages.value = userRefundRequest.totalPages;

    console.log(response.data.userRefundRequest)
    refundRequests.length = 0;
    refundRequests.push(...userRefundRequest.content)
    } catch (error) {
        
    }
    

}
function viewOrderDetail(orderId) {
    console.log("orderId" + orderId)
        router.push(`/order/orderDetail/${orderId}`); // 跳轉到詳細資訊頁面
    }


onMounted(
    ()=>{
        findRefundRequestById();
    }
)

    
</script>
    
<style scoped>
    .refund-request-container {
  max-width: 90%;
  margin: auto;
  padding: 1rem;
}

/* 表格樣式 */


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

/* 分頁樣式 */
.pagination {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
}

.pagination li {
  list-style: none;
}
</style>