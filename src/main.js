import { createApp } from 'vue'
import App from './App.vue'
import router from './routers/router.js';
import { createPinia } from 'pinia'
import piniaPersist from 'pinia-plugin-persistedstate'

/* import the fontawesome core */
import { library } from '@fortawesome/fontawesome-svg-core'

/* import font awesome icon component */
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

/* import specific icons */
import { fas } from '@fortawesome/free-solid-svg-icons'

/* add icons to the library */
library.add(fas);

const pinia = createPinia();
pinia.use(piniaPersist)


const app = createApp(App);
app.use(router);
app.component('font-awesome-icon', FontAwesomeIcon);

app.use(pinia);
app.mount('#app');