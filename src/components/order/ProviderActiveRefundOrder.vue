<template>
    <div class="container mt-4">
      <!-- 表格區域 --><div class="mb-3">
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
      <div class="card">
        <div class="card-header bg-primary text-white">
          <h4 class="m-0">退款申請列表</h4>
        </div>
        <div class="card-body">
          <table class="table table-striped table-hover">
            <thead>
              <tr>
                <th scope="col">退款申請編號</th>
                <th scope="col">訂單編號</th>
                <th scope="col">退款時間</th>
                <th scope="col">退款理由</th>
                <th scope="col">退款金額</th>
                <th scope="col">退款用戶名稱</th>
                <th scope="col">退款用戶帳號</th>
                <th scope="col" class="text-center">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="refundRequest in refundRequests" :key="refundRequest.refundRequestId">
                <td>
                  <span class="badge text-bg-light">{{ refundRequest.refundRequestId }}</span>
                </td>
                <td>
                  <span class="badge text-bg-light">{{ refundRequest.orderId }}</span>
                </td>
                <td>
                  <span class="badge text-bg-light">{{ refundRequest.refundDate }}</span>
                </td>
                <td>
                  <span class="badge text-bg-light">{{ refundRequest.refundReason }}</span>
                </td>
                <td>
                  <span class="badge text-bg-light">${{ refundRequest.totalPriceRefund }}</span>
                </td>
                <td>
                  <span class="badge text-bg-light">{{ refundRequest.name }}</span>
                </td>
                <td>
                  <span class="badge text-bg-light">{{ refundRequest.userId }}</span>
                </td>
                <td class="text-center">
                  <button
                    type="button"
                    class="btn btn-success btn-sm"
                    @click="refundApproved(refundRequest.refundRequestId, refundRequest.refundForOrder)"
                  >
                    接受
                  </button>
                  <button
                    type="button"
                    class="btn btn-danger btn-sm"
                    @click="refundDenied(refundRequest.refundRequestId, refundRequest.refundForOrder)"
                  >
                    拒絕
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
  
      <!-- 分頁區域 -->
      <div class="d-flex justify-content-between mt-3 align-items-center">
        <div class="col-6" v-if="totalPages > 1">
          <Paginate
            v-model="currentPage"
            :page-count="totalPages"
            :click-handler="findRefundRequestById"
            :initial-page="currentPage"
            :first-last-button="true"
            first-button-text="&lt;&lt;"
            last-button-text="&gt;&gt;"
            prev-text="&lt;"
            next-text="&gt;"
          />
        </div>
        <div class="col-6 text-end">
          <span>總筆數: {{ totalElements }}</span>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import Paginate from 'vuejs-paginate-next';
  import { ref, onMounted, reactive } from 'vue';
  import axios from '../../plugins/axios.js';
  import Swal from 'sweetalert2';
  const apiBaseUrl = import.meta.env.VITE_API_URL;
  
  const currentPage = ref(1);
  const totalPages = ref(1);
  const totalElements = ref(0);
  
  const request = reactive({
    "providerId": 1,
    "pageNum": 0,
    "pageSize": 10,
    startSearchDate:null,
    endSearchDate:null
  });
  
  const refundRequests = reactive([]);
  
  // 獲取退款請求列表
  async function findRefundRequestById() {
    request.pageNum = currentPage.value - 1;
    try {
      const response = await axios.post(`${apiBaseUrl}/providerOrders/refundRequests`, request);
      let activeRefundRequestPage = response.data.activeRefundRequestPage;
  console.log(response.data)
      totalElements.value = activeRefundRequestPage.totalElements;
      currentPage.value = activeRefundRequestPage.pageable.pageNumber + 1;
      totalPages.value = activeRefundRequestPage.totalPages;
  
      refundRequests.length = 0;
      refundRequests.push(...activeRefundRequestPage.content);
    } catch (error) {
      console.error('Error fetching refund requests:', error);
    }
  }
  
  // 接收退款申請
  async function refundApproved(refundRequestId, refundForOrderCheck) {
    const providerReply = {
      "providerId": 1,
      "refundReqId": refundRequestId,
    };
  
    try {
      Swal.fire({
      title: "處理中...",
      text: "請稍候",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });
      const url = refundForOrderCheck
        ? `${apiBaseUrl}/providerOrders/refundRequests/Approve`
        : `${apiBaseUrl}/providerOrders/refundRequestsOD/Approve`;
  
      const response = await axios.post(url, providerReply);
      console.log(response.data);
      findRefundRequestById();

      if (response.data.success) {
      Swal.fire({
        icon: "success",
        title: "成功",
        text: "退款已核准",
      });
      findRefundRequestById(); // 更新列表或相關資料
    } else {
      Swal.fire({
        icon: "error",
        title: "失敗",
        text: "退款核准失敗，請稍後再試",
      });
    }
    } catch (error) {
      console.error('Error approving refund request:', error);
    }
  }
  
  // 拒絕退款申請
  async function refundDenied(refundRequestId, refundForOrderCheck) {
    const providerReply = {
      "providerId": 1,
      "refundReqId": refundRequestId,
    };
  
    try {
      const url = refundForOrderCheck
        ? `${apiBaseUrl}/providerOrders/refundRequests/Decline`
        : `${apiBaseUrl}/providerOrders/refundRequestsOD/Decline`;
  
      const response = await axios.post(url, providerReply);
      console.log(response.data);
      findRefundRequestById();
    } catch (error) {
      console.error('Error denying refund request:', error);
    }
  }
  
  // 初始化頁面
  onMounted(() => {
    findRefundRequestById();
  });
  </script>
  
  <style scoped>
  /* 表格美化 */
  .table-striped thead {
    background-color: #004080;
    color: white;
  }
  
  .table-hover tbody tr:hover {
    background-color: #f0f0f0;
  }
  
  /* 分頁區域樣式 */
  .d-flex {
    font-size: 1rem;
  }
  </style>

<!-- <template>
    <table class="table">
  <thead>
                <tr>
                    <th scope="col">退款申請編號</th>
                    <th scope="col">訂單編號</th>
                    <th scope="col">退款時間</th>
                    <th scope="col">退款理由</th>
                    <th scope="col">退款金額</th>
                    <th scope="col">退款用戶名稱</th>
                    <th scope="col">退款用戶帳號</th>
                    <th scope="col"></th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="refundRequest in refundRequests" :key="refundRequest.refundRequestId">
                    <td>
                        <h4>
                           <span class="badge text-bg-light">{{ refundRequest.refundRequestId}}</span>
                        </h4> 
                    </td>
                    <td>
                        <h4>
                           <span class="badge text-bg-light">{{ refundRequest.orderId}}</span>
                        </h4> 
                    </td>
                    <td>
                        <h4><span class="badge text-bg-light">{{ refundRequest.refundDate }}</span></h4>
                        
                    </td>
                    <td>
                        <h4><span class="badge text-bg-light">{{ refundRequest.refundReason }}</span></h4>
                        
                    </td>
                    <td>
                        <h4><span class="badge text-bg-light">{{ refundRequest.totalPriceRefund}}</span></h4>
                        
                    </td>
                    <td>
                        <h4><span class="badge text-bg-light">{{ refundRequest.name}}</span></h4>
                        
                    </td>
                    <td>
                        <h4><span class="badge text-bg-light">{{ refundRequest.userId}}</span></h4>
                        
                    </td>
                    <td>                     
                            <button type="button" class="btn btn-success" @click="refundApproved(refundRequest.refundRequestId,refundRequest.refundForOrder)">接受申請</button>
                   
                            <button type="button" class="btn btn-danger"@click="refundDenied(refundRequest.refundRequestId,refundRequest.refundForOrder)">拒絕申請</button>

                    </td>
                    
                </tr>
            </tbody>
        </table>
        <div class="row">
        <div class="col-6" v-show="totalElements>0">
            <Paginate 
                v-model="currentPage"    
                :page-count="totalPages"
                :click-handler="findRefundRequestById"
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
import { ref, onMounted, reactive } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';
import Swal from 'sweetalert2';
const route = useRoute(); // 取得路由參數

const currentPage = ref(1);
    const totalPages = ref(1);
    const totalElements = ref(0);
const request = reactive({
    "providerId":1,
    "pageNum":0,
    "pageSize":10,
})

const refundRequests = reactive([]);



async function findRefundRequestById(){
    request.pageNum = currentPage.value-1;
    try {
        const response = await axios.post("http://localhost:8080/hestia/providerOrders/refundRequests",request);
        let activeRefundRequestPage
        = response.data.activeRefundRequestPage
        ;
    totalElements.value = activeRefundRequestPage
    .totalElements;
    currentPage.value = activeRefundRequestPage
    .pageable.pageNumber +1;
    totalPages.value = activeRefundRequestPage
    .totalPages;
        console.log(response.data)
        refundRequests.length = 0;
        refundRequests.push(...activeRefundRequestPage
        .content)
    } catch (error) {
        
    }
    

}
async function refundApproved(refundRequestId,refundForOrderCheck){
    let providerReply ={
        "providerId":1,
        "refundReqId":refundRequestId,
        }
    if(refundForOrderCheck){
        console.log("refundReqId"+refundRequestId);
        try {
            const response = await axios.post("http://localhost:8080/hestia/providerOrders/refundRequests/Approve",providerReply);
            console.log(response.data);
            findRefundRequestById();

        } catch (error) {
            
        }
    }else{
        try {
            const response = await axios.post("http://localhost:8080/hestia/providerOrders/refundRequestsOD/Approve",providerReply);
            console.log(response.data);
            findRefundRequestById();

        } catch (error) {
            
        }
    }

}

async function refundDenied(refundRequestId,refundForOrderCheck){
    let providerReply ={
        "providerId":1,
        "refundReqId":refundRequestId,
        }
        if(refundForOrderCheck){
        console.log("refundReqId"+refundRequestId);
        try {
            const response = await axios.post("http://localhost:8080/hestia/providerOrders/refundRequests/Decline",providerReply);
            console.log(response.data);
            findRefundRequestById();

        } catch (error) {
            
        }
    }else{
        console.log("OD")
        console.log("refundReqId"+refundRequestId);
        try {
            const response = await axios.post("http://localhost:8080/hestia/providerOrders/refundRequestsOD/Decline",providerReply);
            console.log(response.data);
            findRefundRequestById();

        } catch (error) {
            
        }
    }

}

onMounted(
    ()=>{
        findRefundRequestById();
    }
)
    
</script>
    
<style>
    
</style> -->