<template>
  <div class="profile-container">
    <!-- 左側導航欄 -->
    <div class="profile-sidebar">
        <ProfileSidebar />
    </div>

    <!-- 右側實際內容 -->
    <div class="profile-content">
      <router-view />
    </div>
  </div>
</template>

<script setup>
import ProfileSidebar from '@/components/profile/ProfileSidebar.vue';
</script>

<style scoped>
.profile-container {
  display: flex;
}
.profile-content {
  flex: 1;
  padding: 20px;
}
.profile-sidebar {
  width: 250px; /* 固定寬度，根據需求調整 */
  padding: 15px;
}
</style>
