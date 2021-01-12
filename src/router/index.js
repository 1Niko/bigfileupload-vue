import Vue from 'vue'
import VueRouter from 'vue-router'
import FileUpload from "../views/FileUpload";
import demo from "@/views/demo";



Vue.use(VueRouter);

  const routes = [
  // {
  //   path: '/',
  //   name: 'FileUpload',
  //   component: FileUpload
  // },
  {
    path: '/',
    name: 'demo',
    component: demo
  },

]

const router = new VueRouter({
  routes
})

export default router
