import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

Vue.config.productionTip = false

import ElementUI from 'element-ui';
import './assets/globle.css';
import 'element-ui/lib/theme-chalk/index.css';

Vue.use(ElementUI);


import axios from 'axios'
Vue.prototype.$http = axios

axios.defaults.baseURL='http://localhost/'

/*
* npm install --save js-md5
*
* */
import md5 from 'js-md5';
Vue.prototype.$md5 = md5;

/*
 * npm install vue-simple-uploader --save
 *
 * */
import uploader from 'vue-simple-uploader';

Vue.use(uploader);

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
