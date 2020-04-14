<template>
  <d2-container>
    <template slot="header">
      <el-row>{{pageName}}管理</el-row>
      <br />
      <!-- <el-row>
        <el-button
          size="mini"
          :type="pageName ==='banner'?'':'primary'"
          @click="togglePage('banner')"
          :loading="buttonLoading"
        >banner</el-button>
        <el-button
          size="mini"
          :type="pageName ==='video'?'':'primary'"
          @click="togglePage('video')"
          :loading="buttonLoading"
        >video</el-button>
      </el-row>-->
    </template>
    <el-table :data="list" style="width: 100%" :row-class-name="is_deleted?'warning-row':''">
      <el-table-column prop="id" label="id" width="100"></el-table-column>
      <el-table-column prop="path" :label="pageName ==='banner'?'图片':'封面'">
        <template slot-scope="scope">
          <el-image style="width: 100px; height: 100px" :src="`${host}${scope.row.path}`" fit="fit"></el-image>
        </template>
      </el-table-column>

      <el-table-column prop="video_path" label="视频" v-if="pageName ==='video'">
        <template slot-scope="scope">
          <i
            class="el-icon-video-play"
            @click="handlePlay(scope.$index, scope.row)"
            v-if="scope.row.video_path"
            type="primary"
            style="font-size: 24px; cursor: pointer"
          ></i>
          <span v-else style="color:#F56C6C">无视频地址</span>
        </template>
      </el-table-column>

      <el-table-column prop="video_title" label="标题" v-if="pageName ==='video'">
        <template slot-scope="scope">
          <span
            @click="handlePlay(scope.$index, scope.row)"
            v-if="scope.row.video_title"
          >{{scope.row.video_title}}</span>
          <span v-else style="color:#F56C6C">无标题</span>
        </template>
      </el-table-column>
      <el-table-column prop="video_english_title" label="英语标题" v-if="pageName ==='video'">
        <template slot-scope="scope">
          <span
            @click="handlePlay(scope.$index, scope.row)"
            v-if="scope.row.video_english_title"
          >{{scope.row.video_english_title}}</span>
          <span v-else style="color:#F56C6C">无英语标题</span>
        </template>
      </el-table-column>
      <el-table-column prop="type" label="类型" width="100"></el-table-column>
      <el-table-column prop="weights" label="权重" width="100"></el-table-column>
      <el-table-column
        prop="is_deleted"
        label="是否禁用"
        width="130"
        :filters="[{ text: '是', value: 1 }, { text: '否', value: 0 }]"
        :filter-method="filterTag"
        filter-placement="bottom-end"
      >
        <template slot-scope="scope">
          <el-tag
            :type="scope.row.is_deleted === 1 ? 'warning' : 'success'"
            disable-transitions
          >{{scope.row.is_deleted?"是":"否"}}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button size="mini" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
          <el-button size="mini" type="danger" @click="handleDelete(scope.$index, scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-drawer title="编辑" :visible.sync="drawer" :with-header="false" :before-close="handleClose">
      <div v-if="!isEmpty" style="padding: 15px">
        <div style="padding: 10px">
          <el-image style="width: 100%; height: 250px" :src="`${host}${curItem.path}`" fit="fit"></el-image>
        </div>
        <el-form ref="form" :model="curItem" label-width="80px">
          <el-form-item label="id">{{curItem.id}}</el-form-item>
          <el-form-item label="类型">{{curItem.type}}</el-form-item>

          <el-form-item label="是否禁用">
            <el-checkbox v-model="curItem.is_deleted">禁用</el-checkbox>
          </el-form-item>
          <el-form-item label="权重" :rules="[{ type: 'number', message: '权重必须为数字值'}]">
            <el-input v-model.number="curItem.weights"></el-input>
          </el-form-item>
          <el-form-item label="标题" :rules="[{ type: 'text', message: '标题为字符串'}]">
            <el-input v-model="curItem.video_title" placeholder="请输入标题"></el-input>
          </el-form-item>
          <el-form-item label="英语标题" :rules="[{ type: 'text', message: '标题为字符串'}]">
            <el-input v-model="curItem.video_english_title" placeholder="请输入英语标题"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button
              type="primary"
              @click="handleChange"
              v-loading.fullscreen.lock="fullscreenLoading"
            >修改</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-drawer>
    <el-dialog title="播放视频" :visible.sync="dialogTableVisible" @close="handleDialogClose">
      <div class="video_wrap">
        <video :src="videoSrc" controls></video>
      </div>
    </el-dialog>
  </d2-container>
</template>

<style>
.el-table .warning-row {
  background: oldlace;
}

.el-table .success-row {
  background: #f0f9eb;
}
.video_wrap {
}
.video_wrap > video {
  width: 100%;
  max-height: 500px;
}
</style>

<script>
import { getStatic, putStatic, deleteStatic } from "@/api/ajax";
const STATIC_HOST = process.env.VUE_APP_STATIC_HOST;

export default {
  name: "page2",
  data() {
    return {
      pageName: null,
      is_deleted: "",
      host: STATIC_HOST,
      list: [],
      drawer: false,
      curItem: {},
      fullscreenLoading: false,
      buttonLoading: false,
      dialogTableVisible: false,
      videoSrc: ""
    };
  },
  props: ["type"],
  computed: {
    isEmpty() {
      console.log(this.curItem);
      return _.isEmpty(this.curItem);
    }
    // pageName() {
    //   return this.type;
    // }
  },
  watch: {
    type: {
      deep: true,
      handler(nv, ov) {
        this.refleshData().then(_ => {
          this.pageName = nv;
        });
      }
    }
  },
  created() {
    this.pageName = this.type;
    this.refleshData();
  },
  methods: {
    handleDialogClose() {
      console.log("=============video close");
      this.videoSrc = "";
    },
    handlePlay(idx, row) {
      this.videoSrc = `${this.host}${row.video_path}`;
      this.dialogTableVisible = true;
      console.log(idx, row);
    },
    filterTag(value, row) {
      return row.is_deleted === value;
    },
    togglePage(pageName) {
      if (pageName === this.pageName) {
        return;
      }
      this.buttonLoading = true;
      this.pageName = pageName;
      this.refleshData().then(_ => {
        this.buttonLoading = false;
      });
    },

    handleClose(done) {
      this.$confirm("确认放弃编辑？")
        .then(_ => {
          this.curItem = {};
          done();
        })
        .catch(_ => {});
    },
    handleChange() {
      let self = this;
      let id = this.curItem.id;
      let body = {
        weights: self.curItem.weights,
        is_deleted: self.curItem.is_deleted ? 1 : 0,
        video_english_title: self.curItem.video_english_title,
        video_title: self.curItem.video_title
      };
      this.fullscreenLoading = true;
      putStatic(body, id)
        .then(res => {
          return this.refleshData();
        })
        .then(_ => {
          this.fullscreenLoading = false;
          this.drawer = false;
        })
        .catch(_ => {
          this.fullscreenLoading = false;
          this.drawer = false;
        });
    },
    handleEdit(index, row) {
      row = _.clone(row);
      row.is_deleted = !!row.is_deleted;
      this.curItem = row;
      this.drawer = true;
    },
    handleDelete(index, row) {
      this.$confirm("此操作将永久删除该资源, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          this.fullscreenLoading = true;
          deleteStatic(row.id)
            .then(_ => {
              return this.refleshData();
            })
            .then(_ => {
              this.fullscreenLoading = false;
              this.$message({
                type: "success",
                message: "删除成功!"
              });
            })
            .catch(_ => {
              this.fullscreenLoading = false;
            });
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除"
          });
        });
    },
    refleshData() {
      let self = this;
      return getStatic({
        type: self.type,
        is_deleted: self.is_deleted
      }).then(data => {
        this.fullscreenLoading = false;
        this.list = data;
        console.log(data);
      });
    }
  }
};
</script>
