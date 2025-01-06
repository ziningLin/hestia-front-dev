<template>
    <div 
    style=" 
            margin-bottom: 15px;
            border-radius: 5px;
            padding-top: 10px;">
        <RouterLink to="/favoriteList" class="router-link">心願單</RouterLink> 
        <span style="color: #D0D0D0	;"> > {{city}}</span>
    </div>
</template>

<script setup lang='ts'>
import { RouterLink } from 'vue-router';

defineProps({
        city: {
            type: String,
            required: true
        }
    });

</script>

<style scope>
.router-link {
color: #ADADAD;
text-decoration: none;
}

.router-link:hover {
color: #5B5B5B;
text-decoration: underline;
}
</style>