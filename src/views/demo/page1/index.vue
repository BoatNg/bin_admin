<template>
  <d2-container>
    <template slot="header">上传资源</template>
    <el-row>
      <el-col :span="10">
        <el-form ref="form" :model="form" label-position="left" label-width="80px">
          <el-form-item label="类型" required>
            <el-radio-group v-model="form.type">
              <el-radio label="video"></el-radio>
              <el-radio label="banner"></el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item
            label="权重"
            :rules="[
            { type: 'number', message: '权重必须为数字值'}
          ]"
          >
            <el-input v-model.number="form.weights"></el-input>
          </el-form-item>
          
          <el-form-item
            label="视频标题"
            :rules="[
            { type: 'text', message: '视频标题为字符串'}
            ]"
            v-show="form.type==='video'"
          >
            <el-input v-model="form.video_title"></el-input>
          </el-form-item>

          <el-form-item
            label="英文标题"
            :rules="[
            { type: 'text', message: '视频英文标题为字符串'}
            ]"
            v-show="form.type==='video'"
          >
            <el-input v-model="form.video_english_title"></el-input>
          </el-form-item>
        </el-form>
        <el-upload
          class="upload-demo"
          :action="action"
          :on-preview="handlePreview"
          :on-remove="handleRemove"
          :file-list="fileList"
          :before-upload="uploadFileBefore"
          list-type="picture"
          :on-success="handleFileSuccess"
          :limit="1"
        >
          <el-button size="small" type="primary">选择图片</el-button>
          <span slot="tip" class="el-upload__tip" v-show="form.type==='video'">&nbsp;(上传封面)</span>
        </el-upload>
        <br />
        <el-row v-show="form.type==='video'">
          <el-upload
            class="upload-demo"
            :action="action"
            :file-list="videoList"
            :before-upload="uploadVideolBefore"
            list-type="picture"
            :on-success="handleVideoSuccess"
            :limit="1"
          >
            <el-button size="small" type="primary">选择视频</el-button>
          </el-upload>
        </el-row>
      </el-col>
    </el-row>

    <template slot="footer">
      <el-row>
        <el-col :span="8">
          <el-button
            size="middle"
            type="primary"
            @click="openFullScreen1"
            v-loading.fullscreen.lock="fullscreenLoading"
          >上传</el-button>
        </el-col>
      </el-row>
    </template>
  </d2-container>
</template>

<script>
import { postStatic } from "@/api/ajax";
import _ from "lodash";
const STATIC_HOST = process.env.VUE_APP_STATIC_HOST;

export default {
  name: "page1",
  data() {
    return {
      action: `${STATIC_HOST}/api/v1/upload`,
      fileList: [
        // {
        //   name: "",
        //   url:""
        // }
      ],
      videoList: [
        // {
        //   name: "",
        //   url:""
        // }
      ],
      fullscreenLoading: false,
      path: "",
      videoPath: "",
      form: {
        weights: 0,
        type: "",
        video_english_title: "",
        video_title: ""
      }
    };
  },
  computed: {},
  methods: {
    uploadFileBefore(file) {
      let photoReg = /(.*)\.(jpg|jpeg|png)$/g;
      if (!photoReg.test(file.name)) {
        this.$message({
          message: "请上传图片文件",
          type: "warning"
        });
        return false;
      }
    },
    uploadVideolBefore(file) {
      let videoReg = /(.*)\.(swf|flv|mp4|rmvb|avi)$/g;
      if (!videoReg.test(file.name)) {
        this.$message({
          message: "请上传视频文件",
          type: "warning"
        });
        return false;
      }
    },
    openFullScreen1() {
      let self = this;
      let photoReg = /(.*)\.(jpg|jpeg|png)$/g;
      let videoReg = /(.*)\.(swf|flv|mp4|rmvb|avi)$/g;
      if (this.form.type === "video") {
        if (!this.videoPath) {
          this.$message({
            message: "视频路径不存在",
            type: "warning"
          });
          return;
        }
      }

      if (
        ["video", "banner"].indexOf(self.form.type) !== -1 &&
        self.form.weights !== "" &&
        self.path !== ""
      ) {
      } else {
        this.$message({
          message: "参数错误",
          type: "warning"
        });
        return;
      }
      
      this.fullscreenLoading = true;
      postStatic({
        type: self.form.type,
        path: self.path,
        weights: self.form.weights,
        video_english_title: self.form.video_english_title,
        video_title: self.form.video_title,
        video_path: self.videoPath
      }).then(() => {
        this.fullscreenLoading = false;
        this.clear();
        this.$message({
          message: "提交成功",
          type: "success"
        });
      });
    },
    clear() {
      this.fileList = [];
      this.videoList = [];
      this.form.type = "";
      this.form.weights = 0;
      this.form.video_english_title = "";
      this.form.video_title = "";
      this.path = "";
      this.videoPath = "";
    },
    handleRemove(file, fileList) {
      console.log(file, fileList);
    },
    handlePreview(file) {
      console.log(file);
    },
    handleFileSuccess(response, file, fileList) {
      this.path = response.data.path;
      console.log(response);
    },
    handleVideoSuccess(response, file, fileList) {
      this.videoPath = response.data.path;
      console.log(response);
    }
  }
};
</script>
