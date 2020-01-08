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
          <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
        </el-col>
      </el-row>

      <!-- 商品分类列表区域 -->
      <tree-table
        class="treeTable"
        :data="goodsCategoryList"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        show-index index-text="#"
        border
        :show-row-hover="false">
        <!-- 是否有效 -->
        <template slot="isok" slot-scope="scope">
          <i class="el-icon-success" v-if="scope.row.cat_deleted === false" style="color: lightgreen;"></i>
          <i class="el-icon-error" v-else style="color: red;"></i>
        </template>

        <!-- 排序 -->
        <template slot="order" slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag type="success" size="mini" v-else-if="scope.row.cat_level === 1">二级</el-tag>
          <el-tag type="warning" size="mini" v-else>三级</el-tag>
        </template>

        <!-- 操作 -->
        <template slot="opt" slot-scope="scope">
          {{scope.row.cat_level}}
          <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
          <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
        </template>
      </tree-table>

      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[3, 5, 10, 15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </el-card>

    <!-- 添加分类对话框 -->
    <el-dialog
      title="添加分类"
      :visible.sync="addCateDialogVisible"
      width="30%"
      @close="closeAddDialog">
      <!-- 添加分类表单 -->
      <el-form :model="addCateForm" :rules="addCateRules" ref="addCateFormRef" label-width="100px">
        <el-form-item label="分类名称：" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类：">
          <el-cascader
            :options="parentCateList"
            :props="casCaderProps"
            v-model="selectedKeys"
            @change="parentCateChange"
            clearable></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>
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
      // 父级商品分类列表
      parentCateList: [],
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
          // 当前列为模板列
          type: 'template',
          // 指定该模板列的名称
          template: 'isok'
        },
        {
          label: '排序',
          // 当前列为模板列
          type: 'template',
          // 指定该模板列的名称
          template: 'order'
        },
        {
          label: '操作',
          // 当前列为模板列
          type: 'template',
          // 指定该模板列的名称
          template: 'opt'
        }
      ],
      // 控制 商品分类对话框的显示与隐藏
      addCateDialogVisible: false,
      // 添加商品分类表单数据对象
      addCateForm: {
        // 父级分类等级
        cat_pid: 0,
        cat_name: '',
        // 分类的等级 默认要添加的分类是一级分类
        cat_level: 0
      },
      // 添加商品分类表单验证规则
      addCateRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在3-10字符之间', trigger: 'blur' }
        ]
      },
      // 级联选择器的配置对象
      casCaderProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 级联选择器选中的父级分类的id数组
      selectedKeys: []
    }
  },
  created () {
    this.getGoodsCategoryList()
  },
  methods: {
    // 获取商品分类列表(三级分类列表)
    async getGoodsCategoryList() {
      const { data: res } = await this.$http.get('/categories', { params: this.queryInfo })
      if (res.meta.status !== 200) return this.$message.error('获取商品分类列表失败')
      this.goodsCategoryList = res.data.result
      this.total = res.data.total
    },
    // 获取商品父级分类列表（二级分类列表）
    async getParentCateList() {
      const { data: res } = await this.$http.get('/categories', { params: { type: 2 } })
      console.log(res.data)
      if (res.meta.status !== 200) return this.$message.error('获取父级商品分类列表失败')
      this.parentCateList = res.data
    },
    // 监听 pageSize 分页显示总条数
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getGoodsCategoryList()
    },
    // 监听 pagenum 分页显示当前页
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getGoodsCategoryList()
    },
    showAddCateDialog() {
      this.addCateDialogVisible = true
      this.getParentCateList()
    },
    // 选择项发生变化调用这个函数
    parentCateChange() {
      console.log(this.selectedKeys)
      if (this.selectedKeys.length > 0) {
        // 父级分类的 id
        this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
        // 为当前分类的等级赋值
        this.addCateForm.cat_level = this.selectedKeys.length
      } else {
        // 父级分类的 id
        this.addCateForm.cat_pid = 0
        // 为当前分类的等级赋值
        this.addCateForm.cat_level = 0
      }
    },
    // 监听对话框的关闭事件，重置表单数据
    closeAddDialog() {
      this.$refs.addCateFormRef.resetFields()
      this.selectedKeys = []
      this.addCateForm.cat_level = 0
      this.addCateForm.cat_pid = 0
    },
    addCate() {
      console.log(this.addCateForm)
      this.$refs.addCateFormRef.validate(async valid => {
        if (valid) {
          const { data: res } = await this.$http.post('/categories', this.addCateForm)
          if (res.meta.status !== 201) return this.$message.error('添加商品分类失败')
          this.$message.success('添加商品分类成功')
          this.getGoodsCategoryList()
          this.addCateDialogVisible = false
        }
      })
    }
  }
}
</script>

<style scoped lang="less">
  .treeTable{
    margin-top: 15px;
  }
  .el-cascader{
    width: 100%;
  }
</style>
