<template>
<div>
    <el-row>
        <el-col>
            <el-button size="mini" v-on:click="setOpts(item)" :disabled="item == selectedYear"
            v-bind:key="item" v-for="item in yearList" >{{item}}</el-button>
        </el-col>
    </el-row>
    <el-row>
        <el-col :span="22">
            <div class="echarts">
                <IEcharts :option="chartOpt" :loading="loading" />
            </div>
        </el-col>
        <el-col :span="2">

        </el-col>
    </el-row>
</div>
</template>
<script>
import databuilder from '../dataHelper/databuilder.js';
var array = require('array');
import FileSaver from "file-saver";
import { csvParse, csvParseRows, tsvParse, tsvParseRows, csvFormat, csvFormatRows, 
    tsvFormat, tsvFormatRows } from "d3-dsv";

export default {
    name: "ActiveUser",
    data () {
        return {
            yearList: [],
            selectedYear: null,
            activeUserList: null,
            chartOpt: {
                    title: {
                        text: 'CIP参入率'
                    },
                    tooltip : {
                        trigger: 'axis',
                        axisPointer: {
                            type: 'shadow',
                            label: {
                                show: true
                            }
                        }
                    },
                    toolbox: {
                        right: 50,
                        feature: {
                            saveAsImage: {},
                            dataView: {show: true, readOnly: false},
                            myLoadUnActiveUser: {
                                show: true,
                                title: '下载未参与人员名单',
                                icon: 'path://M931.445 127.626l-838.609 0c-50.674 0-91.9 41.229-91.9 91.906l0 584c0 50.678 41.226 91.907 91.9 91.907l33.095 0c3.36 0.169 6.815 0.259 10.374 0.259 3.799 0 7.015-0.103 9.385-0.213 1.664 0.049 3.327 0.082 4.968 0.082 2.75 0 4.885-0.07 6.154-0.127l366.99 0.582c1.12 0.045 3.015 0.102 5.472 0.102 2.944 0 7.157-0.088 12.029-0.43l4.815 0.004c0.373 0.006 0.974 0.013 1.777 0.013 2.182 0 5.54-0.051 9.652-0.271l373.898 0c50.674 0 91.9-41.229 91.9-91.907l0-584C1023.345 168.854 982.119 127.626 931.445 127.626zM555.94 831.439l-14.532 0-1.598 0.161c-0.325 0.033-0.644 0.062-0.963 0.09l-391.474-0.354-1.238-0.007-1.306 0.105c-0.002 0-0.021 0.002-0.053 0.004l-17.026 0c-5.859-0.37-10.296-1.085-13.421-1.81 2.336-32.908 17.356-78.817 53.792-118.562 29.764-32.467 84.165-71.169 174.31-71.169 90.333 0 145.262 38.776 175.434 71.306 36.773 39.646 52.08 85.107 54.612 117.805C568.382 830.048 562.613 830.993 555.94 831.439zM959.345 803.532c0 15.388-12.516 27.907-27.9 27.907l-294.74 0c-0.984-25.378-7.082-52.505-17.818-78.942-12.519-30.827-31.226-60.155-54.098-84.814-38.837-41.871-108.939-91.783-222.357-91.783-113.413 0-183.044 49.986-221.486 91.92-24.704 26.948-43.861 58.662-56.01 91.569l0-539.856c0-15.388 12.516-27.906 27.9-27.906l838.609 0c15.384 0 27.9 12.519 27.9 27.906L959.345 803.532zM344.423 256.117c-83.651 0-151.707 68.053-151.707 151.7 0 83.658 68.055 151.719 151.707 151.719 83.655 0 151.713-68.061 151.713-151.719C496.135 324.17 428.077 256.117 344.423 256.117zM344.423 495.536c-48.361 0-87.707-39.351-87.707-87.719 0-48.358 39.345-87.7 87.707-87.7 48.365 0 87.713 39.342 87.713 87.7C432.135 456.185 392.788 495.536 344.423 495.536zM577.096 255.076l318 0 0 64-318 0 0-64ZM577.096 383.076l318 0 0 64-318 0 0-64ZM577.096 511.076l193 0 0 64-193 0 0-64Z',
                                onclick: () => {
                                    this.loadUnActiveUserList();
                                }
                            }
                        }
                    },
                    calculable : false,
                    grid: {
                        top: 70,
                        left: '5%',
                        right: '4%',
                        bottom: 30,
                        containLabel: true,
                        tooltip: {
                            trigger: 'axis',
                            axisPointer: {
                                type: 'shadow',
                                label: {
                                    show: true,
                                    formatter: function (params) {
                                        return params.value.replace('\n', '');
                                    }
                                }
                            }
                        }
                    },
                    legend: {
                        data: ["Total"],
                        left: 120,
                        width: 900
                    },
                    xAxis: [
                        {
                            type:'category',
                            axisLabel:{'interval':0},
                            data:[
                            ]
                        }
                    ],
                    yAxis: {
                        type: 'value',
                        name: '累计参入率 %',
                        min: 0,
                        max: 100,
                        splitNumber: 10,
                        axisLabel: {
                                formatter: '{value} %'
                        }
                    },
                    series: [
                    ]
            },
            loading: false
        }
    },
    props: ["monthList"],
    created () {
        var curYear = new Date().getFullYear();
        this.yearList = [];
        for(var startYear = 2017; startYear < curYear; startYear++) {
            this.yearList.push(startYear);
        }
    },
    methods: {
        setOpts: function(item) {
            this.selectedYear = item;
            var year = item;
            var pyear = year + 1;
            var monthlist = [year+"-10",year+"-11",year+"-12",pyear+"-01",pyear+"-02",pyear+"-03",
                pyear+"-04",pyear+"-05",pyear+"-06",pyear+"-07",pyear+"-08",pyear+"-09"];   
            var dtList = new array(this.$store.state.departmentList).toArray();
            dtList.push("Total");
            this.chartOpt.legend.data = dtList;
           
            this.chartOpt.xAxis[0].data = monthlist;

            // var result = databuilder.loadOptListByMonthListWithAIR(
            //     databuilder.buildMainReportDataByMonth(this.$store.state.cipDataList,dList,tList,this.monthList),
            //     this.monthList, dtList,  "CIP"
            // );
            var userArr = [];
            var result = databuilder.loadActiveEmployeeList(this.$store.state.cipDataList,monthlist,
                this.$store.state.userList,this.$store.state.departmentList,userArr);
            console.dir(result);
            console.dir(userArr);
            this.activeUserList = userArr;
            this.chartOpt.series = result;
            //this.chartOpt.options = result;
        },
        loadUnActiveUserList: function() {
            if(this.selectedYear) {
                var unActiveUsers = this.$store.state.userList.filter((item, index) => {
                    if(this.activeUserList && this.activeUserList.length > 0) {
                        for(var userKey in this.activeUserList) {
                            var userItem = this.activeUserList[userKey];
                            if(userItem.indexOf(item.EmployeeNo) != -1) {
                                return false;
                            }
                        }
                    }
                    return true;
                });

                var exportedData = [["姓名","员工号","部门","Team"]].concat(unActiveUsers.map((item, index) => {
                    return [
                        item.Name, item.EmployeeNo, item.Department, item.Team
                    ];
                    }));

                var csvContent = csvFormatRows(exportedData);

                var mime_type = "text/csv;charset=utf-8";
                var filename = "UnCIPUserList_" + this.selectedYear + ".csv";

                var file = new Blob([csvContent], {type: mime_type});

                FileSaver.saveAs(file, filename);

            } else {
                this.$message("请先选择年份");
            }
        }
    }
}
</script>

<style scoped>
.echarts {
    width: 1200px;
    height: 450px;
  }
</style>
