<template>

<ul class="nav nav-tabs">
  <li class="nav-item">
    <RouterLink  class="nav-link" :class="{ active: isActive('/order/userCheckOrder') }"
    aria-current="page"  to = "/order/userCheckOrder">查詢訂單</RouterLink>
  </li>
  <li class="nav-item">
    <RouterLink   class="nav-link" :class="{ active: isActive('/order/userRefundRequest') }" aria-current="page" to = "/order/userRefundRequest">查看退款申請</RouterLink>
  </li>
  <li class="nav-item">
    <RouterLink  class="nav-link" :class="{ active: isActive('/order/userUnpaidOrder') }" aria-current="page" to = "/order/userUnpaidOrder">待付款訂單</RouterLink>
  </li>
  <li class="nav-item">
    <RouterLink  class="nav-link" :class="{ active: isActive('/order/userReservedRooms') }" aria-current="page" to = "/order/userReservedRooms">已訂購房間</RouterLink>
  </li>
</ul>
</template>

<script setup>
import { RouterLink, RouterView } from 'vue-router';
import { useRoute } from 'vue-router';

// 獲取當前路由資訊
const route = useRoute();

// 動態檢查當前路由是否匹配
const isActive = (path) => {
  // if (!route.path || route.path === '/') {
  //   // 如果路徑為空，直接設置默認為查詢訂單
  //   return path === '/provOrder/ProviderCheckOrder';
  // }
  return route.path.startsWith(path);
};
</script>

<style>
.nav-link {
  
  color: #0a141b;
}

.nav-link.active {
  font-weight: bold;
  color: #127acf !important;
}
</style>