<template>
    <div>
      <!-- 面包屑导航区域 -->
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>商品管理</el-breadcrumb-item>
        <el-breadcrumb-item>分类参数</el-breadcrumb-item>
      </el-breadcrumb>
      <!-- 卡片 -->
      <el-card>
        <!-- 警告区域 -->
        <el-alert
          title="注意：只允许为第三级分类设置相关参数"
          type="warning"
          show-icon
          :closable="false">
        </el-alert>

        <!-- 商品分类区域 -->
        <el-row class="cat_opt">
          <el-col>
            <span>选择商品分类：</span>
            <!-- 级联选择器 -->
            <el-cascader
              v-model="selectedCateKeys"
              :options="cateList"
              :props="cateProps"
              @change="handleChange"
              clearable></el-cascader>
          </el-col>
        </el-row>

        <!-- tab页签区域 -->
        <el-tabs v-model="activeName" @tab-click="handleTabClick">
          <el-tab-pane label="动态参数" name="many">
            <el-button type="primary" size="mini" :disabled="isBtnDisable" @click="addDialogVisible = true">添加参数</el-button>
            <!-- 动态参数表格 -->
            <el-table :data="manyTableData" border stripe>
              <el-table-column type="expand">
                <template slot-scope="scope">
                  <!-- 循环渲染tag标签 -->
                  <el-tag v-for="(item, i) in scope.row.attr_vals" :key="i" closable @close="handleClose(i, scope.row)">{{item}}</el-tag>
                  <!-- 文本框 -->
                  <el-input
                    class="input-new-tag"
                    v-if="scope.row.inputVisible"
                    v-model="scope.row.inputValue"
                    ref="saveTagInput"
                    size="small"
                    @keyup.enter.native="handleInputConfirm(scope.row)"
                    @blur="handleInputConfirm(scope.row)"
                  >
                  </el-input>
                  <!-- 添加tag按钮 -->
                  <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                </template>
              </el-table-column>
              <el-table-column type="index" label="#"></el-table-column>
              <el-table-column label="参数名称" prop="attr_name"></el-table-column>
              <el-table-column label="操作">
                <template slot-scope="scope">
                  <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                  <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeParams(scope.row.attr_id)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
          <el-tab-pane label="静态属性" name="only">
            <el-button type="primary" size="mini" :disabled="isBtnDisable" @click="addDialogVisible = true">添加属性</el-button>
            <!-- 静态属性表格 -->
            <el-table :data="onlyTableData" border stripe>
              <el-table-column type="expand">
                <template slot-scope="scope">
                  <!-- 循环渲染tag标签 -->
                  <el-tag v-for="(item, i) in scope.row.attr_vals" :key="i" closable @close="handleClose(i, scope.row)">{{item}}</el-tag>
                  <!-- 文本框 -->
                  <el-input
                    class="input-new-tag"
                    v-if="scope.row.inputVisible"
                    v-model="scope.row.inputValue"
                    ref="saveTagInput"
                    size="small"
                    @keyup.enter.native="handleInputConfirm(scope.row)"
                    @blur="handleInputConfirm(scope.row)"
                  >
                  </el-input>
                  <!-- 添加tag按钮 -->
                  <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                </template>
              </el-table-column>
              <el-table-column type="index" label="#"></el-table-column>
              <el-table-column label="属性名称" prop="attr_name"></el-table-column>
              <el-table-column label="操作">
                <template slot-scope="scope">
                  <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                  <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeParams(scope.row.attr_id)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
        </el-tabs>
      </el-card>

      <!-- 添加参数对话框 -->
      <el-dialog
        :title="'添加' + titleText"
        :visible.sync="addDialogVisible"
        width="50%"
        @close="closeAddDialog">
        <!-- 添加参数/属性表单 -->
        <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
          <el-form-item :label="titleText" prop="attr_name">
            <el-input v-model="addForm.attr_name"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="addDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addParams">确 定</el-button>
        </span>
      </el-dialog>

      <!-- 编辑参数对话框 -->
      <el-dialog
        :title="'修改' + titleText"
        :visible.sync="editDialogVisible"
        width="50%"
        @close="closeEditDialog">
        <!-- 添加参数/属性表单 -->
        <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
          <el-form-item :label="titleText" prop="attr_name">
            <el-input v-model="editForm.attr_name"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editParams">确 定</el-button>
        </span>
      </el-dialog>
    </div>
</template>

<script>
export default {
  name: 'params',
  data() {
    return {
      // 商品分类列表
      cateList: [],
      // 级联选择器的配置对象
      cateProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 级联选择器中被选中的数据id
      selectedCateKeys: [],
      // 被激活的页签的名称
      activeName: 'many',
      // 动态参数数据
      manyTableData: [],
      // 静态属性数据
      onlyTableData: [],
      // 控制 添加对话框的显示与隐藏
      addDialogVisible: false,
      // 添加参数表单的数据对象
      addForm: {
        attr_name: ''
      },
      // 添加参数表单的验证对象
      addFormRules: {
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' }
        ]
      },
      // 控制 修改参数对话框的显示与隐藏
      editDialogVisible: false,
      // 修改参数表单的数据对象
      editForm: {
        attr_id: '',
        attr_name: ''
      },
      // 修改参数表单的验证对象
      editFormRules: {
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' }
        ]
      }
    }
  },
  created () {
    this.getCateList()
  },
  methods: {
    async getCateList() {
      const { data: res } = await this.$http.get('/categories')
      if (res.meta.status !== 200) return this.$message.error('获取商品分类失败')
      this.cateList = res.data
      console.log(this.cateList)
    },
    // 级联选择器发生改变，会触发该函数
    handleChange() {
      this.getParamsData()
    },
    // tab页签点击事件的函数
    handleTabClick() {
      this.getParamsData()
    },
    // 获取参数列表的数据
    async getParamsData() {
      if (this.selectedCateKeys.length !== 3) {
        this.selectedCateKeys = []
        this.manyTableData = []
        this.onlyTableData = []
      } else {
        // 根据所选分类的id,和当前所处的面板，获取对应的参数
        const { data: res } = await this.$http.get(`/categories/${this.cateId}/attributes`, { params: { sel: this.activeName } })
        if (res.meta.status !== 200) return this.$message.error('获取参数列表失败')
        res.data.forEach(item => {
          item.attr_vals = item.attr_vals.length !== 0 ? item.attr_vals.split(' ') : []
          // 控制文本框的显示与隐藏
          item.inputVisible = false
          item.inputValue = ''
        })
        if (this.activeName === 'many') {
          this.manyTableData = res.data
        } else {
          this.onlyTableData = res.data
        }
      }
    },
    // 监听对话框关闭事件
    closeAddDialog() {
      this.$refs.addFormRef.resetFields()
    },
    // 点击添加参数确定按钮事件
    addParams() {
      this.$refs.addFormRef.validate(async valid => {
        if (valid) {
          const { data: res } = await this.$http.post(`categories/${this.cateId}/attributes`, {
            attr_name: this.addForm.attr_name,
            attr_sel: this.activeName
          })
          if (res.meta.status !== 201) return this.$message.error('添加参数失败')
          this.$message.success('添加参数成功')
          this.addDialogVisible = false
          this.getParamsData()
        }
      })
    },
    // 参数编辑事件
    async showEditDialog(attrId) {
      this.editDialogVisible = true
      // 查询当前参数id对应的数据
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes/${attrId}`, { params: this.activeName })
      if (res.meta.status !== 200) return this.$message.error('获取参数失败')
      this.editForm = res.data
    },
    // 监听修改对话框关闭事件
    closeEditDialog() {
      this.$refs.editFormRef.resetFields()
    },
    // 点击修改参数确定按钮事件
    editParams() {
      this.$refs.editFormRef.validate(async valid => {
        if (valid) {
          const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${this.editForm.attr_id}`,
            { attr_name: this.editForm.attr_name, attr_sel: this.activeName })
          if (res.meta.status !== 200) return this.$message.error('修改参数失败')
          this.$message.success('修改参数成功')
          this.getParamsData()
          this.editDialogVisible = false
        }
      })
    },
    // 删除参数按钮事件
    async removeParams(attrId) {
      const confirmRes = await this.$confirm(
        '此操作将永久删除该参数, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      if (confirmRes !== 'confirm') {
        return this.$message.info('已取消删除')
      }
      const { data: res } = await this.$http.delete(`categories/${this.cateId}/attributes/${attrId}`)
      if (res.meta.status !== 200) return this.$message.error('删除参数失败！')
      this.$message.success('删除参数成功！')
      this.getParamsData()
    },
    // 文本框失去焦点或者按下enter键调用该函数
    async handleInputConfirm(row) {
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        row.inputVisible = false
      } else {
        // 后续处理
        row.attr_vals.push(row.inputValue.trim())
        // 保存操作
        this.saveAttrVals(row)
        row.inputValue = ''
        row.inputVisible = false
      }
    },
    // 点击按钮，展示输入文本框
    showInput(row) {
      row.inputVisible = true
      // 让文本框获得焦点
      // $nextTick 当页面的元素被重新渲染之后，才会指定回调函数中的代码
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    // 删除tag参数项
    handleClose(i, row) {
      row.attr_vals.splice(i, 1)
      // 保存修改
      this.saveAttrVals(row)
    },
    // 修改attr_vals的操作保存到数据库
    async saveAttrVals(row) {
      const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`, {
        attr_name: row.attr_name,
        attr_sel: row.attr_sel,
        attr_vals: row.attr_vals.join(' ')
      })
      if (res.meta.status !== 200) return this.$message.error('修改参数项失败')
      this.$message.success('修改参数项成功')
    }

  },
  computed: {
    // 如果按钮需要被禁用，则返回true 否则返回false
    isBtnDisable() {
      if (this.selectedCateKeys.length !== 3) {
        return true
      }
      return false
    },
    // 当前选中的三级分类的id
    cateId() {
      if (this.selectedCateKeys.length === 3) {
        return this.selectedCateKeys[2]
      }
      return null
    },
    // 动态计算标题文本
    titleText() {
      if (this.activeName === 'many') {
        return '动态参数'
      }
      return '静态属性'
    }
  }
}

</script>

<style scoped lang="less">
  .cat_opt{
    margin: 15px 0;
  }
  .el-tag{
    margin: 10px;
  }
  .input-new-tag{
    width: 120px;
   }
</style>
