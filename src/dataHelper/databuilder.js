var buckets = require('buckets-js');
var moment = require('moment');
var array = require('array');

export default {
    dateFormat: "YYYY-MM-DD",
    monthFormat: "YYYY-MM",
    formatDateToString: function(value) {
        var moDate = moment(value);
        //if (moment.isDate(moDate)) {
        return moDate.format(this.dateFormat);
        //}
        //return "";
    },
    formatMonthStr: function(dateValue) {
        var moDate = moment(dateValue);
        //if (moment.isDate(moDate)) {
        return moDate.format(this.monthFormat);
        //}
        //return "";
    },
    getMonthRangeList: function(startDate, endDate) {
        var mStart = moment(startDate);
        var mEnd = moment(endDate);
        var monthList = array();
        while (mEnd >= mStart) {
            monthList.push(mStart.format(this.monthFormat));
            mStart = mStart.add(1, 'month');
        }
        return monthList.toArray();
    },
    buildDataForReport1: function(data, departmentlist, teamlist, monthlist) {

        var departmentBucket = new buckets.Dictionary();
        for (var dkey in departmentlist) {
            var departmentStr = departmentlist[dkey];
            var departmentDic = this.buildMonthDataDic(monthlist);
            departmentBucket.set(departmentStr, departmentDic);
        }
        for (var dataKey in data) {
            var dataItem = data[dataKey];
            if (dataItem.RBMgrApproveDate && dataItem.FormStatus != 'Rejected') {
                //totalAvaliableCIP += 1;
                var depValue = departmentBucket.get(dataItem.RBDepartment);
                if (depValue != undefined) {
                    var monthStr = this.formatMonthStr(dataItem.RBMgrApproveDate);
                    var monthValue = depValue.get(monthStr);
                    if (monthValue != undefined) {
                        depValue.set(monthStr, monthValue + 1);
                    }
                }
            }
        }
        var result = [];
        departmentBucket.forEach((key, value) => {
            var totalValue = 0;
            value.forEach((vKey, vvalue) => {
                totalValue += vvalue;
            })
            value.set("Total", totalValue);
            var item = {
                name: key,
                type: 'bar',
                barMaxWidth: 20,
                data: value.values()
            }
            result.push(item);
        });
        console.dir(departmentBucket);
        console.dir(result);

        return result;
    },
    buildMonthDataDic: function(monthlist) {
        var monthDataDic = new buckets.Dictionary();
        for (var monthKey in monthlist) {
            var monthValue = monthlist[monthKey];
            monthDataDic.set(monthValue, 0);
        }
        //monthDataDic.set("Total", 0);
        return monthDataDic;
    },
    buildMainReportData: function(data, departmentlist, monthlist) {
        var departmentBucket = new buckets.Dictionary();
        //init department valus
        for (var dkey in departmentlist) {
            var departmentStr = departmentlist[dkey];
            var monthDataDic = new buckets.Dictionary();
            for (var monthKey in monthlist) {
                var monthValue = monthlist[monthKey];
                var monthData = {
                    TotalActiveNum: 0,
                    TotalAcceptOnTimeNum: 0,
                    TotalClosedNum: 0,
                    TotalClosedDays: 0,
                    AcceptOnTimeRate: 0
                };
                monthDataDic.set(monthValue, monthData);
            }
            var departmentDic = this.buildMonthDataDic(monthlist);
            departmentBucket.set(departmentStr, departmentDic);
        }
        //count datas
        for (var key in data) {
            var item = data[key];
            if (item.RBMgrApproveDate != null) {
                var depValue = departmentBucket.get(dataItem.RBDepartment);
                if (depValue != undefined) {
                    var monthStr = this.formatMonthStr(dataItem.RBMgrApproveDate);
                    var monthValue = depValue.get(monthStr);
                    if (monthValue != undefined) {
                        monthValue.TotalActiveNum = monthValue.TotalActiveNum + item.ActiveNum;
                        monthValue.TotalAcceptOnTimeNum = monthValue.TotalAcceptOnTimeNum + item.AcceptOnTimeNum;
                        monthValue.TotalClosedNum = monthValue.TotalClosedNum + item.ClosedNum;
                        monthValue.TotalClosedDays = monthValue.TotalClosedDays + item.ClosedDays;
                        monthValue.AcceptOnTimeRate = Math.round((monthValue.TotalAcceptOnTimeNum * 100) / monthValue.TotalActiveNum);
                        depValue.set(monthStr, monthValue);
                    }
                }
            }
        }
        console.dir(departmentBucket);

        return departmentBucket;
    },
    //build

    buildEmployeeScoreList: function(data, month, userList) {
        var employeeDic = new buckets.Dictionary();
        for (var datakey in data) {
            var dataItem = data[datakey];
            if (dataItem.AdminAwardDate != null) {
                var monthStr = this.formatMonthStr(dataItem.AdminAwardDate);
                if (month == monthStr) {
                    //need add score to total
                    if (dataItem.ScoreOfSuggest != null) {
                        this.countEmployeeScore(employeeDic, dataItem.RBEmployeeNO,
                            dataItem.ScoreOfSuggest, userList);
                    }
                    if (dataItem.ScoreOfImplementer != null) {
                        this.countEmployeeScore(employeeDic, dataItem.ImplementEmployeeNo,
                            dataItem.ScoreOfImplementer, userList);
                    }
                }
            }
        }
        return employeeDic.values();
    },
    countEmployeeScore: function(dataBuckets, employeeNo, score, userList) {
        var employeeItem = dataBuckets.get(employeeNo);
        if (employeeItem == undefined) {
            employeeItem = {
                EmployeeNo: employeeNo,
                EmployeeName: '',
                Scores: 0
            };
            for (var key in userList) {
                var userItem = userList[key];
                if (employeeNo == userItem.EmployeeNo) {
                    employeeItem.EmployeeName = userItem.Name;
                    break;
                }
            }
        }
        employeeItem.Scores = employeeItem.Scores + score;
        dataBuckets.set(employeeNo, employeeItem);
    }
}