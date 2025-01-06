<template>
    <!-- Button trigger modal -->
    <!--尚未評價顯示此 -->
    <div v-if="!room.comment">
        <button type="button" class="btn btn-primary" data-bs-toggle="modal" :data-bs-target="'#exampleModal' + roomId">
            給予評價
        </button>
    </div>

    <!-- 已經評價顯示此 -->
    <div v-else 
        data-bs-toggle="modal" :data-bs-target="'#exampleModal' + roomId"
        @mouseenter="changeStyle(true)" 
        @mouseleave="changeStyle(false)"
        :class="{ 'hovered': styleChanged }">
            已評價: {{ room.comment.overallScore }}
            <i :class="getFaceClass(room)"></i>
            <span style="float: right;">
                <small class="text-muted">comment at: {{ room.comment.commentDate }}</small>
            </span>
    </div>

    <!-- Rating Modal -->
    <RatingModal
        :roomId="roomId"
        :orderIdToModal="orderId"
        @reloadPage="reloadPage"
    />
</template>
    
<script setup>
    import { ref } from 'vue';
    import { defineProps, defineEmits } from 'vue';
    import RatingModal from './RatingModal.vue';

    // 接收父組件傳遞過來的參數
    const props = defineProps({
        roomId: Number, // 傳遞 room 數據
        orderId: String
    });

    // 獲取 pinia 的 commentStore
    import { useCommentStore } from '@/stores/comment';
    const commentStore = useCommentStore();

    const room = commentStore.rooms.find(room => room.roomId === props.roomId);

    // 處理已評價區塊 hover style
    const styleChanged = ref(false);
    const changeStyle = (isMouseEnter) => {
        styleChanged.value = isMouseEnter;
    };

    const emit = defineEmits(['reloadPage']);

    function reloadPage(){
        emit('reloadPage');
    }

    function getFaceClass(room){
        const faceClasses = {
            1 : "bi bi-emoji-angry",
            2 : "bi bi-emoji-angry",
            3: "bi bi-emoji-frown",
            4: "bi bi-emoji-frown",
            5: "bi bi-emoji-neutral",
            6: "bi bi-emoji-neutral",
            7: "bi bi-emoji-smile",
            8: "bi bi-emoji-smile",
            9: "bi bi-emoji-heart-eyes",
            10: "bi bi-emoji-heart-eyes"
        };

        if (!room.comment) {
            return "bi bi-circle"; // 預設類別
        }

        return faceClasses[Math.floor(room.comment.overallScore)] || "bi bi-circle";
    }
</script>
    
<style scope>
    /* 使用動態樣式來控制背景顏色 */
    .hovered {
            text-decoration: underline;
            cursor: pointer; /* 改變鼠標樣式 */
            transition: background-color 0.3s ease;
        }
</style>