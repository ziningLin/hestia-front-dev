<template>
    <div class="container my-4">
      <!-- 標題 -->
  
      <!-- 搜索區域 -->
       <div class="mb-3">
        <div class="row g-3">
        <!-- <input
          type="text"
          v-model="request.providerId"
          @change="findProvOrdersById"
          placeholder="輸入 Provider ID"
        /> -->
        <div class="col">
          <label for="status">選擇 起始日期</label>
          <input
            type="date"
            v-model="request.startSearchDate"
            class="form-control" 
            @change="findProvOrdersById"
          />
        </div>
        <div class="col">
          <label for="status">選擇 結束日期</label>
          <input
            type="date"
            class="form-control" 
            v-model="request.endSearchDate"
            @change="findProvOrdersById"
          />
        </div>
        <div class="col"> 
          <label for="status">請選擇狀態</label>
            <select  v-model="request.stateId" @change="findOrdersById" 
            class="form-control"  placeholder="狀態查詢">
              <option value="38">完成</option>
              <option value="31">已付款</option>
              <option value="33">未付款取消</option>
              <option value="35">退款中</option>
              <option value="36">退款完成</option>
            </select>
          </div>
          <div class="col">
            <label for="status">輸入 查詢內容</label>
        <input
          type="text"
          v-model="request.searchInput"
          @change="findProvOrdersById"
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
              <th scope="col">下單日期</th>
              <th scope="col">預定日期</th>
              <th scope="col">入住日期</th>
              <th scope="col">訂購金額</th>
              <th scope="col">訂購人姓名</th>
              <th scope="col">訂購房間名稱</th>
              <th scope="col">狀態</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in orders" >
              <OrderListProvider :item="order" />
            </tr>
          </tbody>
        </table>
      </div>
  
      <!-- 分頁 -->
      <div class="d-flex justify-content-center mt-3"  v-if="totalPages > 1">
        <Paginate 
          v-model="currentPage"
          :page-count="totalPages"
          :click-handler="findProvOrdersById"
          :initial-page="currentPage"
          :first-last-button="true"
          first-button-text="&lt;&lt;"
          last-button-text="&gt;&gt;"
          prev-text="&lt;"
          next-text="&gt;"
        />
      </div>
    </div>
  </template>
  
  <script setup>
  import Paginate from 'vuejs-paginate-next';
  import axios from '../../plugins/axios.js';
  import { onMounted, ref } from 'vue';
  import { reactive } from 'vue';
  import Swal from 'sweetalert2';
  const apiBaseUrl = import.meta.env.VITE_API_URL;
  const orders = reactive([]);
  
  const currentPage = ref(1);
  const totalPages = ref(1);
  const totalElements = ref(0);
  
  const request = reactive({
    providerId: 1,
    startSearchDate: null,
    endSearchDate: null,
    stateId: null,
    searchInput: null,
    pageSize:15
  });
  
  import OrderListProvider from './ProviderOrderList.vue';
  
  async function findProvOrdersById() {
    try {
      request.pageNum = currentPage.value - 1;
      const response = await axios.post(
        `${apiBaseUrl}/providerOrders/find`,
        request
      );
      console.log(response.data);
      let responseOrders = response.data.providerOrders;
      totalElements.value = responseOrders.totalElements;
      currentPage.value = responseOrders.pageable.pageNumber + 1;
      totalPages.value = responseOrders.totalPages;
      orders.length = 0;
      orders.push(...responseOrders.content);
      console.log("數量:",orders.length)
    } catch (error) {
      console.error('查詢失敗', error);
    }
  }
  
  onMounted(() => {
    findProvOrdersById();
  });
  </script>
  
  <style scoped>
  /* 全局樣式 */
  .container {
    max-width: 90%;
    margin: auto;
    padding: 0 1rem;
  }
  
  /* 標題樣式 */
  h3 {
    font-size: 1.8rem;
    color: #333;
  }
  
  /* 搜索區域樣式 */
  /* .search-container {
    display: flex;
    justify-content: space-between;
    gap: 0.5rem;
    flex-wrap: wrap;
  }
  
  .search-container input {
    padding: 0.5rem;
    border: 1px solid #ced4da;
    border-radius: 4px;
    width: 20%;
  } */
  
  /* .search-container input:focus {
    outline: none;
    border-color: #495057;
  } */
  
  /* 表格區域 */
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
  
  /* 分頁區域樣式 */
  .pagination-container {
    display: flex;
    justify-content: flex-end;
    margin-top: 1.5rem;
  }
  </style>

<!-- <template>
    <h3>查詢訂單</h3>
    <input type="text" v-model = "request.providerId"  @change = "findProvOrdersById"  placeholder="輸入 Provider ID">
<input type="date" v-model = "request.startSearchDate"  @change = "findProvOrdersById" >
<input type="date" v-model = "request.endSearchDate"  @change = "findProvOrdersById" >
<input type="text" v-model = "request.stateId"  @change = "findProvOrdersById"  placeholder="輸入 狀態 ID">
<input type="text" v-model = "request.searchInput"  @change = "findProvOrdersById"  placeholder="輸入 查詢內容">
<table class="table">
    <thead>
        <tr>
        <th scope="col">訂單編號</th>
        <th scope="col">下單日期</th>
        <th scope="col">預定日期</th>
        <th scope="col">入住日期</th>
        <th scope="col">訂購金額</th>
        <th scope="col">訂購人姓名</th>
        <th scope="col">訂購房間名稱</th>
        <th scope="col">狀態</th>
        </tr>
    </thead>
    <tbody>
        <tr v-for="order in orders" :key="order.orderId">
            <OrderListProvider :item = "order"></OrderListProvider>
        </tr>
    </tbody>
</table>       
<div class="row">
        <div class="col-6" v-show="totalElements>0">
            <Paginate 
                v-model="currentPage"    
                :page-count="totalPages"
                :click-handler="findProvOrdersById"
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
import axios from 'axios';
import { onMounted, ref } from 'vue';
import { reactive } from 'vue';
const orders = reactive([]);

const currentPage = ref(1);
    const totalPages = ref(1);
    const totalElements = ref(0);

const request = reactive({
"providerId":1,
"startSearchDate":null,
"endSearchDate":null,
"stateId":null,
"searchInput":null
})

import OrderListProvider from './ProviderOrderList.vue';

async function findProvOrdersById(){
try {
    request.pageNum = currentPage.value-1;
    const response = await axios.post("http://localhost:8080/hestia/providerOrders/find",request);
    console.log(response.data);
    let responseOrders = response.data.providerOrders;
    totalElements.value = responseOrders.totalElements;
    currentPage.value = responseOrders.pageable.pageNumber +1;
    totalPages.value = responseOrders.totalPages;
    orders.length = 0;
    orders.push(...responseOrders.content
    ); 
    console.log("orders",orders);
} catch (error) {
    
}
}

onMounted(
    ()=>{
        findProvOrdersById();
    }
);


</script>

<style>

</style> -->