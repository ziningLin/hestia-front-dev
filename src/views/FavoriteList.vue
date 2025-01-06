<template>
    <h3>FavoriteList</h3>
    <div class="row">
        
            <FavoriteListCard
                v-for="[key, item] in favoriteStore.items"
                :city="key"
                :item="item"
                style="margin: 10px;"
            />
    
    </div>
</template>
    
<script setup>
    import { onMounted } from 'vue';
    import { useFavoriteStore } from '../stores/favorite';
    import FavoriteListCard from '@/components/favorite/FavoriteListCard.vue'

    // 使用 Pinia 的 cart store
    const favoriteStore = useFavoriteStore();

    onMounted(() => {
        favoriteStore.fetchFavoriteItems();
    });
</script>
    
<style>
    
</style>