<template>
    <div>
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>
                    <i class="el-icon-lx-cascades"></i>
                    按钮管理
                </el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <div class="container">
            <el-form :model="query" ref="queryRef" label-width="100px">
                <el-row>
                    <el-col span="7">
                        <el-form-item label="按钮名称：" prop="buttonName">
                            <el-input v-model="query.buttonName" size="small" class="handle-input mr10"></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col span="7">
                        <el-form-item label="按钮类型：" prop="buttonType">
                            <el-select v-model="query.buttonType" placeholder="请选择" class="handle-input">
                                <el-option key="tableRow" label="表格行内按钮" value="tableRow"></el-option>
                                <el-option key="toolBar" label="表格工具栏按钮" value="toolBar"></el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col span="7">
                        <el-form-item label="是否启用：" prop="isEnabled">
                            <el-select v-model="query.isEnabled" placeholder="请选择" class="handle-input">
                                <el-option key="1" label="是" value="1"></el-option>
                                <el-option key="0" label="否" value="0"></el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                </el-row>
                <div class="handle-box">
                    <el-button v-for="button in buttons" type="primary" :icon="button.iconClass"
                               v-if="button.buttonType==='toolBar'"
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
                      header-cell-class-name="table-header" cell-style="padding:5px"
                      @selection-change="selectionChange">
                <el-table-column type="selection" width="55" align="center"></el-table-column>
                <el-table-column prop="buttonName" label="按钮名称" width="150"></el-table-column>
                <el-table-column prop="clickEvent" label="点击事件" width="200"></el-table-column>
                <el-table-column prop="buttonType" label="按钮类型" width="150">
                    <template slot-scope="scope">
                        <span v-if="scope.row.buttonType==='tableRow'">表格行内按钮</span>
                        <span v-else>表格工具栏按钮</span>
                    </template>
                </el-table-column>
                <el-table-column prop="iconClass" label="按钮图标" width="180"></el-table-column>
                <el-table-column prop="cssClass" label="按钮样式" width="200"></el-table-column>
                <el-table-column prop="isEnabled" label="启用/禁用" width="100">
                    <template slot-scope="scope">
                        <span v-if="scope.row.isEnabled==='0'">禁用</span>
                        <span v-else>启用</span>
                    </template>
                </el-table-column>
                <el-table-column prop="sort" label="序号" width="100"></el-table-column>
                <el-table-column label="操作" min-width="180" align="center">
                    <template slot-scope="scope">
                        <el-tooltip placement="top" :enterable="false"
                                    v-for="button in buttons" v-if="button.buttonType==='tableRow'">
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
        <div v-if="visible">
            <el-dialog ref="dialog" :title="title" :visible.sync="visible" width="60%"
                       :close-on-click-modal="false">
                <v-Form :buttonId="query.id" :action="action"></v-Form>
                <span slot="footer" class="dialog-footer">
                    <el-button @click="visible = false">取 消</el-button>
                    <el-button type="primary" @click="handleSave" v-show="showBtn">确 定</el-button>
                </span>
            </el-dialog>
        </div>
    </div>
</template>

<script>
    import vForm from './ButtonForm';

    export default {
        name: 'ButtonIndex',
        components: {
            vForm
        },
        data() {
            return {
                query: {
                    buttonName: null,
                    buttonType: null,
                    isEnabled: null,
                    pageIndex: 1,
                    pageSize: 10
                },
                pageSizes: [10, 50, 100, 150, 200],
                pageTotal: 0,
                title: '',
                showBtn: true,
                visible: false,
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
                this.$api.getQs("/system/button/getPageList", this.query)
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
                this.$api.deleteQs("/system/button/delete", {ids: this.listIds})
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
                this.$api.postQs("/system/button/update", this.entity)
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
                        console.log(err.message);
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
                    this.title = "查看按钮";
                    this.showBtn = false;
                } else if (action === "add") {
                    this.action = "add";
                    this.title = "新增按钮";
                    this.showBtn = true;
                } else {
                    this.action = "edit";
                    this.title = "编辑按钮";
                    this.showBtn = true;
                }

                if (action !== "add") {
                    this.query.id = row.id;
                }

                this.visible = true;
            },
            // 保存数据
            handleSave() {
                let _this = this;
                this.$refs.dialog.$children.every(item => {
                    if (item.handleSubmit) {
                        _this.$api.authentication(item.handleSubmit)
                            .then(isOK => {
                                if (isOK) {
                                    _this.$message.success("保存成功");
                                    _this.visible = false;
                                    _this.$api.authentication(_this.getTableData);
                                } else {
                                    _this.$message.error("保存失败");
                                }
                            })
                            .catch(err => {
                                _this.$message.error("系统错误");
                                console.log(err.message);
                            });
                        return false;
                    }
                    return true;
                });
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
