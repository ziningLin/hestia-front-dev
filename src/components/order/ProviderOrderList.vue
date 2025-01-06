<template>
     <th scope="row">{{ item.orderId }}</th>
        <td>{{item.orderingDate }}</td>
        <td>{{item.bookedDate}}</td>
        <td>{{ item.checkInDate}}</td>
        <td>{{ item.purchasedPrice}}</td>
        <td>{{ item.userName}}</td>
        <td>{{ item.roomName}}</td>
        <td><span v-if = "item.state == '未付款取消'" class = "text-secondary">{{ item.state}}</span>
        <span v-if = "item.state == '完成'" class = "text-success" style="font-weight: 600;">{{ item.state}}</span>
        <span v-if = "item.state == '已付款'" class = "text-primary" style="font-weight: 600;">{{ item.state}}</span>
        <span v-if = "item.state == '退款完成'" class = "text-danger" style="font-weight: 600;">{{ item.state}}</span>
        <span v-if = "item.state == '未付款'" class = "text-warning" style="font-weight: 600;">{{ item.state}}</span></td>
      
</template>
    
<script setup>
    import "bootstrap/dist/css/bootstrap.min.css";
    import "bootstrap/dist/js/bootstrap.bundle.min.js";
    const props = defineProps(["item"]);

</script>
    
<style scoped>
.table th,
  .table td {
    text-align: center;
    vertical-align: middle;
  }
    
</style>