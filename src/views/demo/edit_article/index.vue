<template>
  <d2-container>
    <template slot="header">
      <span style="display:inline-block; padding-right:20px;">{{query.name || '编辑文章'}}</span>
      <span>
        <el-switch
          style="display: block"
          v-model="is_content"
          active-color="#13ce66"
          inactive-color="#ff4949"
          active-text="中文"
          inactive-text="英文"
          @change="handleSwitchChange"
        ></el-switch>
      </span>
      <!-- <el-cascader
        v-model="selectValue"
        :options="options"
        ref="tree"
        placeholder="请选择标题"
        :props="{value: 'id', label: 'name'}"
      ></el-cascader>

      <b
        style="display:inline-block; padding-left:10px; color: #F56C6C; font-size: 8px"
      >标题必选(不能选择一级标题)*</b>-->
    </template>
    <d2-quill style="min-height: 200px; margin-bottom: 20px;" v-model="html" />
    <template slot="footer">
      <el-button
        type="primary"
        @click="handleSubmit"
        v-loading.fullscreen.lock="fullscreenLoading"
      >提交</el-button>

      <el-button type="primary" @click="drawer=true">上传图片</el-button>
      <el-button
        type="danger"
        @click="handleDelete"
        v-loading.fullscreen.lock="fullscreenLoading"
        v-if="query.article_id?true:false"
      >删除</el-button>
    </template>

    <el-drawer :visible.sync="drawer" :with-header="false">
      <div style="padding: 20px;">
        <el-card shadow="never" class="d2-card d2-mt">
          <!-- <d2-highlight :code="html" format-html /> -->
          <p>最多可以上传{{limit}}张</p>
          <el-upload
            class="upload-demo"
            :action="action"
            :file-list="fileList"
            :before-upload="uploadFileBefore"
            list-type="picture"
            :limit="limit"
            :on-success="handleFileSuccess"
          >
            <el-button size="small" type="primary">上传图片</el-button>
          </el-upload>
        </el-card>
        <br />
        <el-button size="small" type="primary" @click="addImg">确定</el-button>
      </div>
    </el-drawer>
  </d2-container>
</template>

<script>
import {
  getTitle,
  postArticle,
  putArticle,
  getArticle,
  deleteArticle
} from "@/api/ajax";
import _ from "lodash";
import { mapActions, mapState } from "vuex";

const STATIC_HOST = process.env.VUE_APP_STATIC_HOST;

export default {
  name: "edit_article",
  data() {
    return {
      action: `${STATIC_HOST}/api/v1/upload`,
      selectValue: [],
      html: "",
      drawer: false,
      options: [],
      fullscreenLoading: false,
      fileList: [],
      limit: 5,
      is_content: true,
      data: {}
    };
  },
  computed: {
    ...mapState("d2admin/page", [
      "current" //用户获取当前页面的地址，用于关闭
    ])
  },
  created() {
    this.refleshData();
    console.log(this.$router);
  },
  props: ["query"],
  methods: {
    ...mapActions("d2admin/page", ["close"]),
    handleSwitchChange() {
      if (this.query.article_id) {
        if (this.is_content === false) {
          this.html = this.data.english_content || '';
        } else {
          this.html = this.data.content || ''
        }
      }
    },
    handleDelete() {
      this.$confirm("此操作将永久删除该文章, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          this.fullscreenLoading = true;
          let query = this.query;
          deleteArticle(query.id, query.article_id)
            .then(_ => {
              let tagName = this.current;
              this.close({
                tagName: tagName
              });
              setTimeout(() => {
                this.fullscreenLoading = false;
                this.$message({
                  type: "success",
                  message: "删除成功!"
                });
              }, 800);
            })
            .catch(_ => (this.fullscreenLoading = false));
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除"
          });
        });
    },
    addImg() {
      let img = "";
      this.fileList.forEach(item => {
        let path = _.get(item, "response.data.path", false);
        if (path) {
          img += `<img src="${STATIC_HOST}${path}">`;
        }
      });
      this.html += img;
      setTimeout(() => {
        this.fileList = [];
        this.drawer = false;
      }, 200);
    },
    handleFileSuccess(response, file, fileList) {
      this.fileList = fileList;
    },
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
    warn(msg) {
      return this.$message({
        message: msg,
        type: "warning"
      });
    },
    success(msg) {
      return this.$message({
        message: msg,
        type: "success"
      });
    },
    handleSubmit() {
      // let node = this.$refs.tree.getCheckedNodes();
      // let level = _.get(node[0], "data.level", false);
      // if (!level) {
      //   this.warn("请选择标题");
      //   return;
      // } else if (+level === 1) {
      //   this.warn("不能选择一级标题");
      //   return;
      // }
      console.log(this.html)
      if (!this.html) {
        this.warn("请输入内容");
        return;
      }
      let content = this.html;
      let query = this.query;
      this.fullscreenLoading = true;
      let body = {};
      if (this.is_content) {
        body.content = this.html;
      } else {
        body.english_content = this.html;
      }

      if (query.article_id) {
        // 修改

        putArticle(body, query.article_id)
          .then(data => {
            this.fullscreenLoading = false;
            this.success("修改成功");
          })
          .catch(_ => {
            this.fullscreenLoading = false;
          });
      } else {
        // 新增
        let title_id = query.id;
        postArticle(body, title_id)
          .then(data => {
            console.log(data);
            this.fullscreenLoading = false;
            let { query } = this;
            this.$router.replace({
              name: "edit_article",
              query: {
                id: query.id,
                name: query.name,
                article_id: data.article_id
              }
            });
            return this.refleshData(data.article_id)
          })
          .then(_=> {
            this.success("新增成功");
          })
          .catch(_ => {
            this.fullscreenLoading = false;
          });
      }
    },
    refleshData(article_id) {
      // return getTitle({
      //   is_format: 2
      // }).then(data => {
      //   this.options = data;
      //   console.log(data);
      // });
      console.log('reflesh data')
      if (this.query.article_id || article_id) {
        console.log('ok')
        this.fullscreenLoading = true;
        return getArticle(this.query.article_id || article_id).then(data => {
          this.fullscreenLoading = false;
          console.log(data);
          this.html = data.content;
          this.data = data;
        });
      }
    }
  }
};
</script>
