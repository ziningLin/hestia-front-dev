<template>
    <div class="modal fade" id="exampleModal" tabindex="-1" 
        aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="exampleModalLabel">分享</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div class="input-group mb-3">
                        <span class="input-group-text" id="basic-addon1" @click="copy">
                            <i class="bi bi-link-45deg"></i>
                        </span>
                        <input type="text" class="form-control" v-model="copyUrl" aria-label="Username" aria-describedby="basic-addon1">
                    </div>
                </div>
                <div class="modal-footer">
                    <button 
                        type="button" 
                        class="btn btn-outline-dark" 
                        style="border-radius: 50px; border: 1px solid 	#F0F0F0;" 
                        @click="shareToLine">
                            <i class="bi bi-line fs-5"></i>
                    </button>
                    <button 
                        type="button" 
                        class="btn btn-outline-dark" 
                        style="border-radius: 50px; border: 1px solid 	#F0F0F0;" 
                        @click="shareToMessenger">
                            <i class="bi bi-messenger fs-5"></i>
                    </button>
                    <a :href="`mailto:?subject=${encodeURIComponent('分享給你!')}&body=${encodeURIComponent('我發現這些超棒的房源，推薦給您！')}`" style="text-decoration: none;">
                        <button 
                            type="button" 
                            class="btn btn-outline-dark" 
                            style="border-radius: 50px; border: 1px solid #F0F0F0;"
                            aria-label="發送電子郵件">
                            <i class="bi bi-send fs-5"></i>
                        </button>
                    </a>
                </div>
            </div>
        </div>
    </div>
</template>
    
<script setup>
    import { ref } from 'vue';
    import Swal from 'sweetalert2';

    // 一鍵複製
    const copyUrl= ref(window.location.href);

    // 單純複製網址
    function copy(){
        Swal.fire({
            position: "bottom-end",
            icon: "success",
            title: "網址已成功複製到剪貼簿",
            showConfirmButton: false,
            timer: 1500
            });
    }

    // 分享到 Messenger
    // 複製並跳轉到 Facebook Messenger 分享頁面
    function shareToMessenger() {
        const encodedUrl = encodeURIComponent(copyUrl.value); // 編碼網址
        
        // 跳轉到 Facebook Messenger 分享頁面
        const messengerUrl = `https://www.messenger.com/t/[USER_ID]?link=${encodedUrl}`;
        window.open(messengerUrl, '_blank'); // 在新標籤頁中打開
            
    }

    // 跳轉到 LINE 分享頁面
    function shareToLine() {
        const encodedUrl = encodeURIComponent(copyUrl.value); // 編碼網址
        const lineShareUrl = `https://line.me/R/share?text=${encodedUrl}`; // 構造 LINE 分享網址

        window.open(lineShareUrl, '_blank'); // 打開 LINE 分享頁面
    }
</script>
    
<style>
    
</style>