<template>
<div>
    <el-row>
        <el-col>
            <el-button size="mini" v-on:click="LoadUserByYear(item)" :disabled="item == selectedYear"
             v-bind:key="item" v-for="item in yearList" >{{item}}</el-button>
        </el-col>
    </el-row>
    <el-row>
        <el-col>
            <el-table :data="userDatas" stripe>
                <el-table-column>

                </el-table-column>
            </el-table>
        </el-col>
    </el-row>
</div>
</template>
<script>
export default {
    name: "UnCIPEMList",
    data () {
        return {
            yearList: [],
            userDatas: null,
            selectedYear: null
        }
    },
    methods: {
        LoadUserByYear: function(year) {
            
        }
    }
}
</script>

<style scoped>

</style>

