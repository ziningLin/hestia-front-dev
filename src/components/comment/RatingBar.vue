<template>
    <div class="rating-container">
        <div class="rating-stars">
            {{ title }}
            <i
                v-for="star in 5"
                :key="star"
                :class="getHeartClass(star)"
                @click="setRating(star)"
                @mouseover="hoverRating = star"
                @mouseout="hoverRating = 0"
            ></i>
        </div>
    </div>
</template>

<script setup>
    import { ref, onMounted, watch } from "vue";

    // 接收父組件傳入的標題和分數
    const props = defineProps({
        title: String, // 評分項目名稱
        score: Number // 預設評分
    });

    // 內部狀態
    const currentRating = ref(0); // 用來顯示的評分
    const hoverRating = ref(0);   // 用來顯示鼠標懸停時的評分

    // 根據傳入的 `score` 設定初始評分
    onMounted(() => {
        // 如果 `score` 是有效的，設定 `currentRating` 為該分數，否則為 0
        currentRating.value = props.score ?? 0; // 預設為 0 如果沒有提供 score
    });
    // 監聽 score 的變化，當 score 改變時更新 currentRating
    watch(() => props.score, (newScore) => {
        currentRating.value = newScore;
    });

    // 獲取星星的 class
    const getHeartClass = (star) => {
        // 檢查是否該顯示填滿的心形
        if (hoverRating.value >= star || currentRating.value >= star) {
            return "bi bi-suit-heart-fill"; // 填滿的心形
        }
        return "bi bi-suit-heart"; // 空心的心形
    };

    const emit = defineEmits(["update"]);

    // 設置評分
    const setRating = (star) => {
        if(star){
            currentRating.value = star;
        }
        emit("update", currentRating.value); // 通知父組件更新
    };
</script>

<style scoped>
    .bi-suit-heart-fill {
        color: red;
    }

    .rating-container {
        margin-bottom: 1rem;
        font-size: 24px;
    }

    .rating-stars i {
        cursor: pointer;
        margin: 0 5px;
    }
</style>
