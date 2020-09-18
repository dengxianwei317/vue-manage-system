<template>
    <div>
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item><i class="el-icon-lx-calendar"></i> 表单</el-breadcrumb-item>
                <el-breadcrumb-item>图片上传</el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <div class="container">
            <div class="content-title">支持拖拽</div>
            <div class="plugins-tips">
                Element UI自带上传组件。
                访问地址：<a href="http://element.eleme.io/#/zh-CN/component/upload" target="_blank">Element UI Upload</a>
            </div>
            <!--<el-upload
                class="upload-demo"
                drag
                action="http://jsonplaceholder.typicode.com/api/posts/"
                multiple>
                <i class="el-icon-upload"></i>
                <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
                <div class="el-upload__tip" slot="tip">只能上传jpg/png文件，且不超过500kb</div>
            </el-upload>-->

            <el-upload ref="upload"
                       class="upload-demo"
                       action="#"
                       :on-remove="handleRemove"
                       :before-remove="beforeRemove"
                       :on-exceed="handleExceed"
                       :on-success="handleSuccess"
                       :on-error="handleError"
                       :on-change="handleChange"
                       :on-preview="handlePreview"
                       :auto-upload="false"
                       multiple
                       :limit="limit"
                       :list-type="listType">
                <el-button size="small" type="primary">选择图片</el-button>
                <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过2M</div>
            </el-upload>
            <el-button style="margin-top: 10px;" size="small" type="success" @click="submitUpload">上传
            </el-button>
            <el-dialog :visible.sync="dialogVisible" append-to-body>
                <img width="100%" :src="dialogImageUrl" alt="">
            </el-dialog>

            <div class="content-title">支持裁剪</div>
            <div class="plugins-tips">
                vue-cropperjs：一个封装了 cropperjs 的 Vue 组件。
                访问地址：<a href="https://github.com/Agontuk/vue-cropperjs" target="_blank">vue-cropperjs</a>
            </div>
            <div class="crop-demo">
                <img :src="cropImg" class="pre-img">
                <div class="crop-demo-btn">选择图片
                    <input class="crop-input" type="file" name="image" accept="image/*" @change="setImage"/>
                </div>
            </div>

            <el-dialog title="裁剪图片" :visible.sync="dialogVisibleCrop" width="30%">
                <vue-cropper ref='cropper' :src="imgSrc" :ready="cropImage" :zoom="cropImage" :cropmove="cropImage"
                             style="width:100%;height:300px;"></vue-cropper>
                <span slot="footer" class="dialog-footer">
                    <el-button @click="cancelCrop">取 消</el-button>
                    <el-button type="primary" @click="dialogVisible = false">确 定</el-button>
                </span>
            </el-dialog>
        </div>
    </div>
</template>

<script>
    import VueCropper from 'vue-cropperjs';

    export default {
        name: 'upload',
        data: function () {
            return {
                defaultSrc: require('../../assets/img/img.jpg'),
                imgSrc: '',
                cropImg: '',
                dialogVisibleCrop: false,

                saveFileMap: new FormData(), //保存上传的图片
                listType: "text", // picture picture-card
                dialogVisible: false,
                dialogImageUrl: "",
                limit: 5,
                listImgUrl: []  //用hash方式保存在前端的图片url路径集合
            }
        },
        components: {
            VueCropper
        },
        methods: {
            setImage(e) {
                const file = e.target.files[0];
                if (!file.type.includes('image/')) {
                    return;
                }
                const reader = new FileReader();
                reader.onload = (event) => {
                    this.dialogVisibleCrop = true;
                    this.imgSrc = event.target.result;
                    this.$refs.cropper && this.$refs.cropper.replace(event.target.result);
                };
                reader.readAsDataURL(file);
            },
            cropImage() {
                this.cropImg = this.$refs.cropper.getCroppedCanvas().toDataURL();
            },
            cancelCrop() {
                this.dialogVisible = false;
                this.cropImg = this.defaultSrc;
            },
            submitUpload() {
                let uploadImgData = new FormData();
                let listData = [];
                let _this = this;
                this.saveFileMap.forEach((value, key, parent) => {
                    uploadImgData.append("file", value);
                    listData.push(value);
                })

                this.$api.post("/file/upload", uploadImgData, {
                        headers: {
                            "Content-Type": "multipart/form-data"
                        }
                    }
                ).then(res => {
                    if (res.data.code === 200)
                        _this.$message.success(res.data.msg);
                    else
                        _this.$message.error(res.data.msg);
                }).catch(err => {
                    _this.$notify.error({
                        title: '上传失败',
                        message: '服务器错误！'
                    });
                })
            },
            handleChange(file, fileList) {//文件状态改变时，添加文件、上传成功和上传失败时都会被调用
                const isType = file.raw.type === ('image/jpeg' || 'image/png');
                const isSize = file.raw.size / 1024 / 1024 < 2;

                if (!isType) {
                    this.$message.error('上传图片只能是jpg/png格式!');
                    return false;
                }
                if (!isSize) {
                    this.$message.error('上传图片大小不能超过2MB!');
                    return false;
                }

                this.saveFileMap.append(file.uid, file.raw);
                //保存图片上传路径，用于查看原图
                let img = {uid: "", url: ""};
                const reader = new FileReader();
                reader.onload = (event) => {
                    img.url = event.target.result;
                    this.listImgUrl.push(img);
                };
                img.uid = file.uid;
                reader.readAsDataURL(file.raw);
            }
            ,
            handlePreview(file) {//点击文件列表中已上传的文件
                if (file.url) {//img url是否有值
                    this.dialogImageUrl = file.url;
                } else {
                    let list = this.listImgUrl;
                    //从保存在前端的图片路径集合查找
                    list.every(item => {
                        if (file.uid === item.uid) {
                            this.dialogImageUrl = item.url;
                            return false;
                        }
                        return true;
                    })
                }
                this.dialogVisible = true;
            }
            ,
            beforeRemove(file, fileList) {
                //this.$message.warning("无删除权限！");
                //return false;
            }
            ,
            handleRemove(file, fileList) {
                if (this.saveFileMap.get(file.uid) != null)
                    this.saveFileMap.delete(file.uid);
            }
            ,
            handleExceed(file, fileList) {
                this.$message.warning("上传图片不能超过" + this.limit + "个！");
            }
            ,
            handleSuccess(response, file, fileList) {

            }
            ,
            handleError(err, file, fileList) {
                this.$notify.error({
                    title: '上传失败',
                    message: '图片上传接口调用失败，请检查！'
                });
            }
        },
        created() {
            this.cropImg = this.defaultSrc;
        }
        ,
        mounted() {//dom元素渲染完成
            this.$refs.upload.$el.childNodes[0].classList.remove("el-upload--text");
        }
    }
</script>

<style scoped>

    .content-title {
        font-weight: 400;
        line-height: 50px;
        margin: 10px 0;
        font-size: 22px;
        color: #1f2f3d;
    }

    .pre-img {
        width: 100px;
        height: 100px;
        background: #f8f8f8;
        border: 1px solid #eee;
        border-radius: 5px;
    }

    .crop-demo {
        display: flex;
        align-items: flex-end;
    }

    .crop-demo-btn {
        position: relative;
        width: 100px;
        height: 40px;
        line-height: 40px;
        padding: 0 20px;
        margin-left: 30px;
        background-color: #409eff;
        color: #fff;
        font-size: 14px;
        border-radius: 4px;
        box-sizing: border-box;
    }

    .crop-input {
        position: absolute;
        width: 100px;
        height: 40px;
        left: 0;
        top: 0;
        opacity: 0;
        cursor: pointer;
    }
</style>