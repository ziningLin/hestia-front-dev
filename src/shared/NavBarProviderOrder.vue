<template>
  <ul class="nav nav-tabs">
    <RouterLink
      class="nav-link"
      :class="{ active: isActive('/provOrder/providerCheckOrder') }"
      to="/provOrder/providerCheckOrder"
    >
      查詢訂單
    </RouterLink>

    <RouterLink
      class="nav-link"
      :class="{ active: isActive('/provOrder/salesReport') }"
      to="/provOrder/salesReport"
    >
      銷售報表
    </RouterLink>

    <RouterLink
      class="nav-link"
      :class="{ active: isActive('/provOrder/providerActiveRefundOrder') }"
      to="/provOrder/providerActiveRefundOrder"
    >
      檢視退款申請
    </RouterLink>

    <RouterLink
      class="nav-link"
      :class="{ active: isActive('/provOrder/providerPastRefundOrder') }"
      to="/provOrder/providerPastRefundOrder"
    >
      退款申請紀錄
    </RouterLink>
    <RouterLink
      class="nav-link"
      :class="{ active: isActive('/provOrder/providerReservedRooms') }"
      to="/provOrder/providerReservedRooms"
    >
      已預定房間
    </RouterLink>
  </ul>
</template>

<script setup>
import { useRoute } from 'vue-router';

const route = useRoute();

const isActive = (path) => {
  console.log('Checking if active for:', path);
  console.log('Current route.path:', route.path);
  return route.path === path || route.path.startsWith(path + '/');
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