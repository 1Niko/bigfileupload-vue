<template>
  <div id="app">
    <router-view/>
    <!-- 将上传组件全局注册 -->
    <global-uploader></global-uploader>
  </div>

</template>
<script>
import globalUploader from '@/components/GlobalUploader.vue'

export default {
  name: 'app',
  data() {
    return {}
  },
  components: {
    globalUploader
  },
  computed: {},
  created() {
  },
  watch: {},
}
</script>

<style>

</style>
