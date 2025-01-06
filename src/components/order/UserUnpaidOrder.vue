<template>
    <div class="mb-3">
        <div class="row g-3"><br/></div></div>
<div class="table-container">
    <table class="table table-striped table-hover">
          <thead>
            <tr>
              <th scope="col">訂單編號</th>
              <th scope="col">訂單總價</th>
              <th scope="col">訂購房間數</th>
              <th scope="col">訂購日期</th>
              <th scope="col">狀態</th>
              <th scope="col">付款</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in orders" :key="order.orderId">
              <th scope="row">{{ order.orderId }}</th>
              <td>{{ order.totalPrice }}</td>
              <td>{{ order.orderRoomCount }}</td>
              <td>{{ order.orderingDate }}</td>
              <td>{{ order.state }}</td>
              <td>
                <button class="btn btn-success btn-sm" @click="handlePayment(order)">
                  付款
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
  </template>
  
  <script setup>
  import { reactive, onMounted } from "vue";
  import axios from '../../plugins/axios.js';
  const apiBaseUrl = import.meta.env.VITE_API_URL;
  const frontBaseUrl = import.meta.env.VITE_API_Front_URL;
  const ngrokUrl = import.meta.env.VITE_API_NGROK_URL;
  
  const orders = reactive([]);
  const request = {
    userId: 1,
    stateId: 30,
  };
  
  async function findOrdersById() {
    try {
      const response = await axios.post(
        `${apiBaseUrl}/userOrders/findOrders`,
        request
      );
      orders.length = 0;
      orders.push(...response.data.userOrders.content);
      for (const order of orders) {
      const detailResponse = await axios.get(
        `${apiBaseUrl}/userOrders/findOrder/${order.orderId}`
      );
      const orderDetails = detailResponse.data.orderDetails;
      
      // 計算房間數量和總金額
      order.orderRoomCount = orderDetails.length;
      order.totalPrice = orderDetails.reduce((sum, detail) => sum + detail.purchasedPrice, 0);
    }
    console.log(orders)
    } catch (error) {
      console.error("查詢失敗:", error);
    }
  }
  
  async function handlePayment(order) {
        const paymentRequest = {
            "orderId":order.orderId,
        }
        try {
            // const checkRoomSumResponse = await axios.post(`${apiBaseUrl}/userOrders/complete/Check`,paymentRequest)
            // if(checkRoomSumResponse.data.success){
                const tradeNumberResponse = await axios.post (`${apiBaseUrl}/payment/getTradeNumber`,paymentRequest)
                if(tradeNumberResponse.data.success){
                    const orderDetailResponse = await axios.get(`${apiBaseUrl}/userOrders/findOrder/${order.orderId}`);
                    let itemsInOrder = "";
                    if( orderDetailResponse.data.success){
                        orderDetailResponse.data.orderDetails.forEach(function(orderDetail){
                            itemsInOrder += orderDetail.roomName;
                            itemsInOrder += orderDetail.bookededDate;
                            itemsInOrder +="#";
                        })
console.log(`${frontBaseUrl}/order/userCheckOrder`)
                    }
                    const paymentData = {
                        MerchantID: "3002607",
                        MerchantTradeNo: tradeNumberResponse.data.tradeNumber,
                        TotalAmount: order.totalPrice,
                        MerchantTradeDate: tradeNumberResponse.data.tradeDate,
                        TradeDesc: "交易編號:"+tradeNumberResponse.data.tradeNumber+"付款",
                        ItemName: itemsInOrder,
                        ReturnURL: `${ngrokUrl}/userOrders/complete`,
                        ClientBackURL:`${frontBaseUrl}/order/userCheckOrder`,
                        PaymentType: "aio",
                        ChoosePayment: "ALL",
                        // SimulatePaid:1,
                        EncryptType:1
                    };

                    const response = await axios.post(
                        `${apiBaseUrl}/payment/generateCheckMacValue`,
                        paymentData,
                        {
                            headers: {
                                'Content-Type': 'application/json',
                            },
                        }
                    );

                    const result = response.data;

                    // 驗證是否成功取得檢查碼
                    if (response.status === 200) {
                        const fullPaymentData = {
                    ...paymentData,
                    CheckMacValue: result.CheckMacValue, // 將生成的檢查碼加入
                };

                // 傳遞完整資料到 Ecpay
                // console.log(fullPaymentData)
                sendToEcpay(fullPaymentData);
                        // sendToEcpay(result);
                    } else {
                        console.error("生成檢查碼失敗:", result.error);
                        Swal.fire({
                            icon: "error",
                            title: "生成檢查碼失敗:" + result.error
                        });
                    }
                }
        //     }else{
        //         Swal.fire({
        //         icon: "error",
        //         title: checkRoomSumResponse.data.message,
        //   });
    //}

        
        } catch (error) {
            console.error("請求失敗:", error);
        }
       
        


    // try {
    //     // 向後端請求生成 CheckMacValue
    //     const response = await fetch('http://localhost:8080/hestia/payment/generateCheckMacValue', {
    //         method: 'POST',
    //         headers: {
    //             'Content-Type': 'application/json',
    //         },
    //         body: JSON.stringify(paymentData),
    //     });

    //     const result = await response.json();

    //     // 驗證是否成功取得檢查碼
    //     if (response.ok) {
    //         sendToEcpay(result);
    //     } else {
    //         console.error("生成檢查碼失敗:", result.error);
    //     }
    // } catch (error) {
    //     console.error("請求失敗:", error);
    // }
}

function sendToEcpay(params) {
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = 'https://payment-stage.ecpay.com.tw/Cashier/AioCheckOut/V5';

    // 將參數加入表單
    for (const key in params) {
        if (params.hasOwnProperty(key)) {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = key;
            input.value = params[key];
            form.appendChild(input);
        }
    }

    document.body.appendChild(form);
    form.submit(); // 提交表單到綠界
}
  
  onMounted(findOrdersById);
  </script>
  
  <style scoped>
  .container {
    max-width: 90%;
    padding: 1rem;
  }
  
  .card {
    border: 1px solid #dee2e6;
    border-radius: 0.5rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
  
  .unpaid-order-container {
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
  
  button {
    font-size: 0.85rem;
  }
  </style>

<!-- <template>
    <h3>未付款訂單</h3>
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
            <th scope="col">付款</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="order in orders" :key="order.orderId">
                <th scope="row">{{ order.orderId }}</th>
        <td>{{order.totalPrice }}</td>
        <td>{{order.orderRoomCount}}</td>
        <td>{{ order.orderingDate}}</td>
        <td>{{ order.state}}</td>
        <td>
            <h5><button  class="badge text-bg-warning" @click="handlePayment(order)">付款</button></h5>
        </td>
            </tr>
        </tbody>
    </table>       
</template>
    
<script setup>
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
   
    const request = reactive({
    "userId":1,
    "stateId":30,
})

    async function findOrdersById(){
        try{
        
        const response = await axios.post("http://localhost:8080/hestia/userOrders/findOrders",request);
        console.log(response.data.userOrders.content
        )
        orders.length = 0;

        orders.push(...response.data.userOrders.content); 

        console.log("orders",orders);

        }catch(error){

        }
    }
    onMounted(
        ()=>{
            findOrdersById();
        }
    );
    async function handlePayment(order) {
        const tradeNumberRequest = {
            "orderId":order.orderId,
        }
        try {
             const tradeNumberResponse = await axios.post ('http://localhost:8080/hestia/payment/getTradeNumber',tradeNumberRequest)
                if(tradeNumberResponse.data.success){
                    const orderDetailResponse = await axios.get(`http://localhost:8080/hestia/userOrders/findOrder/${order.orderId}`);
                    let itemsInOrder = "";
                    if( orderDetailResponse.data.success){
                        orderDetailResponse.data.orderDetails.forEach(function(orderDetail){
                            itemsInOrder += orderDetail.roomName;
                            itemsInOrder += orderDetail.bookededDate;
                            itemsInOrder +="#";
                        })

                    }
                    const paymentData = {
                        MerchantID: "3002607",
                        MerchantTradeNo: tradeNumberResponse.data.tradeNumber,
                        TotalAmount: order.totalPrice,
                        MerchantTradeDate: tradeNumberResponse.data.tradeDate,
                        TradeDesc: "交易編號:"+tradeNumberResponse.data.tradeNumber+"付款",
                        ItemName: itemsInOrder,
                        ReturnURL: "/userOrders/complete",
                        ClientBackURL:"",
                        PaymentType: "aio",
                        ChoosePayment: "ALL",
                        // SimulatePaid:1,
                        EncryptType:1
                    };

                    const response = await axios.post(
                        'http://localhost:8080/hestia/payment/generateCheckMacValue',
                        paymentData,
                        {
                            headers: {
                                'Content-Type': 'application/json',
                            },
                        }
                    );

                    const result = response.data;

                    // 驗證是否成功取得檢查碼
                    if (response.status === 200) {
                        const fullPaymentData = {
                    ...paymentData,
                    CheckMacValue: result.CheckMacValue, // 將生成的檢查碼加入
                };

                // 傳遞完整資料到 Ecpay
                // console.log(fullPaymentData)
                sendToEcpay(fullPaymentData);
                        // sendToEcpay(result);
                    } else {
                        console.error("生成檢查碼失敗:", result.error);
                    }
                }
        } catch (error) {
            console.error("請求失敗:", error);
        }
       
        


    // try {
    //     // 向後端請求生成 CheckMacValue
    //     const response = await fetch('http://localhost:8080/hestia/payment/generateCheckMacValue', {
    //         method: 'POST',
    //         headers: {
    //             'Content-Type': 'application/json',
    //         },
    //         body: JSON.stringify(paymentData),
    //     });

    //     const result = await response.json();

    //     // 驗證是否成功取得檢查碼
    //     if (response.ok) {
    //         sendToEcpay(result);
    //     } else {
    //         console.error("生成檢查碼失敗:", result.error);
    //     }
    // } catch (error) {
    //     console.error("請求失敗:", error);
    // }
}

function sendToEcpay(params) {
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = 'https://payment-stage.ecpay.com.tw/Cashier/AioCheckOut/V5';

    // 將參數加入表單
    for (const key in params) {
        if (params.hasOwnProperty(key)) {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = key;
            input.value = params[key];
            form.appendChild(input);
        }
    }

    document.body.appendChild(form);
    form.submit(); // 提交表單到綠界
}
</script>
    
<style>
    
</style> -->