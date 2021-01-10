<template>
  <div class="file-upload">
    <div class="file_contain">
      <h1>大文件分片上传、极速秒传</h1>
      <div class="file-upload-el">

        <el-upload
            class="upload-demo"
            drag
            ref="upload"
            :limit=1
            :action="actionUrl"
            :on-exceed="handleExceed"
            :on-remove="handleRemove"
            :http-request="handUpLoad"
            :auto-upload="false"
        >
          <i class="el-icon-upload"></i>
          <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
        </el-upload>
        <el-button style="margin-left: 10px;" size="small" type="success" @click="submitUpload">上传到服务器</el-button>
        上传进度：
        <el-progress type="circle" :percentage="percent" :status="f_status" :width="50"></el-progress>
      </div>
      <div>
        <template>
          <el-table
              :data="tableData"
              stripe
              style="width: 100%">
            <el-table-column
                prop="id"
                label="id"
                width="180">
            </el-table-column>
            <el-table-column
                prop="fname"
                label="文件名"
                width="180">
            </el-table-column>
            <el-table-column
                prop="address"
                label="操作">
              <template slot-scope="scope">
                <el-button @click="handleClick(scope.row)" type="text" size="small">下载</el-button>
              </template>
            </el-table-column>
          </el-table>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "FileUpload",
  data() {

    return {
      actionUrl: 'http://localhost/upload',//上传的后台地址
      shardSize: 10 * 1024 * 1024,//分片大小10M
      videoUrl: '',
      percent: 0,
      f_status: null,
      tableData: [{
        date: '2016-05-02',
        name: '王小虎',
        address: '上海市普陀区金沙江路 1518 弄'
      }]
    };

  },
  mounted() {
    this.getFileList();
  },
  methods: {

    handleExceed(files, fileList) {
      this.$message.warning(`当前限制选择 1个文件，本次选择了 ${files.length} 个文件，共选择了 ${files.length + fileList.length} 个文件`);
    },
    handleRemove(file, fileList) {
      this.f_status = null;
      this.percent = 0;
    },
    submitUpload() {
      this.$refs.upload.submit();
    },
    async check(key) {
      //检查分片
      var res = await this.$http.get('/check', {
        params: {'key': key}
      })
      let resData = res.data;
      return resData.data;
    },
    async recursionUpload(param, file) {
      //FormData私有类对象，访问不到，可以通过get判断值是否传进去
      let _this = this;
      let key = param.key;
      let shardIndex = param.shardIndex;
      let shardTotal = param.shardTotal;
      let shardSize = param.shardSize;
      let size = param.size;
      let fileName = param.fileName;
      let suffix = param.suffix;

      let fileShard = _this.getFileShard(shardIndex, shardSize, file);

      //param.append("file", fileShard);//文件切分后的分片
      //param.file = fileShard;
      let totalParam = new FormData();
      totalParam.append('file', fileShard);//文件名
      totalParam.append("key", key);//标识符
      totalParam.append("shardIndex", shardIndex);
      totalParam.append("shardSize", shardSize);
      totalParam.append("shardTotal", shardTotal);
      totalParam.append("size", size);
      totalParam.append("fileName", fileName);//文件名
      totalParam.append("suffix", suffix);
      let config = {
        //添加请求头
        headers: {"Content-Type": "multipart/form-data"}
      };
      console.log(param);
      var res = await this.$http.post('/upload', totalParam, config)

      var resData = res.data;
      if (resData.status) {
        this.percent = parseInt(shardIndex / shardTotal * 100);
        if (this.percent = 100) {
          this.$message({
            message: '文件上传成功',
            type: 'success'
          });
          this.f_status = "success";
        }

        if (this.percent != 100) {
          console.log('下一份片开始。。。。。。');
          // 上传下一个分片
          param.shardIndex = param.shardIndex + 1;
          _this.recursionUpload(param, file);
        }
      } else {
        this.$message({
          message: '文件上传失败',
          type: 'failu'
        });
        this.f_status = "success";
      }


    },

    async handUpLoad(req) {
      let _this = this;
      var file = req.file;


      //文件名称和格式，方便后台合并的时候知道要合成什么格式
      let fileName = file.name;
      let suffix = fileName.substring(fileName.lastIndexOf(".") + 1, fileName.length).toLowerCase();
      //这里判断文件格式，有其他格式的自行判断
      if (!(!fileName.endsWith('.mp4') || !fileName.endsWith('.flv') || !fileName.endsWith('.pdf') || !fileName.endsWith('.rar'))) {
        console.log(!fileName.endsWith('.pdf'))
        this.$message.error('文件格式错了哦。。');
        return;
      }

      // 文件分片
      // let shardSize = 10 * 1024 * 1024;    //以10MB为一个分片
      // let shardSize = 50 * 1024;    //以50KB为一个分片
      let shardSize = _this.shardSize;
      let shardIndex = 1;		//分片索引，1表示第1个分片
      let size = file.size;
      let shardTotal = Math.ceil(size / shardSize); //总片数
      // 生成文件标识，标识多次上传的是不是同一个文件
      let key = this.$md5(file.name + file.size + file.type);
      let param = {
        key: key,
        shardIndex: shardIndex,
        shardSize: shardSize,
        shardTotal: shardTotal,
        size: size,
        fileName: fileName,
        suffix: suffix
      }

      let checkIndexData = await _this.check(key);//得到文件分片索引
      let checkIndex = checkIndexData.findex;

      //console.log(checkIndexData)
      if (checkIndex == -1) {
        this.recursionUpload(param, file);
      } else if (checkIndex < shardTotal) {
        param.shardIndex = param.shardIndex + 1;
        this.recursionUpload(param, file);
      } else {
        this.percent = 100;
        this.f_status = "success"
        this.$message({
          message: '极速秒传成功。。。。。',
          type: 'success'
        });
      }


      //console.log('结果：', res)
    },

    getFileShard(shardIndex, shardSize, file) {
      let _this = this;
      let start = (shardIndex - 1) * shardSize;	//当前分片起始位置
      let end = Math.min(file.size, start + shardSize); //当前分片结束位置
      let fileShard = file.slice(start, end); //从文件中截取当前的分片数据
      return fileShard;
    },

    async getFileList() {
      let res = await this.$http.get('/list');
      this.tableData = res.data.data;
      console.log(this.tableData);
    },
    handleClick(file){

    }

  }
}

</script>

<style scoped lang="less">
.file-upload {
  display: flex;
  justify-content: center;
  align-items: center;

  .file_contain {

  }

}
</style>