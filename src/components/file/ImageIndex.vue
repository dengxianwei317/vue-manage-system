<template>
    <div class="demo-image">
        <span class="block" v-for="file in fileList" :key="file.id">
            <el-image style="width: 200px; height: 200px;margin-left: 50px"
                    :src="file.url" fit="cover">
            </el-image>
        </span>
    </div>
</template>

<script>
    export default {
        name: "Index",
        data: function () {
            return {
                fileList: []
            }
        },
        methods: {
            initImg() {
                let _this = this;
                this.$api.getQs("/file/getPageList").then(res => {
                    let data = res.data.data.records;
                    const URL = "http://localhost:9090/";

                    data.forEach(item => {
                        let img = {id: "", name: "", url: ""};
                        img.id = item.id;
                        img.name = item.fileOriginalName;
                        img.url = URL + item.filePath;
                        _this.fileList.push(img);
                    })

                }).catch(err => {

                })
            }
        },
        created() {
            this.$api.authentication(this.initImg);
        },
        mounted() {

        }
    }
</script>

<style scoped>

</style>