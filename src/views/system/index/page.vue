<template>
  <d2-container class="page">
    <el-row type="flex" class="row-bg" justify="center">
      <el-col :span="6">
        
        <h3>欢迎登陆trinity管理后台</h3>
      </el-col>
    </el-row>
    <!-- <d2-page-cover>
      <d2-icon-svg class="logo" name="d2-admin"/>
      <template slot="footer">
        <div class="btn-group">
          <div>欢迎登陆trinity管理后台</div>
        </div>
        <d2-badge/>
        <d2-help/>
      </template>
    </d2-page-cover>-->
  </d2-container>
</template>

<script>
import D2Badge from "./components/d2-badge";
import D2Help from "./components/d2-help";
import D2PageCover from "./components/d2-page-cover";
export default {
  components: {
    D2Badge,
    D2Help,
    D2PageCover
  },
  data() {
    return {
      filename: __filename
    };
  }
};
</script>

<style lang="scss" scoped>
.page {
  .logo {
    width: 120px;
  }
  .btn-group {
    color: $color-text-placehoder;
    font-size: 12px;
    line-height: 12px;
    margin-top: 0px;
    margin-bottom: 20px;
    .btn-group__btn {
      color: $color-text-sub;
      &:hover {
        color: $color-text-main;
      }
      &.btn-group__btn--link {
        color: $color-primary;
      }
    }
  }
}
</style>
