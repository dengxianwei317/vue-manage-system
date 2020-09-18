<template>
    <div>
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>
                    <i class="el-icon-lx-cascades"></i>
                    用户管理
                </el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <div class="container">
            <el-form :model="query" ref="queryRef" label-width="120px">
                <el-row>
                    <el-col span="7">
                        <el-form-item label="用户名称：" prop="userName">
                            <el-input v-model="query.userName" size="small" class="handle-input mr10"></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col span="7">
                        <el-form-item label="登录账号：" prop="account">
                            <el-input v-model="query.account" size="small" class="handle-input mr10"></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col span="7">
                        <el-form-item label="手机号码：" prop="phone">
                            <el-input v-model="query.phone" size="small" class="handle-input mr10"></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col span="7">
                        <el-form-item label="是否启用：" prop="isEnabled">
                            <el-select v-model="query.isEnabled" placeholder="请选择" class="handle-input">
                                <el-option key="1" label="是" value="1"></el-option>
                                <el-option key="0" label="否" value="0"></el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col span="7">
                        <el-form-item label="性别：" prop="sex">
                            <el-select v-model="query.sex" placeholder="请选择" class="handle-input">
                                <el-option key="M" label="男" value="M"></el-option>
                                <el-option key="W" label="女" value="W"></el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col span="7">
                        <el-form-item label="注册时间：" prop="registerTime">
                            <el-date-picker v-model="query.registerTime" type="datetimerange"
                                            value-format="yyyy-MM-dd" format="yyyy-MM-dd"
                                            style="width: 250px;"
                                            start-placeholder="开始日期" end-placeholder="结束日期">
                            </el-date-picker>
                        </el-form-item>
                    </el-col>
                </el-row>
                <div class="handle-box">
                    <el-button v-for="button in buttons" type="primary" :icon="button.iconClass"
                               v-if="button.buttonType==='toolBar' && button.isEnabled==='1'"
                               class="handle-del mr10" @click="toolBarClickEvent(button)">
                        {{button.buttonName}}
                    </el-button>

                    <div style="float: right;margin-right: 50px">
                        <el-form-item>
                            <el-button type="primary" icon="el-icon-search" @click="search('query')">查询</el-button>
                            <el-button type="primary" icon="el-icon-refresh" @click="search('reset')">重置
                            </el-button>
                        </el-form-item>
                    </div>
                </div>
            </el-form>

            <el-table :data="tableData" border class="table" ref="multipleTable"
                      header-cell-class-name="table-header" cell-style="padding:3px"
                      @selection-change="selectionChange">
                <el-table-column type="selection" width="55" align="center"></el-table-column>
                <el-table-column prop="userName" label="用户名" width="120"></el-table-column>
                <el-table-column prop="account" label="登录账号" width="120"></el-table-column>
                <el-table-column prop="phone" label="手机号码" width="140"></el-table-column>
                <el-table-column prop="sex" label="性别" width="60">
                    <template slot-scope="scope">
                        <span v-if="scope.row.sex==='M'">男</span>
                        <span v-else>女</span>
                    </template>
                </el-table-column>
                <el-table-column prop="birthday" label="出生日期" width="120"></el-table-column>
                <el-table-column prop="email" label="电子邮箱" width="300"></el-table-column>
                <el-table-column prop="registerTime" label="注册时间" width="180"></el-table-column>
                <el-table-column prop="isEnabled" label="账号状态" width="100">
                    <template slot-scope="scope">
                        <span v-if="scope.row.isEnabled==='0'">禁用</span>
                        <span v-else>启用</span>
                    </template>
                </el-table-column>
                <el-table-column label="操作" min-width="180" align="center">
                    <template slot-scope="scope">
                        <el-tooltip placement="top" :enterable="false"
                                    v-for="button in buttons"
                                    v-if="button.buttonType==='tableRow' && button.isEnabled==='1'">
                            <div slot="content">{{button.buttonName}}</div>
                            <el-button type="text" :icon="button.iconClass" :class="button.cssClass"
                                       @click="tableRowClickEvent(button,scope.row)">
                            </el-button>
                        </el-tooltip>
                    </template>
                </el-table-column>
            </el-table>
            <div class="pagination">
                <el-pagination
                        @size-change="handleSizeChange"
                        @current-change="handleCurrentChange"
                        :current-page="query.pageIndex"
                        :page-sizes="pageSizes"
                        :page-size="query.pageSize"
                        layout="total, sizes, prev, pager, next, jumper"
                        :total="pageTotal">
                </el-pagination>
            </div>
        </div>

        <!-- 弹出框 -->
        <div v-if="userVisible">
            <el-dialog ref="userDialog" :title="title" :visible.sync="userVisible" width="60%"
                       :close-on-click-modal="false">
                <v-user-form :userId="query.id" :action="action"></v-user-form>
                <span slot="footer" class="dialog-footer">
                    <el-button @click="userVisible = false">取 消</el-button>
                    <el-button type="primary" @click="handleSaveUser" v-show="showBtn">确 定</el-button>
                </span>
            </el-dialog>
        </div>

        <div v-if="accountVisible">
            <el-dialog ref="accountDialog" :title="title" :visible.sync="accountVisible" width="60%"
                       :close-on-click-modal="false">
                <v-account-form :userId="query.id"></v-account-form>
                <span slot="footer" class="dialog-footer">
                    <el-button @click="accountVisible = false">取 消</el-button>
                    <el-button type="primary" @click="handleSaveAccount">确 定</el-button>
                </span>
            </el-dialog>
        </div>
    </div>
</template>

<script>
    import vUserForm from './UserForm';
    import vAccountForm from './AccountForm'

    export default {
        name: 'UserIndex',
        components: {
            vUserForm,
            vAccountForm
        },
        data() {
            return {
                query: {
                    userName: null,
                    account: null,
                    phone: null,
                    sex: null,
                    registerTime: null,
                    IsEnabled: null,
                    pageIndex: 1,
                    pageSize: 10
                },
                pageSizes: [10, 50, 100, 150, 200],
                pageTotal: 0,
                title: '',
                showBtn: true,
                userVisible: false,
                accountVisible: false,
                roleVisible: false,
                dialogType: null,
                action: '',
                multipleSelection: [],
                listIds: [],
                tableData: [],
                buttons: [],
                entity: {}
            };
        },
        created() {
            this.$api.authentication(this.getTableData);
            this.$api.authentication(this.getCheckedButtons);
        },
        methods: {
            // 获取数据
            getTableData() {
                let _this = this;

                this.$api.getQs("/system/user/getPageList", this.query)
                    .then(res => {
                        _this.tableData = res.data.data.records;
                        _this.pageTotal = res.data.data.total;
                    })
                    .catch(err => {
                        _this.$message.error("系统错误，数据加载失败");
                        console.log(err.message);
                    })
            },
            //获取页面已分配的按钮
            getCheckedButtons() {
                let _this = this;
                let menuId = this.$store.state.menuId;
                let listRoleId = [];

                this.$store.state.user.listRole.forEach(role => {
                    listRoleId.push(role.id);
                });

                this.$api.getQs("/system/button/getCheckedList", {
                    'roleIds': listRoleId,
                    'menuId': menuId
                }).then(res => {
                    if (res.data.code === 200)
                        _this.buttons = res.data.data;
                }).catch(err => {
                    console.log(err.message);
                })
            },
            //表格工具栏按钮事件
            toolBarClickEvent(button) {
                this[button.clickEvent]();
            },
            //表格行内按钮事件
            tableRowClickEvent(button, row) {
                this[button.clickEvent](row);
            },
            //pageSize改变时触发
            handleSizeChange(size) {
                this.query.pageSize = size;
                this.query.pageIndex = 1;
                this.$api.authentication(this.getTableData);
            },
            //当前页改变时触发
            handleCurrentChange(index) {
                this.query.pageIndex = index;
                this.$api.authentication(this.getTableData);
            },
            // 查询和重置
            search(action) {
                if (action === 'reset') {
                    this.$refs.queryRef.resetFields();//重置
                }
                this.query.pageIndex = 1;
                this.$api.authentication(this.getTableData);
            },
            // 多选操作
            selectionChange(val) {
                this.multipleSelection = val;
            },
            // 删除操作
            handleDelete(row) {
                let _this = this;
                this.listIds = [];

                if (row) {
                    this.listIds.push(row.id);
                } else {
                    let data = this.multipleSelection;
                    if (data.length < 1) {
                        this.$message.warning("请勾选要删除的数据");
                        return false;
                    }

                    data.forEach(item => {
                        _this.listIds.push(item.id);
                    });
                }

                this.$confirm('确定要删除吗？', '提示', {type: 'warning'})
                    .then(() => {
                        _this.$api.authentication(_this.deleteBatch);
                    })
            },
            deleteBatch() {
                let _this = this;
                this.$api.deleteQs("/system/user/delete", {ids: this.listIds})
                    .then(res => {
                        if (res.data.code === 200) {
                            _this.$api.authentication(_this.getTableData);
                            _this.listIds = [];
                            _this.$message.success("删除成功");
                        } else
                            _this.$message.error("删除失败");
                    })
                    .catch(err => {
                        _this.$message.error("系统错误");
                        console.log(err.message);
                    })
            },
            handleEnabled(row) {
                this.$api.authentication(this.isEnabled);
                this.entity.id = row.id;
                if (row.isEnabled === '0')
                    this.entity.isEnabled = '1';
                else
                    this.entity.isEnabled = '0';
            },
            isEnabled() {
                let _this = this;
                this.$api.postQs("/system/user/update", this.entity)
                    .then(res => {
                        if (res.data.code === 200) {
                            _this.$api.authentication(_this.getTableData);
                            _this.entity = {};
                            _this.$message.success("修改成功");
                        } else
                            _this.$message.error("修改失败");
                    })
                    .catch(err => {
                        _this.$message.error("系统错误");
                        console.log(err.message)
                    })
            },
            //新增
            handleAdd() {
                this.openForm("add");
            },//查看
            handleView(row) {
                this.openForm("view", row);
            },
            // 编辑操作
            handleEdit(row) {
                this.openForm("edit", row);
            },
            openForm(action, row) {
                if (action === "view") {
                    this.action = "view";
                    this.title = "查看用户";
                    this.showBtn = false;
                } else if (action === "add") {
                    this.action = "add";
                    this.title = "新增用户";
                    this.showBtn = true;
                } else {
                    this.action = "edit";
                    this.title = "编辑用户";
                    this.showBtn = true;
                }

                if (action !== "add") {
                    this.query.id = row.id;
                }

                this.dialogType = 'userDialog';

                this.openDialog();
            },
            //修改账号
            handleUpdateAccount(row) {
                this.query.id = row.id;
                this.title = '修改账号';
                this.dialogType = 'accountDialog';
                this.openDialog();
            },
            //分配角色
            handleUserRole(row) {
                if (row.isEnabled === '0') {
                    this.$message.warning("用户未启用，无法分配权限");
                    return;
                }

                this.query.id = row.id;
                this.title = '分配角色';
                this.dialogType = 'roleDialog';
                this.openDialog();
            },
            // 保存用户数据
            handleSaveUser() {
                this.handleSubmit(this.dialogType);
            },
            // 保存修改账号数据
            handleSaveAccount() {
                this.handleSubmit(this.dialogType);
            },
            handleSubmit(dialogType) {
                let _this = this;
                this.$refs[dialogType].$children.every(item => {
                    if (item.handleSubmit) {
                        _this.$api.authentication(item.handleSubmit).then(res => {
                            if (res) {
                                if (dialogType === 'userDialog')
                                    this.userVisible = false;
                                else if (dialogType === 'accountDialog')
                                    this.accountVisible = false;
                                else if (dialogType === 'roleDialog')
                                    this.roleVisible = false;

                                _this.$message.success("保存成功");
                                _this.$api.authentication(_this.getTableData());
                            } else
                                _this.$message.error("保存失败");
                        });
                        return false;
                    }
                    return true;
                });
            },
            openDialog() {
                if (this.dialogType === 'userDialog')
                    this.userVisible = true;
                else if (this.dialogType === 'accountDialog')
                    this.accountVisible = true;
                else if (this.dialogType === 'roleDialog')
                    this.roleVisible = true;
            }
        }
    }
</script>

<style scoped>
    .handle-box {
        margin-bottom: 20px;
    }

    .el-button--text {
        font-size: 15px;
    }

    .handle-input {
        width: 250px;
        display: inline-block;
    }

    .table {
        width: 100%;
        font-size: 15px;
    }

    .red {
        color: #ff0000;
    }

    .mr10 {
        margin-right: 10px;
    }
</style>
