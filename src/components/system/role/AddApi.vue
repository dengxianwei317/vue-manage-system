<template>
    <div style="margin-top: -20px;">
        <el-form :model="query" ref="queryRef" label-width="100px">
            <el-row>
                <el-col span="8">
                    <el-form-item label="接口名称：" prop="name">
                        <el-input v-model="query.name" size="small"></el-input>
                    </el-form-item>
                </el-col>
            </el-row>

            <div style="float: right;margin-right: 50px;margin-top: -50px;">
                <el-form-item>
                    <el-button type="primary" icon="el-icon-search" @click="search('query')">查询</el-button>
                    <el-button type="primary" icon="el-icon-refresh" @click="search('reset')">重置</el-button>
                </el-form-item>
            </div>
        </el-form>

        <el-table :data="tableData" border class="table" ref="table"
                  header-cell-class-name="table-header" cell-style="padding:4px"
                  @select="selectCheckBox" @select-all="selectAllCheckBox">
            <el-table-column type="selection" width="55"></el-table-column>
            <el-table-column prop="name" label="接口名称"></el-table-column>
            <el-table-column prop="code" label="接口编码"></el-table-column>
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

        <el-footer style="height:150px;background-color:#F5F7FA;overflow-y:auto;">
            <el-tag v-for="tag in tags" :key="tag.id" type="success" closable
                    style="margin:5px 5px 0px 0px;" @close="closeTag(tag)">
                <span v-text="tag.name"></span>
            </el-tag>
        </el-footer>
    </div>
</template>

<script>
    export default {
        name: "AddApi",
        data() {
            return {
                query: {
                    name: '',
                    isEnabled: '1',
                    pageIndex: 1,
                    pageSize: 10
                },
                pageSizes: [10, 50, 100, 150, 200],
                pageTotal: 0,
                tableData: [],
                checkedIds: [],
                listAddPermissionId: [],
                IsExistTag: false,
                tags: []
            }
        },
        methods: {
            search(action) {//查询，重置
                if (action === 'reset') {
                    this.$refs.queryRef.resetFields();//重置
                }
                this.query.pageIndex = 1;
                this.$api.authentication(this.getTableData);
            },
            selectCheckBox(rows, currentRow) {//Checkbox 点击时触发的事件
                let _this = this;
                if (rows.includes(currentRow)) {//选中的Checkbox
                    if (!this.checkedIds.includes(currentRow.id)) {
                        if (!this.listAddPermissionId.includes(currentRow.id)) {
                            this.listAddPermissionId.push(currentRow.id);
                            this.tags.push(currentRow);
                        }
                    }
                } else {//未选中的Checkbox
                    let index = this.listAddPermissionId.indexOf(currentRow.id);
                    if (index >= 0) {
                        this.listAddPermissionId.splice(index, 1);

                        for (var i = this.tags.length - 1; i >= 0; i--) {
                            if (this.tags[i].id === currentRow.id) {
                                this.tags.splice(i, 1);
                                break;
                            }
                        }
                    }

                    //已分配的用户无法被取消掉选择
                    if (this.checkedIds.includes(currentRow.id)) {
                        this.tableData.every(row => {
                            if (row.id === currentRow.id) {
                                _this.$refs.table.toggleRowSelection(row, true);
                                return false;
                            }
                            return true;
                        })
                    }
                }
            },
            selectAllCheckBox(rows) {//Checkbox全选时触发的事件
                let _this = this;
                if (rows.length > 0) {
                    rows.forEach(row => {
                        if (!this.checkedIds.includes(row.id)) {
                            if (!_this.listAddPermissionId.includes(row.id)) {
                                _this.listAddPermissionId.push(row.id);
                                this.tags.push(row);
                            }
                        }
                    });
                } else {//删除当前页全部数据
                    //已分配的接口无法被取消掉选择
                    this.tableData.forEach(row => {
                        let index = _this.listAddPermissionId.indexOf(row.id);
                        if (index >= 0) {
                            _this.listAddPermissionId.splice(index, 1);

                            for (var i = this.tags.length - 1; i >= 0; i--) {
                                if (this.tags[i].id === row.id) {
                                    this.tags.splice(i, 1);
                                    break;
                                }
                            }
                        }

                        if (_this.checkedIds.includes(row.id))
                            _this.$refs.table.toggleRowSelection(row, true);
                    })
                }
            },
            handleSizeChange(size) {//pageSize改变时触发
                this.query.pageSize = size;
                this.query.pageIndex = 1;
                this.$api.authentication(this.getTableData);
            },
            handleCurrentChange(index) {//当前页改变时触发
                this.query.pageIndex = index;
                this.$api.authentication(this.getTableData);
            },
            setRowUnChecked(value) {//设置行未被选中
                let _this = this;
                if (typeof value === 'string') {//单个取消选择
                    let index = this.listAddPermissionId.indexOf(value);
                    if (index >= 0) {
                        this.listAddPermissionId.splice(index, 1);
                        this.tableData.every(row => {
                            if (value === row.id) {
                                _this.$refs.table.toggleRowSelection(row, false);//设置行未选中
                                return false;//循环终止
                            }
                            return true;//循环继续
                        });
                    }
                } else if (typeof value === "object") {//全部清空
                    this.tableData.forEach(row => {
                        if (this.checkedIds.includes(row.id)) {
                            _this.$refs.table.toggleRowSelection(row, true);//设置已分配接口被默认选中
                        } else {
                            _this.$refs.table.toggleRowSelection(row, false);
                        }
                    });
                }
            },
            closeTag: function (tag) {//tag关闭
                let index = this.tags.indexOf(tag);
                if (index >= 0) {
                    this.tags.splice(index, 1);
                    this.setRowUnChecked(tag.id);
                }
            },
            handleSubmit() {//保存选择的接口权限
                let _this = this;
                let isOK = false;

                if (this.listAddPermissionId.length < 1) {
                    return false;
                }

                return new Promise((resolve, reject) => {
                    _this.$api.postQs("/system/rolePermission/add", {
                        roleId: _this.$attrs.roleId,
                        PermissionIds: _this.listAddPermissionId,
                    }).then(res => {
                        if (res.data.code === 200)
                            isOK = true;
                        resolve(isOK);
                    }).catch(err => {
                        reject(err);
                    })
                });
            },
            handleClear() {//清空已选择的接口权限
                this.tags = [];
                this.listAddPermissionId = [];
                this.setRowUnChecked([]);
            },
            getTableData() {//加载表格数据
                let _this = this;
                let ids = this.checkedIds.concat(this.listAddPermissionId);
                this.$api.getQs("/system/permission/getPageList", this.query)
                    .then(res => {
                        _this.tableData = res.data.data.records;
                        _this.pageTotal = res.data.data.total;

                        _this.$nextTick(() => {//等待table渲染完成
                            _this.tableData.forEach(row => {
                                if (ids.includes(row.id)) {
                                    _this.$refs.table.toggleRowSelection(row, true);//已选择的接口设置被选中
                                }
                            });
                        })
                    })
                    .catch(err => {
                        _this.$message.error("系统错误，数据加载失败");
                        console.log(err.message);
                    });
            },
            getCheckedPermissionIds() {
                let _this = this;
                //获取角色已分配的接口权限ID
                this.$api.getQs("/system/rolePermission/getCheckedPermissionIds", {roleId: this.$attrs.roleId})
                    .then(res => {
                        _this.checkedIds = res.data.data === null ? [] : res.data.data;
                        _this.getTableData();
                    })
                    .catch(err => {
                        _this.$message.error("系统错误，数据加载失败");
                        console.log(err.message);
                    });
            }
        },
        created() {
            this.$api.authentication(this.getCheckedPermissionIds);
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
</style>