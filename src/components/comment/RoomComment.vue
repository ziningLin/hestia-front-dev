<template>
    <div v-if="hasScore">
        <!-- 房間總評價 -->
        <p class="comment-title">
    
            <i class="bi bi-star-fill" style="font-size: 20px;"></i>
            <span style="font-size: 30px; padding-left: 5px;">
                {{overallScore}}
            </span>
            ・{{total}}則評價
    
        </p>
    
        <!-- 房間各項評價 -->
        <div class="row">
            <div class="total-score col-md-2">
                <p>推薦度</p>
                <p style="font-size: 20px;">{{ recommendationScore }}</p>
                <i class="bi bi-award"></i>
            </div>
            <div class="score col-md-2">
                <p>整潔度</p>
                <p style="font-size: 20px;">{{ cleanessScore }}</p>
                <i class="bi bi-stars"></i>
            </div>
            <div class="score col-md-2">
                <p>舒適度</p>
                <p style="font-size: 20px;">{{ comfortScore }}</p>
                <i class="bi bi-check2-circle"></i>
            </div>
            <div class="score col-md-2">
                <p>位置</p>
                <p style="font-size: 20px;">{{ locationScore }}</p>
                <i class="bi bi-map"></i>
            </div>
            <div class="score col-md-2">
                <p>設施</p>
                <p style="font-size: 20px;">{{ facilityScore }}</p>
                <i class="bi bi-building"></i>
            </div>
            <div class="score col-md-2">
                <p>服務</p>
                <p style="font-size: 20px;">{{ pationessScore }}</p>
                <i class="bi bi-chat-square-text"></i>
            </div>
        </div>
        <hr>
    
        <!-- 選擇排序方式 -->
        <div class="row">
            <div class="card">
                <div class="card-header">
    
                    <select 
                        class="form-select" 
                        aria-label="Default select example" 
                        v-model="selectedOption" 
                        @change="callFind(1)"
                        style="max-width: 200px;"
                    >
                        <option :value="{ key: 'commentDate', desc: true }">最新</option>
                        <option :value="{ key: 'overallScore', desc: true }">總分: 高到低</option>
                        <option :value="{ key: 'overallScore', desc: false }">總分: 低到高</option>
                        <option :value="{ key: 'recommendationScore', desc: true }">推薦度: 高到低</option>
                        <option :value="{ key: 'recommendationScore', desc: false }">推薦度: 低到高</option>
                        <option :value="{ key: 'cleanessScore', desc: true }">整潔度</option>
                        <option :value="{ key: 'comfortScore', desc: true }">舒適度</option>
                        <option :value="{ key: 'locationScore', desc: true }">位置</option>
                        <option :value="{ key: 'facilityScore', desc: true }">設施</option>
                        <option :value="{ key: 'pationessScore', desc: false }">服務</option>
                    </select>  
    
                </div>
    
                <!-- 房間評論header -->
                <div class="card-body">
                    <div class="row" v-for="comment in comments" :key="comment.id">
                        
                            <div class="col-1">
                                <img :src="'data:image/jpeg;base64,' + comment.userPhoto" alt="Provider Photo"  class="provider-photo"/>
                            </div>
                            <div class="col-11">
                                <div>
    
                                    <h5>{{ comment.userName }}</h5>
                                    <i
                                        v-for="star in 5"
                                        :key="star"
                                        :class="getHeartClass(comment.overallScore, star)"
                                        style="margin: 2px;"
                                    ></i> 
                                    <span style="float: right;">
                                        評論於: {{ comment.commentDate }}
                                    </span>
    
                                </div>
                                <div style="background-color: #F5F5F5; border-radius: 5px;">
    
                                    <p style="padding: 25px 20px 25px 20px; margin: 10px; line-height: 25px;">
                                        {{ comment.commentContent }}
                                    </p>
    
                                </div>
                            </div>
                        
                    </div>
                </div>
    
                <!-- 評論區 -->
                <div v-if="pages>=2">
                    <Paginate 
                            v-model="current"    
                            :page-count="pages"
                            :click-handler="callFind"
                            :initial-page="current"
                            :first-last-button="true"
                            first-button-text="&lt;&lt;"
                            last-button-text="&gt;&gt;"
                            prev-text="&lt;"
                            next-text="&gt;"
                            style="float: right; margin-right: 20px;">
                    </Paginate>
                </div>
            </div>
        </div>
    </div>
    <div v-else>
        尚無評價!
    </div>
</template>
    
<script setup>
    import { onMounted, ref, watch } from 'vue';
    import { defineProps } from 'vue';
    import Paginate from 'vuejs-paginate-next';
    import axiosapi from '@/plugins/axios.js';
    
    // 接收父組件傳遞過來的參數
    const props = defineProps({
        roomId: String, // 傳遞 roomId 數據
    });
    
    // 載入頁面時加載評價訊息
    onMounted(async()=>{
        await callFind(1);
    })
    
    const comments = ref([]);

    // 控制排序選項
    const selectedOption = ref({ key: "commentDate", desc: true });
    const selected = ref(selectedOption.value.key);
    const desc = ref(selectedOption.value.desc);

    // 各項平均分數
    const cleanessScore = ref(0);
    const comfortScore = ref(0);
    const locationScore = ref(0);
    const facilityScore = ref(0);
    const pationessScore = ref(0);
    const recommendationScore = ref(0);
    const overallScore = ref(0);
    const hasScore = ref(false);

    //分頁 start
    const start = ref(0);
    const rows = ref(10);
    const current = ref(1);
    const pages = ref(0);
    const total = ref(0);
    const lastPageRows = ref(0);
    //分頁 end


    // 監聽 selectedOption 變化，更新 selected 和 desc
    watch(
        selectedOption,
        (newVal) => {
            selected.value = newVal.key;
            desc.value = newVal.desc;
        },
        { immediate: true } // 立即執行以初始化
    );

    // 獲取星星的 class
    const getHeartClass = (score, star) => {

        // 檢查是否該顯示填滿的心形
        if (score/2 >= star ) {
            return "bi bi-suit-heart-fill"; // 填滿的心形
        }
        return "bi bi-suit-heart"; // 空心的心形
    };

    // 查詢此 room 的評價
    async function callFind(page){
        if(page) {
            current.value = page;
            start.value = (page - 1) * rows.value;
        } else {
            current.value = 1;
            start.value = 0;
        }

        // 去後端查詢room的總評價分數
        try{

            let response = await axiosapi.get(`/order/comment/avg/${props.roomId}`);

            if(response.data.success){
                hasScore.value = true;
            }
            cleanessScore.value = response.data.obj.cleanessTotalScore.toFixed(1);
            comfortScore.value = response.data.obj.comfortTotalScore.toFixed(1);
            locationScore.value = response.data.obj.locationTotalScore.toFixed(1);
            facilityScore.value = response.data.obj.facilityTotalScore.toFixed(1);
            pationessScore.value = response.data.obj.pationessTotalScore.toFixed(1);
            overallScore.value = response.data.obj.overallTotalScore.toFixed(1);
            recommendationScore.value = response.data.obj.recommendationTotalScore.toFixed(1);

        }catch (error) {
                console.error('Failed to fetch room evaluation:', error);
        }

        //去後端查詢room的評論區
        try{
            let request = {
                "start": start.value,
                "max": rows.value,
                "desc": desc.value,
                "order": selected.value,
                "roomId":props.roomId
            };
            
            // 送去後端
            let response = await axiosapi.post("/order/comment/find", request);
            comments.value = response.data.list;
            total.value = response.data.count;

            //分頁start
            pages.value = Math.ceil(total.value / rows.value);
            lastPageRows.value = total.value % rows.value;
            //分頁end

        }catch (error) {
                console.error('Failed to fetch comment contents:', error);
        }
    }
    
</script>
    
<style scoped>

.provider-photo {
    width: 100%;
    object-fit: cover;
    border-radius: 50%;
    margin-right: 15px;
}
    
</style>