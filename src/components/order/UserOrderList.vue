<template>
        <th scope="row">{{ item.orderId }}</th>
        <td>{{item.totalPrice }}</td>
        <td>{{item.orderRoomCount}}</td>
        <td>{{ item.orderingDate}}</td>
        <!-- <td>{{ item.state}}</td> -->
        <!-- <td :class="stateColorMapping[item.state || '未知狀態'] || 'text-muted'" style="font-weight: bold;">
            {{ stateMapping[item.state] || "未知狀態" }} 
        </td> -->
        <td><span v-if = "item.state == '未付款取消'" class = "text-secondary" style="font-weight: 600;">{{ item.state}}</span>
        <span v-if = "item.state == '完成'" class = "text-success" style="font-weight: 600;">{{ item.state}}</span>
        <span v-if = "item.state == '已付款'" class = "text-primary" style="font-weight: 600;">{{ item.state}}</span>
        <span v-if = "item.state == '退款完成'" class = "text-danger" style="font-weight: 600;">{{ item.state}}</span>
        <span v-if = "item.state == '未付款'" class = "text-warning" style="font-weight: 600;">{{ item.state}}</span></td>
        <td>
            <h5><button type="button" class="btn btn-primary" @click="viewOrderDetail(item.orderId)">查看詳情</button></h5>
        </td>
        <td>
            <h5 v-if="item.state == '已付款' && item.activeRefundRequest!=1"  @click="checkRefundable(item.orderId)"><button  class="btn btn-warning">申請退款</button></h5>
            <h5 v-if="item.activeRefundRequest==1"><span class="badge text-bg-danger" >退款目前申請中</span></h5>
        
            
        </td>
        <td >
            <span v-if="item.state == '完成'">
                <RouterLink :to="{ path: `/comment/${item.orderId}` }" ><button type="button" class="btn btn-outline-primary">評價</button></RouterLink>
            </span>
        </td>
    
</template>
    
<script setup>
// import "bootstrap/dist/css/bootstrap.min.css";
// import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { reactive } from "vue";
import router from "../../routers/router";
    const props = defineProps(["item"]);
    const emits = defineEmits(["checkRefund"])
    
    function viewOrderDetail(orderId) {
        router.push(`orderDetail/${orderId}`); // 跳轉到詳細資訊頁面
    }

    function checkRefundable(){
        emits("checkRefund", props.item.orderId);
    }

    const stateColorMapping = reactive({
    "未付款取消": "text-secondary",
    "完成": "text-success",
    "已付款": "text-primary",
    "退款完成": "text-danger",
    "未付款": "text-warning",
    "未知狀態": "text-muted" // 添加默認狀態
});
</script>
    
<style scoped>
.table th,
  .table td {
    text-align: center;
    vertical-align: middle;
  }
    
</style>