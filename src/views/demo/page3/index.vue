<template>
  <d2-container>
    <template slot="header">
      <span>菜单编辑</span>
      <br />
      <span>
        <el-switch
          style="display: block"
          v-model="is_show_deleted"
          active-color="#13ce66"
          inactive-color="#ccc"
          active-text="显示禁用"
          inactive-text="不显示禁用"
        ></el-switch>
      </span>
    </template>
    <el-row>
      <el-button type="text" size="mini" @click="() => handleEdit({level:0}, 'append')">
        &nbsp;
        <i class="el-icon-edit"></i> &nbsp;添加1级标题
      </el-button>
    </el-row>
    <el-row>
      <el-col :span="18">
        <el-tree
          :data="list"
          node-key="id"
          :expand-on-click-node="false"
          :filter-node-method="filterNode"
          ref="tree"
          default-expand-all
        >
          <div class="custom-tree-node" slot-scope="{ node, data }">
            <div
              :style="node.data.is_deleted?{
                textDecoration: 'line-through',
              }:{}"
            >
              <span style="color: #F56C6C;" v-if="node.data.is_deleted">禁用</span>
              <span style="font-size: 8px">({{node.data.level}}级)</span>
              &nbsp;
              &nbsp;
              <b>{{ node.data.name }}</b>
              &nbsp;
              &nbsp;
              &nbsp;
              &nbsp;
              <span
                v-if="node.data.english_name"
              >[{{node.data.english_name}}]</span>
              <span style="color: #909399" v-else>[无英文名称]</span>
              &nbsp;
              &nbsp;
              &nbsp;
              &nbsp;
              <span
                style="color: #909399"
              >[{{node.data.weights}}]</span>
            </div>
            <span>
              <el-button
                type="text"
                size="mini"
                @click="() => editArticle(node, data)"
                style="color: #E6A23C"
                v-if="isArticleEdit(data)"
              >修改文章</el-button>
              <el-button
                type="text"
                size="mini"
                @click="() => editArticle(node, data)"
                style="color: #67C23A"
                v-if="isArticleAppand(data)"
              >添加文章</el-button>

              <el-button
                type="text"
                size="mini"
                @click="() => handleEdit(data, 'append')"
                v-if="node.data.level<=2 && node.data.is_deleted === 0"
                style="color: #66b1ff"
              >添加子标题</el-button>

              <el-button type="text" size="mini" @click="() => handleEdit(data, 'edit')">编辑标题</el-button>
            </span>
          </div>
        </el-tree>
      </el-col>
    </el-row>
    <el-dialog
      :title="curItem.type==='edit'? '编辑标题': '添加标题'"
      :visible.sync="drawer"
      :with-header="false"
      :before-close="handleClose"
    >
      <div v-if="!isEmpty">
        <!-- <div style="padding: 10px">
          <el-image style="width: 100%; height: 250px" :src="`${host}${curItem.path}`" fit="fit"></el-image>
        </div>-->
        <el-form ref="form" :model="curItem" label-width="70px">
          <el-form-item label="id" v-show="curItem.id">{{curItem.id}}</el-form-item>
          <el-form-item label="标题级别">{{curItem.level}}级标题</el-form-item>
          <el-form-item label="名称" required>
            <el-input v-model="curItem.name" placeholder="请输入名称"></el-input>
          </el-form-item>
          <el-form-item label="英文" required>
            <el-input v-model="curItem.english_name" placeholder="请输入english_name(名称翻译)"></el-input>
          </el-form-item>
          <el-form-item label="是否禁用">
            <el-checkbox v-model="curItem.is_deleted">禁用</el-checkbox>
          </el-form-item>
          <el-form-item label="权重" :rules="[{ type: 'number', message: '权重必须为数字值'}]">
            <el-input v-model.number="curItem.weights"></el-input>
          </el-form-item>
          <el-form-item v-show="curItem.level === 1">
            <el-upload
              class="upload-demo"
              :action="action"
              :file-list="fileList"
              :before-upload="uploadFileBefore"
              list-type="picture"
              :limit="2"
              :on-success="handleFileSuccess"
            >
              <el-button size="small" type="primary">图片</el-button>
              <span slot="tip" class="el-upload__tip">&nbsp;(从上往下数,1是导航小图;2是页面大图)</span>
            </el-upload>
          </el-form-item>
          <el-form-item>
            <el-button
              type="primary"
              @click="handeSubmit"
              v-loading.fullscreen.lock="fullscreenLoading"
            >{{curItem.type==='edit'?'修改':'提交'}}</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-dialog>
  </d2-container>
</template>

<script>
import { getTitle, putTitle, postTitle } from "@/api/ajax";
import _ from "lodash";
const STATIC_HOST = process.env.VUE_APP_STATIC_HOST;

let id = 1000;
export default {
  name: "page3",
  data() {
    return {
      action: `${STATIC_HOST}/api/v1/upload`,
      list: [],
      curItem: {},
      drawer: false,
      fullscreenLoading: false,
      fileList: [
        // {
        //   name: "hello",
        //   url: `${STATIC_HOST}/public/upload/image/WechatIMG102748.jpeg`
        // }
      ],
      host: STATIC_HOST,
      is_show_deleted: true
    };
  },
  created() {
    this.refleshData();
  },
  computed: {
    isEmpty() {
      return _.isEmpty(this.curItem);
    }
  },
  watch: {
    is_show_deleted(val) {
      this.$refs.tree.filter(val);
    }
  },
  methods: {
    filterNode(value, data) {
      if (data.is_deleted === 1) {
        if (value) {
          return true;
        } else {
          return false;
        }
      } else {
        return true;
      }
    },
    shouldShowDeleted(is_deleted) {
      console.log(is_deleted);
      if (is_deleted === 1) {
        if (this.is_show_deleted === false) {
          return true;
        }
      }
      return false;
    },
    editArticle(node, data) {
      console.log(node, data);
      let query = {
        id: data.id,
        name: data.name
      };
      if (this.isArticleEdit(data)) {
        query.article_id = data.article_id;
      }
      this.$router.push({
        name: "edit_article",
        query
      });
    },
    isArticleEdit(data) {
      if (data.level === 1) {
        return false;
      }
      if (data.children.length !== 0) {
        return false;
      }
      if (data.article_id) {
        return true;
      } else {
        return false;
      }
    },
    isArticleAppand(data) {
      if (data.level === 1) {
        return false;
      }
      if (data.children.length !== 0) {
        return false;
      }
      if (data.article_id) {
        return false;
      } else {
        return true;
      }
    },
    warn(msg) {
      return this.$message({
        message: msg,
        type: "warning"
      });
    },
    handleFileSuccess(response, file, fileList) {
      this.fileList = fileList;
      console.log(response, file, fileList);
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
    handeSubmit() {
      let self = this;
      let thumb_image = "";
      let cover = "";
      if (!self.curItem.name || !self.curItem.english_name) {
        this.warn("请填写名称");
        return;
      }
      if (self.curItem.level === 1) {
        if (this.fileList.length === 2) {
          thumb_image = _.get(
            self,
            "fileList[0].response.data.path",
            self.fileList[0]._path
          );
          cover = _.get(
            self,
            "fileList[1].response.data.path",
            self.fileList[1]._path
          );
        } else if (this.fileList.length === 1) {
          thumb_image = _.get(
            self,
            "fileList[0].response.data.path",
            self.fileList[0]._path
          );
          cover = "";
        } else {
          this.warn("请上传导航小图");
          return;
        }
      }
      let putBody = {
        name: self.curItem.name,
        english_name: self.curItem.english_name,
        is_deleted: self.curItem.is_deleted ? 1 : 0,
        weights: self.curItem.weights
      };
      this.fullscreenLoading = true;

      if (self.curItem.type === "edit") {
        let putBody = {
          name: self.curItem.name,
          english_name: self.curItem.english_name,
          is_deleted: self.curItem.is_deleted ? 1 : 0,
          thumb_image,
          cover,
          weights: self.curItem.weights
        };
        putTitle(putBody, self.curItem.id)
          .then(_ => {
            return this.refleshData();
          })
          .then(_ => {
            this.curItem = {};
            this.closeDrawer();
          })
          .catch(_ => {
            this.curItem = {};
            this.closeDrawer();
          });
      } else {
        let postBody = {
          name: self.curItem.name,
          parent_id: self.curItem.parent_id,
          english_name: self.curItem.english_name,
          level: self.curItem.level,
          is_deleted: 0,
          article_id: self.curItem.article_id,
          thumb_image,
          cover,
          weights: self.curItem.weights
        };
        postTitle(postBody)
          .then(_ => {
            return this.refleshData();
          })
          .then(_ => {
            this.curItem = {};
            this.closeDrawer();
          })
          .catch(_ => {
            this.curItem = {};
            this.closeDrawer();
          });
      }
    },
    closeDrawer() {
      this.fullscreenLoading = false;
      this.drawer = false;
      this.fileList = [];
    },
    handleEdit(row, type) {
      let node = _.clone(row);
      let self = this;
      this.fileList = [];
      node.type = type;
      if (type === "edit") {
        node.is_deleted = !!node.is_deleted;
        if (row.level === 1) {
          if (row.thumb_image) {
            let thumb_image = `${self.host}${row.thumb_image}`;
            this.fileList.push({
              url: thumb_image,
              _path: row.thumb_image,
              name: "thumb_image"
            });
          }
          if (row.cover) {
            let cover = `${self.host}${row.cover}`;
            this.fileList.push({
              url: cover,
              _path: row.cover,
              name: "cover"
            });
          }
        }
      } else {
        node.id = "";
        node.name = "";
        node.parent_id = row.id;
        node.english_name = "";
        node.level = row.level + 1;
        node.is_deleted = 0;
        node.article_id = null;
        node.thumb_image = "";
        node.cover = "";
        node.weights = 0;
      }

      this.curItem = node;
      this.drawer = true;
    },
    handleClose(done) {
      this.$confirm("确认放弃编辑？")
        .then(_ => {
          this.curItem = {};
          done();
        })
        .catch(_ => {});
    },

    refleshData() {
      return getTitle({
        is_format: 1
      }).then(res => {
        this.list = res;
        console.log(res);
      });
    }
  }
};
</script>

<style>
.custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  padding-right: 8px;
}
</style>
