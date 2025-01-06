<template>
    <h3>購物車</h3>
    <div class="row">
        <div class="col-sm-12 col-md-8">
        <div v-if="cartStore.items.length==0">
            <h3>購物車是空的！</h3>
            <RouterLink to="/">再去逛逛~</RouterLink>
        </div>
            <Cartordercard v-for="item in cartStore.items" :item="item" :key="item.id"></Cartordercard>
        </div>
        <div class="col-md-4">
            <CheckoutCard></CheckoutCard>           
        </div>
    </div>
</template>

<script setup>
    import Cartordercard from '/src/components/cart/Cartordercard.vue'
    import CheckoutCard from '/src/components/cart/CheckoutCard.vue'

    import { useCartStore } from '@/stores/cart';
    const cartStore = useCartStore();

</script>

<style></style>