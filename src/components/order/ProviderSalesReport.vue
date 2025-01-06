<template>
  <div class="container">


    <!-- 搜索條件區域 -->
    <div class="row g-3">

<div class="col">  <label for="status">選擇 起始日期</label><input
        type="date"
        class="form-control"
        v-model="request.startSearchDate"
        @change="findSalesReport"
      /></div>
      <div class="col"><label for="status">選擇 結束日期</label><input
        type="date"
        class="form-control"
        v-model="request.endSearchDate"
        @change="findSalesReport"
      /></div>
       <div class="col">
        <label for="status">選擇 圖表形式</label>
      <select
        v-model="chartType"
        class="form-select"
        @change="updateChart"
      ><option value="bar">長條圖</option>
        <option value="line">折線圖</option>
        
      </select></div></div>
   

     
  

<!-- 顯示報表統計信息 -->
<div class="summary-container">
  <div class="card bg-success text-white">
    <div class="card-body">
      <h5 class="card-title">
        <i class="bi bi-cash-coin"></i> 總收入
      </h5>
      <p class="card-text">NT${{ totalIncome }} 元</p>
    </div>
  </div>
  <div class="card bg-primary text-white">
    <div class="card-body">
      <h5 class="card-title">
        <i class="bi bi-boxes"></i> 總售出數量
      </h5>
      <p class="card-text">{{ totalRoomSold }}間</p>
    </div>
  </div>
  <div> <div class="card bg-warning text-dark" v-if="mostOrderedRooms.length > 0">
    <div class="card-body">
      <h5 class="card-title">
        <i class="bi bi-trophy"></i> 訂購最多房間
      </h5>
      <p class="card-text">
        {{ mostOrderedRooms[0].roomName }} 
        <br />
        訂購次數: {{ mostOrderedRooms[0].orderCount }}
      </p>
    </div>
  </div>
 </div>
 
  <div class="card bg-info text-white" v-if="topSellingRooms.length > 0">
    <div class="card-body">
      <h5 class="card-title">
        <i class="bi bi-bar-chart-line"></i> 銷售額最高房間
      </h5>
      <p class="card-text">
        {{ topSellingRooms[0].roomName }} 
        <br />
        銷售額: {{ topSellingRooms[0].totalSales }}
      </p>
    </div>
  </div>
  <div class="card bg-light">
    <div class="card-body">
      <button
        class="btn btn-outline-secondary mb-2 w-100"
        @click="toggleTopList('mostOrderedRooms')"
      >
        查看訂購最多房間
      </button>
      <button
        class="btn btn-outline-secondary w-100"
        @click="toggleTopList('topSellingRooms')"
      >
        查看銷售額最高房間
      </button>
    </div>
  </div>
</div>



    <!-- 顯示圖表區域 -->

  <div class="chart-and-list-container">
  <!-- 顯示圖表區域 -->
  <div class="chart-container">
    <canvas ref="chartCanvas"></canvas>
  </div>

  <!-- 顯示列表區域 -->
  <div class="lists-container" >
    <div v-if="activeTab === 'mostOrderedRooms'" class="list-container">
      <h5>訂購最多房間</h5>
      <ul>
        <li v-for="(room, index) in mostOrderedRooms" :key="index">
          <img :src="'data:image/jpeg;base64,' + room.mainImage" alt="Room Image" class="img-thumbnail" style="  max-width: 50px; max-height: 50px;"/> <span>{{ room.roomName }} <br> 訂購次數: {{ room.orderCount }}</span>
        </li>
      </ul>
    </div>
    <div v-if="activeTab === 'topSellingRooms'" class="list-container">
      <h5>銷售額最高房間</h5>
      <ul>
        <li v-for="(room, index) in topSellingRooms" :key="index">
          <img :src="'data:image/jpeg;base64,' + room.mainImage" alt="Room Image" class="img-thumbnail" style="  max-width: 50px; max-height: 50px;"/> <span> {{ room.roomName }} <br>銷售額: NT${{ room.totalSales }}</span>
        </li>
      </ul>
    </div>
  </div>
</div>
</div>
  
</template>

<script setup>
  import { Chart, registerables } from 'chart.js';
  import axios from '../../plugins/axios.js';
  import { reactive, ref, onMounted } from 'vue';
  const apiBaseUrl = import.meta.env.VITE_API_URL;
  
  // 註冊 Chart.js 模組
  Chart.register(...registerables);
//   const showTopLists = reactive({
//   mostOrderedRooms: false,
//   topSellingRooms: false,
// });

const activeTab = ref('mostOrderedRooms');

// 請求參數
const request = reactive({
  providerId: 1,
  startSearchDate: null,
  endSearchDate: null,
});
const totalIncome = ref(0);
const totalRoomSold = ref(0);

const topSellingRooms = reactive([]);
const mostOrderedRooms = reactive([]);

// 圖表類型
let chartType = ref("bar");

// 普通陣列，避免 Chart.js 的響應式問題
const labels = [];
const roomData = []; // 訂單數量
const totalSalesData = []; // 銷售額

// 儲存圖表實例
let chartInstance = null;

// Chart.js 的數據
const data = {
  labels: labels,
  datasets: [
    {
      label: '每月訂單數量',
      backgroundColor: 'rgba(75, 192, 192, 0.7)',
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 3,
      data: roomData,
      yAxisID: 'y1',
    },
    {
      label: '每月銷售額 (NT$)',
      backgroundColor: 'rgba(255, 99, 132, 0.7)',
      borderColor: 'rgba(255, 99, 132, 1)',
      borderWidth: 3,
      data: totalSalesData,
      yAxisID: 'y2',
    },
  ],
};

// Chart.js 的配置
const createConfig = (type) => ({
  type: type,
  data: data,
  options: {
    responsive: true,
    plugins: {
      legend: {
        display: true,
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: '月份',
        },
      },
      y1: {
        type: 'linear',
        position: 'left',
        title: {
          display: true,
          text: '訂單數量',
        },
      },
      y2: {
        type: 'linear',
        position: 'right',
        title: {
          display: true,
          text: '銷售額 (NT$)',
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  },
});

// Canvas DOM 參考
const chartCanvas = ref(null);

// 獲取並更新報表數據
async function findSalesReport() {
  try {
    const response = await axios.post(
      `${apiBaseUrl}/providerOrders/salesNumber`,
      request
    );
    const responseData = response.data;
    console.log(responseData )
    totalIncome.value = responseData.salesNumbers.totalSalesSum;
    totalRoomSold.value = responseData.salesNumbers.totalCountSum;
// console.log(totalIncome);
console.log(totalIncome.value);
    if (responseData.success) {
      // 清空舊數據
      labels.length = 0;
      roomData.length = 0;
      totalSalesData.length = 0;
      topSellingRooms.length = 0;
      mostOrderedRooms.length = 0;
      topSellingRooms.push(...responseData.topSellingRooms);
      mostOrderedRooms.push(...responseData.mostOrderedRooms);
      // 更新數據
      for (let oneMonth of responseData.salesNumbers.salesNumber) {
        labels.push(oneMonth.month);
        roomData.push(oneMonth.orderCount); // 訂單數量
        totalSalesData.push(oneMonth.totalSales); // 銷售額
        
      }

      // 更新圖表
      if (chartInstance) {
        chartInstance.update();
      }
    }
  } catch (error) {
    console.error("加載數據失敗:", error);
  }
}

// 初始化圖表
function initChart() {
  if (chartCanvas.value) {
    if (chartInstance) {
      chartInstance.destroy(); // 銷毀舊圖表實例
    }
    chartInstance = new Chart(chartCanvas.value, createConfig(chartType.value));
  }
}

// 切換圖表類型
function updateChart() {
  initChart(); // 重新初始化圖表
  findSalesReport(); // 加載數據並更新圖表
}


function toggleTopList(listName) {
  // 切換列表顯示狀態
  activeTab.value = listName
  
}

// 初始化 Chart.js 圖表
onMounted(() => {
  initChart();
  findSalesReport();
});
</script>

<style scoped>
/* 全局樣式 */
.container {
  max-width: 100%;
  margin: auto;
  padding: 1rem;
}

/* 搜索條件區域 */
.filters-container {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.filters-container input,
.filters-container select {
  width: 20%;
}

.summary-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin: 1rem 0;
}

.card {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
}

/* 圖表區域 */

.chart-container {
  width: 90%; /* 或自定義寬度 */
  flex: 2; /* 圖表區域占較多空間 */
  max-width: 80%;/* 最大寬度 */
  margin: 2rem auto; /* 水平居中，並且上下留有間距 */
  position: relative;
  padding-top: 20px; /* 讓圖表距離容器上方有一些間距 */

}

.top-list-container {
  padding-top: 100px; /* 讓圖表距離容器上方有一些間距 */
  margin: 1rem 0;
}

.chart-and-list-container {
  display: flex;
  gap: 1rem; /* 圖表與列表的間距 */
  align-items: flex-start; /* 讓內容對齊頂端 */
}

.chart-container {
  flex: 2; /* 圖表區域占較多空間 */
  max-width: 80%; /* 可選：限制最大寬度 */
}

.lists-container {
  flex: 1; /* 列表區域占較少空間 */
  max-width: 20%; /* 可選：限制最大寬度 */
  height: 400px;
  overflow-y: auto;
  margin: 2rem auto; /* 水平居中，並且上下留有間距 */
  position: relative;
  padding-top: 45px; /* 讓圖表距離容器上方有一些間距 */
}

.list-container {
  margin-bottom: 1rem; /* 列表之間的間距 */
  font-size: small;
}

.list-container h5 {
  font-weight: bold;
  margin-bottom: 0.5rem;
}

ul {
  list-style-type: none; /* 移除列表符號 */
  padding: 0;
}

li {
  margin-bottom: 0.5rem;
  line-height: 1.5;
}


</style>

<!-- <template>
<h3>報表</h3>
    <input type="text" v-model="request.providerId" placeholder="輸入提供者ID"  style="width: 20%;float: left;">
    <input type="date" class="form-control" v-model="request.startSearchDate" @change="findSalesReport" style="width: 20%;float: left;">
    <input type="date" class="form-control" v-model="request.endSearchDate" @change="findSalesReport" style="width: 20%;float: left;" >
  
    <select v-model = "chartType" class="form-select" aria-label="Default select example" @change="updateChart" style="width: 20%;">
       
        <option value="line">折線圖</option>
        <option value="bar">長條圖</option>
        
        
    </select>
    <h4><span class="badge text-bg-secondary">總收入:{{totalIncome}}</span> <span class="badge text-bg-secondary"> 總售出數量: {{totalRoomSold}}</span></h4>
    
    <div>
        <canvas ref="chartCanvas"></canvas>
    </div>

</template> -->
  
  <!-- <script setup>
  import { Chart, registerables } from 'chart.js';
  import axios from 'axios';
  import { reactive, ref, onMounted } from 'vue';
  
  // 註冊 Chart.js 模組
  Chart.register(...registerables);

// 請求參數
const request = reactive({
  providerId: 1,
  startSearchDate: null,
  endSearchDate: null,
});
const totalIncome = ref(0);
const totalRoomSold = ref(0);

// 圖表類型
let chartType = ref("line");

// 普通陣列，避免 Chart.js 的響應式問題
const labels = [];
const roomData = []; // 訂單數量
const totalSalesData = []; // 銷售額

// 儲存圖表實例
let chartInstance = null;

// Chart.js 的數據
const data = {
  labels: labels,
  datasets: [
    {
      label: '每月訂單數量',
      backgroundColor: 'rgba(75, 192, 192, 0.7)',
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 2,
      data: roomData,
      yAxisID: 'y1',
    },
    {
      label: '每月銷售額 (NT$)',
      backgroundColor: 'rgba(255, 99, 132, 0.7)',
      borderColor: 'rgba(255, 99, 132, 1)',
      borderWidth: 2,
      data: totalSalesData,
      yAxisID: 'y2',
    },
  ],
};

// Chart.js 的配置
const createConfig = (type) => ({
  type: type,
  data: data,
  options: {
    responsive: true,
    plugins: {
      legend: {
        display: true,
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: '月份',
        },
      },
      y1: {
        type: 'linear',
        position: 'left',
        title: {
          display: true,
          text: '訂單數量',
        },
      },
      y2: {
        type: 'linear',
        position: 'right',
        title: {
          display: true,
          text: '銷售額 (NT$)',
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  },
});

// Canvas DOM 參考
const chartCanvas = ref(null);

// 獲取並更新報表數據
async function findSalesReport() {
  try {
    const response = await axios.post(
      "http://localhost:8080/hestia/providerOrders/salesNumber",
      request
    );
    const responseData = response.data;
    console.log(responseData )
    totalIncome.value = responseData.salesNumbers.totalSalesSum;
    totalRoomSold.value = responseData.salesNumbers.totalCountSum;
// console.log(totalIncome);
console.log(totalIncome.value);
    if (responseData.success) {
      // 清空舊數據
      labels.length = 0;
      roomData.length = 0;
      totalSalesData.length = 0;

      // 更新數據
      for (let oneMonth of responseData.salesNumbers.salesNumber) {
        labels.push(oneMonth.month);
        roomData.push(oneMonth.orderCount); // 訂單數量
        totalSalesData.push(oneMonth.totalSales); // 銷售額
      }

      // 更新圖表
      if (chartInstance) {
        chartInstance.update();
      }
    }
  } catch (error) {
    console.error("加載數據失敗:", error);
  }
}

// 初始化圖表
function initChart() {
  if (chartCanvas.value) {
    if (chartInstance) {
      chartInstance.destroy(); // 銷毀舊圖表實例
    }
    chartInstance = new Chart(chartCanvas.value, createConfig(chartType.value));
  }
}

// 切換圖表類型
function updateChart() {
  initChart(); // 重新初始化圖表
  findSalesReport(); // 加載數據並更新圖表
}

// 初始化 Chart.js 圖表
onMounted(() => {
  initChart();
  findSalesReport();
});
</script>

<style>
canvas {
  max-width: 100%;
  height: auto;
}

</style> -->