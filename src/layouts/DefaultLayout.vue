<!--有導航欄和頁腳的通用布局-->
<template>
    <div class="container">
        <Navigationbar></Navigationbar>
        <NavBarUserOrder v-if="isOrderPage" ></NavBarUserOrder>
        <NavBarProviderOrder v-if="isProvOrderPage"></NavBarProviderOrder>           
        <router-view></router-view>
        <footer></footer>
        <ChatBox />
    </div>
</template>

<script setup>
    import Navigationbar from '../shared/Navigationbar.vue' 
    import ChatBox from '../shared/ChatBox.vue'
    import NavBarUserOrder from "../shared/NavBarUserOrder.vue";
    import NavBarProviderOrder from"../shared/NavBarProviderOrder.vue"
    import { useRoute } from "vue-router";
    import {computed }from "vue"
const route = useRoute();
const isOrderPage = computed(() => route.path.startsWith('/order'));
const isProvOrderPage = computed(() => route.path.startsWith('/provOrder'))
</script>

<style>

</style>