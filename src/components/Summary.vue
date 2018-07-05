<template>
    <div>
        <el-row class="row">
            <el-col :offset="2" :span="20">     
                <el-button class="minBtn" v-for="item in monthList" v-bind:key="item" size="small"
                :disabled="selectedMonth == item" v-on:click="loadReport(item)"> {{item}}
                </el-button>
            </el-col>
        </el-row>
      <!--  <el-row>
            <el-col :offset="2" :span="20">
                <el-button class="minBtn"  class="exportToExcel" >

                </el-button>
            </el-col>
        </el-row>
        -->
        <el-row class="row">
            <el-col :offset="2" :span="20">
                <el-table :data="scoreDatas" stripe>
                    <el-table-column prop="EmployeeNo" label="Employee Number" width="200">
                    </el-table-column>
                     <el-table-column prop="EmployeeName" label="Employee Name" width="200">
                    </el-table-column>
                     <el-table-column prop="Scores" label="Scores" width="140">
                    </el-table-column>
                </el-table>
            </el-col>
        </el-row>
    </div>
</template>

<script>
import databuilder from '../dataHelper/databuilder.js';

export default {
    name: "Summary",
    data() {
        return {
            selectedMonth: '',
            scoreDatas: null
        }
    },
    props: ['monthList'],
    created() {
        
    },
    methods: {
        loadReport: function(item) {
            this.selectedMonth = item;
            var result = databuilder.buildEmployeeScoreList(this.$store.state.cipDataList, item, this.$store.state.userList);

            console.dir(result);
            this.scoreDatas = result;
        }
    }
}
</script>

<style scoped>
.row {
    margin-bottom: 15px;
}
.minBtn {
    margin-bottom: 5px;
}
</style>

