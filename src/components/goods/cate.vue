<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片 -->
    <el-card>
      <el-row :gutter="20">
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
        </el-col>
      </el-row>

      <!-- 商品分类列表区域 -->
      <tree-table
        :data="goodsCategoryList"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        show-index index-text="#"
        border
        :show-row-hover="false">
        <template slot="isok" slot-scope="scope"></template>
      </tree-table>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'cate',
  data() {
    return {
      // 查询条件
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      // 商品分类列表
      goodsCategoryList: [],
      // 总数据条数
      total: 0,
      // table列的定义
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          prop: 'cat_name',
          type: 'template',
          template: 'isok'
        }
      ]
    }
  },
  created () {
    this.getGoodsCategoryList()
  },
  methods: {
    // 获取商品分类列表
    async getGoodsCategoryList() {
      const { data: res } = await this.$http.get('/categories', { params: this.queryInfo })
      if (res.meta.status !== 200) return this.$message.error('获取商品分类列表失败')
      this.goodsCategoryList = res.data.result
      this.total = res.data.total
    }
  }
}
</script>

<style scoped lang="less">

</style>
