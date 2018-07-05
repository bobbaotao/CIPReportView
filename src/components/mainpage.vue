<template>
 <div>
   <el-row class="top">
      <el-col :span="12" :offset="4">
        <el-date-picker class="monthPicker" size="mini" v-model="startMonth" type="month" placeholder="请选择起始月份">
        </el-date-picker>
        <el-date-picker class="monthPicker" size="mini"  v-model="endMonth" type="month" placeholder="请选择结束月份">
        </el-date-picker>
      </el-col>
      <el-col :span="2">
        <el-button size="small" :disabled="startMonth == '' || endMonth == '' || startMonth > endMonth" v-on:click="loadDataFromServer">Load Report</el-button>
      </el-col>
   </el-row>
   <el-row>
     <el-col :span="22" :offset="1">
        <el-tabs v-model="activeTab" type="card" @tab-click="handleClick">
          <el-tab-pane label="有效的CIP" name="first">
            <div class="echarts">
              <IEcharts :option="chartData1" :loading="loading" />
            </div>
          </el-tab-pane>
          <el-tab-pane label="积分汇总表" name="second">
            <Summary v-bind:monthList="monthList"></Summary>
          </el-tab-pane>
        </el-tabs>
        
     </el-col>
   </el-row>

  
 </div>
</template>

<script>
import pnp, {Web} from 'sp-pnp-js';
//import IEcharts from 'vue-echarts-v3/src/full.js';
import databuilder from '../dataHelper/databuilder.js';
import IEcharts from 'vue-echarts-v3/src/lite.js';
import 'echarts/lib/chart/bar';
import 'echarts/lib/component/legend';
import 'echarts/lib/component/title';
import 'echarts/lib/component/tooltip';
import 'echarts/lib/component/grid';
//import func from './vue-temp/vue-editor-bridge.js';
import { Loading } from 'element-ui';
import Summary from './Summary';

var buckets = require('buckets-js');

export default {
  name: 'MainPage',
  data () {
    return {
      labelOption : {
          normal: {
              show: true,
              position: 'insideBottom',
              distance: 15,
              align: 'left',
              verticalAlign: 'middle',
              rotate: 90,
              formatter: '{c}  {name|{a}}',
              fontSize: 16,
              rich: {
                  name: {
                      textBorderColor: '#fff'
                  }
              }
          }
      },
      startMonth: '',
      endMonth: '',
      activeTab: "first",
      departmentList: ['Administration','Engineering','Lean','Plant General Manager','Production',
                'Purchasing', 'Quality', 'Supply Chain', 'Support'],
      teamList: ['test1','test2'],
      monthList: ['2018-05','2018-06','2018-07','2018-08','2018-09','2018-10','2018-11','2018-12','2019-01','2019-02','2019-03'],
      loading: false,
      chartData1: {
        tooltip : {
        trigger: 'axis',
        axisPointer : {            // 坐标轴指示器，坐标轴触发有效
            type : 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
            }
        },
        legend: {
            data:['Administration','Engineering','Lean','Plant General Manager','Production',
                'Purchasing', 'Quality', 'Supply Chain', 'Support']
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis : [
          {
              type : 'category',
              data : ['2018-06','Total'],
          }
        ],
        yAxis: [
          {
            type: 'value',
            minInterval: 1
          }
        ],
        series: [{
          name: 'Production',
          type:'bar',
          data: [5,5]
        }]
      }
    }
  },
  components: {
      IEcharts, Summary
  }, 
  created () {
    this.loadUserList();
  },
  methods: {
    ShowLoadingView: function() {
        Loading.service({ fullscreen: true });
    },
    HideLoadingView: function() {
        let curLoadingInstance = Loading.service({ fullscreen: true });
        curLoadingInstance.close();
    },
    loadDataFromServer: function() {
        var ymList = databuilder.getMonthRangeList(this.startMonth, this.endMonth);
        this.monthList = ymList;
        console.dir(ymList);

        this.ShowLoadingView();
        pnp.setup({
            sp: {
                headers: {
                    "Accept": "application/json; odata=verbose"
                },
                baseUrl: "https://teamshare.zeiss.org/team/06330/1600929"
            }
        });
        pnp.sp.web.lists.getByTitle("CIPV2").items.select(
          "Title","RBEmployeeNO","RBName","RBMgrName","RBDepartment","RBTeam","RBMgrApproveDate","TargetDepartment",
          "TargetTeam","FormStatus","TargetImplementer/Name","ImplementationDate","ImplementEmployeeNo","Created",
          "AdminAwardDate","ScoreOfSuggest","ScoreOfImplementer","TargetMgrApproveDate","RequesterConfirmDate"
          ).expand("TargetImplementer/Name").filter("FormStatus ne 'Draft' and FormStatus ne 'Rejected'")
        .orderBy("Created",false).getAll().then(
            r => {
              this.HideLoadingView();
              this.$store.commit('initCIPDateList',r);
              var dataResult = databuilder.buildDataForReport1(r, this.departmentList, this.teamList, this.monthList);
              this.chartData1.legend.data = this.departmentList;
              var monthArr =  buckets.arrays.copy(this.monthList);
              monthArr.push("Total");
              this.chartData1.xAxis[0].data = monthArr;
              this.chartData1.series = dataResult;
              this.loading = false;
            }
          );
    },
    loadUserList: function() {
        this.ShowLoadingView();
        pnp.setup({
            sp: {
                headers: {
                    "Accept": "application/json; odata=verbose"
                },
                baseUrl: "https://teamshare.zeiss.org/team/06330/1600929"
            }
        });
        pnp.sp.web.lists.getByTitle("IMTUserList").items.select("User/Name","User/UserName","User/Title","Department","Team","EmployeeNo").expand("User/Name","User/UserName","User/Title").orderBy("Department,Team").getAll().then(
          r => {
            this.HideLoadingView();
            this.$store.commit('initUserList',r);
            this.departmentList = this.$store.state.departmentList;
          }
        );
    },
    loadDataFromServer2: function() {
       pnp.setup({
            sp: {
                headers: {
                    "Accept": "application/json; odata=verbose"
                },
                baseUrl: "https://teamshare.zeiss.org/team/06330/1600929"
            }
        });
        // let options = {
        //   headers: {
        //      "Accept": "application/json; odata=verbose"
        //   }
        // };
        //undefined,options
        //let curWeb = new Web("https://teamshare.zeiss.org/team/06330/1600929");
        
        pnp.sp.web.lists.getByTitle("CIP Management").items.select(
          "Title","Department","Team"
          ).filter("Title ne 'Draft'")
        .orderBy("Created",false).getAll().then(
            r => {
              console.dir(r);
            }
          );
    }
  }
}
</script>

<style scoped>
.echarts {
    width: 1200px;
    height: 500px;
  }
.monthPicker {
 margin-right: 30px;
}
.top {
  margin-bottom: 20px;
}
</style>
