<template>
<div>
    <!-- <el-row>
        <el-button size="mini" v-on:click="setOpts">汇总数据</el-button>
    </el-row> -->
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
    name: "DTReport2",
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
                    toolbox: {
                        feature: {
                            saveAsImage: {},
                            dataView: {show: true, readOnly: false}
                        }
                    },
                    timeline: {
                        axisType: 'category',
                        autoPlay: false,
                        data: ['2018-04','2018-05','2018-06']
                    },
                    grid: {
                        top: 70,
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
                    legend: {
                        data: ['有效CIP数目', '按时答复率', '平均结案时间']
                    },
                    xAxis: [
                        {
                            type:'category',
                            axisLabel:{'interval':0},
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
                            name: "有效CIP数目",
                            position: 'right',
                            splitNumber: 5
                        },{
                            type: 'value',
                            name: '按时答复率',
                            min: 0,
                            max: 100,
                            splitNumber: 10,
                            position: 'left',
                            axisLabel: {
                                formatter: '{value} %'
                            }
                        },{
                            type: 'value',
                            name: '平均结案时间',
                            min: 0,
                            position: 'right',
                            offset: 60,
                            minInterval: 1,
                            splitNumber: 5,
                            nameLocation: 'middle',
                            axisLabel: {
                                formatter: '{value} 天'
                            }
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
            var xLabelArr = [];
            for(var i = 0; i <= dtList.length; i++) {
                if(i % 2 == 0) {
                    xLabelArr.push(dtList[i]);
                } else {
                    xLabelArr.push("\n" + dtList[i])
                }
            }
            this.chartOpt.baseOption.xAxis[0].data = dtList;
            //this.chartOpt.baseOption.legend.data = dtList;
            //this.chartOpt.baseOption.yAxis[0].name = "个数";

            var result = databuilder.loadOptListByMonthListWithAIR(
                databuilder.buildMainReportDataByMonth(this.$store.state.cipDataList,dList,tList,monthDataList),
                monthDataList, dtList,  "CIP"
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
