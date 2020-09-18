<template>
    <div style="margin-top:-10px;">
        <el-form :model="query" ref="queryRef" label-width="100px">
            <el-row>
                <el-col span="8">
                    <el-form-item label="用户名：" prop="userName">
                        <el-input v-model="query.userName" size="small"></el-input>
                    </el-form-item>
                </el-col>
                <el-col span="8">
                    <el-form-item label="登录账号：" prop="account">
                        <el-input v-model="query.account" size="small"></el-input>
                    </el-form-item>
                </el-col>
            </el-row>
            <div style="margin-bottom: 10px;">
                <el-button type="primary" icon="el-icon-plus" class="handle-del mr10" @click="handleAddUser">添加用户
                </el-button>
                <el-button type="primary" icon="el-icon-delete" class="handle-del mr10" @click="handleDelete()">删除用户
                </el-button>

                <div style="float: right;margin-right: 50px">
                    <el-form-item>
                        <el-button type="primary" icon="el-icon-search" @click="search('query')">查询</el-button>
                        <el-button type="primary" icon="el-icon-refresh" @click="search('reset')">重置</el-button>
                    </el-form-item>
                </div>
            </div>
        </el-form>

        <el-table :data="tableData" border class="table" ref="table"
                  header-cell-class-name="table-header" cell-style="padding:0px"
                  @selection-change="selectionChange">
            <el-table-column type="selection" width="55"></el-table-column>
            <el-table-column prop="userName" label="用户名"></el-table-column>
            <el-table-column prop="account" label="登录账号"></el-table-column>
            <el-table-column prop="isEnabled" label="账号状态" width="100">
                <template slot-scope="scope">
                    <span v-if="scope.row.isEnabled==='0'">禁用</span>
                    <span v-else>启用</span>
                </template>
            </el-table-column>
            <el-table-column label="操作" width="100">
                <div slot-scope="scope">
                    <el-tooltip placement="top" :enterable="false">
                        <div slot="content">删除</div>
                        <el-button type="text" class="red" icon="el-icon-delete" @click="handleDelete(scope.row)">
                        </el-button>
                    </el-tooltip>
                </div>
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

        <div v-if="dialogVisible">
            <el-dialog ref="addUserDialog" title="添加用户" :visible.sync="dialogVisible"
                       :close-on-click-modal="false" top="5vh" append-to-body>
                <v-add-user :roleId="query.roleId"></v-add-user>
                <span slot="footer" class="dialog-footer">
                    <el-button type="primary" @click="handleClear">清 空</el-button>
                    <el-button @click="dialogVisible = false">取 消</el-button>
                    <el-button type="primary" @click="handleSaveUser">确 定</el-button>
                </span>
            </el-dialog>
        </div>
    </div>
</template>

<script>
    import vAddUser from './AddUser'

    export default {
        name: "RoleUser",
        components: {
            vAddUser
        },
        data() {
            return {
                query: {
                    userName: '',
                    account: '',
                    roleId: '',
                    pageIndex: 1,
                    pageSize: 10
                },
                pageSizes: [10, 50, 100, 150, 200],
                pageTotal: 0,
                tableData: [],
                multipleSelection: [],
                listIds: [],
                dialogVisible: false
            }
        },
        methods: {
            selectionChange(val) {//多选操作
                this.multipleSelection = val;
            },
            handleAddUser() {
                this.dialogVisible = true;
                this.query.roleId = this.$attrs.roleId;
            },
            handleDelete(row) {
                let _this = this;
                this.listIds=[];

                if (row) {
                    this.listIds.push(row.id);
                } else {
                    let data = this.multipleSelection;
                    if (data.length < 1) {
                        this.$message.warning("请勾选要删除的数据");
                        return false;
                    }

                    data.forEach(item => {
                        this.listIds.push(item.id);
                    });
                }

                this.$confirm('确定要删除吗？', '提示', {type: 'warning'})
                    .then(() => {
                        _this.$api.authentication(_this.deleteBatch);
                    })
            },
            deleteBatch() {
                let _this = this;
                this.$api.deleteQs("/system/userRole/delete", {roleId: this.query.roleId, ids: this.listIds})
                    .then(res => {
                        if (res.data.code === 200) {
                            _this.getTableData();
                            _this.$message.success("删除成功");
                        } else
                            _this.$message.error("删除失败");
                    })
                    .catch(err => {
                        _this.$message.error("系统错误");
                        console.log(err.message);
                    })
            },
            search(action) {//查询，重置
                if (action === 'reset') {
                    this.$refs.queryRef.resetFields();//重置
                }
                this.query.pageIndex = 1;
                this.$api.authentication(this.getTableData);
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
            //保存添加的用户
            handleSaveUser() {
                let _this = this;
                this.$refs.addUserDialog.$children.every(item => {
                    if (item.handleSubmit) {
                        _this.$api.authentication(item.handleSubmit)
                            .then(isOK => {
                                if (isOK) {
                                    _this.dialogVisible = false;
                                    _this.$message.success("保存成功");
                                    _this.getTableData();
                                } else
                                    _this.$message.error("保存失败");
                            })
                            .catch(err => {
                                _this.$message.error("系统错误");
                                console.log(err.message);
                            });
                        return false;
                    }
                    return true;
                });
            },
            //清空选择的用户
            handleClear() {
                let _this = this;

                this.$confirm('确定要清空已选择的用户吗？', '提示', {type: 'warning'})
                    .then(() => {
                        _this.$refs.addUserDialog.$children.every(item => {
                            if (item.handleClear) {
                                item.handleClear();
                                return false;
                            }
                            return true;
                        });
                    });
            },
            getTableData() {//加载表格数据
                let _this = this;
                this.query.roleId = this.$attrs.roleId;
                this.$api.getQs("/system/user/getCheckedPageList", this.query)
                    .then(res => {
                        _this.tableData = res.data.data.records;
                        _this.pageTotal = res.data.data.total;
                    })
                    .catch(err => {
                        _this.$message.error("系统错误，数据加载失败");
                        console.log(err.message);
                    });
            }
        },
        created() {
            this.$api.authentication(this.getTableData);
        }
    }
</script>

<style scoped>
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