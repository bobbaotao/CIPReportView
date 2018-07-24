<template>
<div>
    <el-row>
        <el-button size="mini" v-on:click="setOpts(monthList)">有效CIP数目</el-button>
        <el-button size="mini" v-on:click="setOpts2">按时答复率</el-button>
        <el-button size="mini" v-on:click="setOpts3">平均答复天数</el-button>
    </el-row>
    <el-row>
        <el-col>
        <div class="echarts">
            <IEcharts :option="chartOpt" :loading="loading" />
        </div>
        </el-col>
    </el-row>
</div>
</template>
<script>
import databuilder from '../dataHelper/databuilder.js';
export default {
    name: "DTReportWithTimeLine",
    data () {
        return {
            chartOpt: {
                baseOption: {
                    tooltip : {
                        trigger: 'axis',
                        axisPointer: {
                            type: 'shadow',
                            label: {
                                show: true
                            }
                        }
                    },
                    calculable : true,
                    timeline: {
                        axisType: 'category',
                        autoPlay: false,
                        data: ['2018-04','2018-05','2018-06']
                    },
                    grid: {
                        top: 30,
                        left: '3%',
                        right: '4%',
                        bottom: 100,
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
                    // legend: {
                    //     data: ['Forest', 'Steppe', 'Desert', 'Wetland']
                    // },
                    xAxis: [
                        {
                            type:'category',
                            //axisLabel:{'interval':0},
                            data:[
                                '有效数目'
                            ]
                        }
                    ],
                    yAxis: [
                        {
                            type: 'value',
                            minInterval: 1,
                            min: 0,
                            name: "个数"
                        }
                    ],
                    series: [
                        {name: '有效CIP数目', type: 'bar'},
                    ]
                },
                options: [
                   
                ]
            },
            loading: false
        }
    },
    props: ["monthList"],
    methods: {
        setOpts: function(monthDataList) {
            this.chartOpt.baseOption.timeline.data = monthDataList;
            var dList = this.$store.state.departmentList;
            var tList = []; //this.$store.state.TeamList.map('DepartmentTeam').unique().toArray();
            var dtList = dList.concat(tList).sort();
            this.chartOpt.baseOption.xAxis[0].data = dtList;
            //this.chartOpt.baseOption.legend.data = dtList;
            this.chartOpt.baseOption.yAxis[0].name = "个数";

            var result = databuilder.loadOptListByMonthList(
                databuilder.buildMainReportDataByMonth(this.$store.state.cipDataList,dList,tList,monthDataList),
                monthDataList, dtList, "TotalActiveNum", "有效CIP"
            );
            console.dir(result);
            this.chartOpt.options = result;
        },
        setOpts2: function() {
            this.chartOpt.baseOption.timeline.data = this.monthList;
            var dList = this.$store.state.departmentList;
            var tList = []; //this.$store.state.TeamList.map('DepartmentTeam').unique().toArray();
            var dtList = dList.concat(tList).sort();
            this.chartOpt.baseOption.xAxis[0].data = dtList;
            //this.chartOpt.baseOption.legend.data = dtList;
            this.chartOpt.baseOption.yAxis[0].name = "百分比";

            var result = databuilder.loadOptListByMonthList(
                databuilder.buildMainReportDataByMonth(this.$store.state.cipDataList,dList,tList,this.monthList),
                this.monthList, dtList, "AcceptOnTimeRate", "按时答复率"
            );
            console.dir(result);
            this.chartOpt.options = result;
        },
        setOpts3: function() {
            this.chartOpt.baseOption.timeline.data = this.monthList;
            var dList = this.$store.state.departmentList;
            var tList = []; //this.$store.state.TeamList.map('DepartmentTeam').unique().toArray();
            var dtList = dList.concat(tList).sort();
            this.chartOpt.baseOption.xAxis[0].data = dtList;
            //this.chartOpt.baseOption.legend.data = dtList;
            this.chartOpt.baseOption.yAxis[0].name = "天数";

            var result = databuilder.loadOptListByMonthList(
                databuilder.buildMainReportDataByMonth(this.$store.state.cipDataList,dList,tList,this.monthList),
                this.monthList, dtList, "AverageCloseDays", "平均结案时间"
            );
            console.dir(result);
            this.chartOpt.options = result;
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
