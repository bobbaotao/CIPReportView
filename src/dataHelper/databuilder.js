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
    buildMainReportDataByDepartment: function(data, departmentlist, monthlist) {
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
                    AcceptOnTimeRate: 0,
                    AverageCloseDays: 0
                };
                monthDataDic.set(monthValue, monthData);
            }
            //var departmentDic = this.buildMonthDataDic(monthlist);
            departmentBucket.set(departmentStr, monthDataDic);
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
                        monthValue.AverageCloseDays = Math.round((monthValue.TotalClosedDays * 10) / monthValue.TotalClosedNum) / 10;
                        depValue.set(monthStr, monthValue);
                    }
                }
            }
        }
        console.dir(departmentBucket);

        return departmentBucket;
    },
    //build
    buildMainReportDataByMonth: function(data, departmentlist, teamList, monthlist) {
        var monthBucket = new buckets.Dictionary();
        //init department valus
        var dtList = departmentlist.concat(teamList).sort();
        for (var mKey in monthlist) {
            var monthStr = monthlist[mKey];
            var dtDic = new buckets.Dictionary();
            for (var dtKey in dtList) {
                var dtStr = dtList[dtKey];
                var dtValue = {
                    TotalActiveNum: 0,
                    TotalAcceptOnTimeNum: 0,
                    TotalClosedNum: 0,
                    TotalClosedDays: 0,
                    AcceptOnTimeRate: 0,
                    AverageCloseDays: 0
                }
                dtDic.set(dtStr, dtValue);
            }
            monthBucket.set(monthStr, dtDic);
        }

        for (var key in data) {
            var dataItem = data[key];
            if (dataItem.RBMgrApproveDate != null) {
                var monthStr = this.formatMonthStr(dataItem.RBMgrApproveDate);
                var monthValue = monthBucket.get(monthStr);
                if (monthValue != undefined) {
                    var dValue = monthValue.get(dataItem.RBDepartment);
                    var tValue = monthValue.get(dataItem.RBDepartment + "-" + dataItem.RBTeam);

                    if (dValue != undefined) {
                        dValue.TotalActiveNum = dValue.TotalActiveNum + dataItem.ActiveNum;
                        dValue.TotalAcceptOnTimeNum = dValue.TotalAcceptOnTimeNum + dataItem.AcceptOnTimeNum;
                        dValue.TotalClosedNum = dValue.TotalClosedNum + dataItem.ClosedNum;
                        dValue.TotalClosedDays = dValue.TotalClosedDays + dataItem.ClosedDays;
                        dValue.AcceptOnTimeRate = Math.round((dValue.TotalAcceptOnTimeNum * 100) / dValue.TotalActiveNum);
                        dValue.AverageCloseDays = Math.round((dValue.TotalClosedDays * 10) / dValue.TotalClosedNum) / 10;
                        monthValue.set(dataItem.RBDepartment, dValue)
                    }
                    if (tValue != undefined) {
                        tValue.TotalActiveNum = tValue.TotalActiveNum + dataItem.ActiveNum;
                        tValue.TotalAcceptOnTimeNum = tValue.TotalAcceptOnTimeNum + dataItem.AcceptOnTimeNum;
                        tValue.TotalClosedNum = tValue.TotalClosedNum + dataItem.ClosedNum;
                        tValue.TotalClosedDays = tValue.TotalClosedDays + dataItem.ClosedDays;
                        tValue.AcceptOnTimeRate = Math.round((tValue.TotalAcceptOnTimeNum * 100) / tValue.TotalActiveNum);
                        tValue.AverageCloseDays = Math.round((tValue.TotalClosedDays * 10) / tValue.TotalClosedNum) / 10;
                        monthValue.set(dataItem.RBDepartment + "-" + dataItem.RBTeam, tValue)
                    }
                }
                monthBucket.set(monthStr, monthValue);
            }
        }
        console.dir(monthBucket);
        return monthBucket;
    },
    loadOptListByMonthList: function(data, monthList, dtList, dataType, titleStr) {
        var optList = [];
        for (var mKey in monthList) {
            var monthStr = monthList[mKey];
            var dtDics = data.get(monthStr);
            // init data
            var mResult = [];
            if (dtDics != undefined) {
                for (var dtKey in dtList) {
                    var dtStr = dtList[dtKey];
                    var dtValues = dtDics.get(dtStr);
                    if (dtValues != undefined) {
                        switch (dataType) {
                            case "TotalActiveNum":
                                mResult.push(dtValues.TotalActiveNum)
                                break;
                            case "TotalAcceptOnTimeNum":
                                mResult.push(dtValues.TotalAcceptOnTimeNum)
                                break;
                            case "TotalClosedNum":
                                mResult.push(dtValues.TotalClosedNum)
                                break;
                            case "TotalClosedDays":
                                mResult.push(dtValues.TotalClosedDays)
                                break;
                            case "AcceptOnTimeRate":
                                mResult.push(dtValues.AcceptOnTimeRate)
                                break;
                            case "AverageCloseDays":
                                mResult.push(dtValues.AverageCloseDays)
                                break;
                            default:
                                mResult.push(0);
                                break;
                        }
                    } else {
                        mResult.push(0);
                    }
                }
            } else {
                for (var dtKey in dtList) {
                    mResult.push(0);
                }
            }

            //todo build options
            optList.push({
                title: {
                    text: monthStr + " " + titleStr
                },
                series: [{
                    data: mResult
                }]
            });
        }
        return optList;
    },
    loadOptListByMonthListWithAIR: function(data, monthList, dtList, titleStr) {
        var optList = [];
        for (var mKey in monthList) {
            var monthStr = monthList[mKey];
            var dtDics = data.get(monthStr);
            // init data
            var mResult1 = [];
            var mResult2 = [];
            var mResult3 = [];
            if (dtDics != undefined) {
                for (var dtKey in dtList) {
                    var dtStr = dtList[dtKey];
                    var dtValues = dtDics.get(dtStr);
                    if (dtValues != undefined) {
                        mResult1.push(dtValues.TotalActiveNum);
                        mResult2.push(dtValues.AcceptOnTimeRate);
                        mResult3.push(dtValues.AverageCloseDays);
                    } else {
                        mResult1.push(0);
                        mResult2.push(0);
                        mResult3.push(0);
                    }
                }
            } else {
                for (var dtKey in dtList) {
                    mResult1.push(0);
                    mResult2.push(0);
                    mResult3.push(0);
                }
            }

            //todo build options
            optList.push({
                title: {
                    text: monthStr + " " + titleStr
                },
                series: [{
                    name: "有效CIP数目",
                    type: "bar",
                    data: mResult1
                }, {
                    name: "按时答复率",
                    type: "bar",
                    yAxisIndex: 1,
                    data: mResult2
                }, {
                    name: "平均结案时间",
                    type: "bar",
                    yAxisIndex: 2,
                    data: mResult3
                }]
            });
        }
        return optList;
    },
    loadOptListByMonthListWithLegend: function(data, monthList, dtList, dataType, titleStr) {
        var optList = [];
        for (var mKey in monthList) {
            var monthStr = monthList[mKey];
            var dtDics = data.get(monthStr);
            // init data
            var mResult = []
            if (dtDics != undefined) {
                for (var dtKey in dtList) {
                    var dtStr = dtList[dtKey];
                    var dtValues = dtDics.get(dtStr);
                    var sResult = {
                        name: dtStr,
                        type: 'bar',
                        data: [0]
                    };
                    if (dtValues != undefined) {
                        switch (dataType) {
                            case "TotalActiveNum":
                                sResult.data = [dtValues.TotalActiveNum];
                                mResult.push(sResult)
                                break;
                            case "TotalAcceptOnTimeNum":
                                sResult.data = [dtValues.TotalAcceptOnTimeNum];
                                mResult.push(sResult)
                                break;
                            case "TotalClosedNum":
                                sResult.data = [dtValues.TotalClosedNum];
                                mResult.push(sResult);
                                break;
                            case "TotalClosedDays":
                                sResult.data = [dtValues.TotalClosedDays];
                                mResult.push(sResult);
                                break;
                            case "AcceptOnTimeRate":
                                sResult.data = [dtValues.AcceptOnTimeRate];
                                mResult.push(sResult);
                                break;
                            case "AverageCloseDays":
                                sResult.data = [dtValues.AverageCloseDays];
                                mResult.push(sResult);
                                break;
                            default:
                                mResult.push(sResult);
                                break;
                        }
                    } else {
                        mResult.push(sResult);
                    }
                }
            } else {
                for (var dtKey in dtList) {
                    var sResult = {
                        name: dtStr,
                        type: 'bar',
                        data: [0]
                    };
                    mResult.push(sResult);
                }
            }

            //todo build options
            optList.push({
                title: {
                    text: monthStr + " " + titleStr
                },
                series: mResult
            });
        }
        return optList;
    },
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
    loadActiveEmployeeList: function(data, monthlist, userList, departmentList, userDic) {

        var departmentBucket = new buckets.Dictionary();
        //init department valus
        for (var dkey in departmentList) {
            var departmentStr = departmentList[dkey];
            var monthDataDic = new buckets.Dictionary();
            for (var monthKey in monthlist) {
                var monthValue = monthlist[monthKey];
                var monthData = 0;
                monthDataDic.set(monthValue, monthData);
            }
            //var departmentDic = this.buildMonthDataDic(monthlist);
            departmentBucket.set(departmentStr, monthDataDic);
        }

        //var userDic = [];
        //set ActiveUserNum as month;
        for (var dataKey in data) {
            var dataItem = data[dataKey];
            if (dataItem.RBMgrApproveDate != null) {
                if (userDic.indexOf(dataItem.RBEmployeeNO + dataItem.RBDepartment) == -1) {
                    //userDic.push(dataItem.RBEmployeeNO + dataItem.RBDepartment);
                    //load month str
                    var monthStr = this.formatMonthStr(dataItem.RBMgrApproveDate);
                    //if this item month is in current month list
                    if (monthlist.indexOf(monthStr) != -1) {
                        //then current user can be add to list
                        userDic.push(dataItem.RBEmployeeNO + dataItem.RBDepartment);

                        var depMonthDatas = departmentBucket.get(dataItem.RBDepartment);
                        if (depMonthDatas != null) {
                            var flag = false;
                            for (var mkey in monthlist) {
                                var monthValue = monthlist[mkey];
                                if (monthValue == monthStr) {
                                    flag = true;
                                }
                                if (flag) {
                                    var depMonthDataValue = depMonthDatas.get(monthValue);
                                    depMonthDataValue = depMonthDataValue + 1;
                                    //depMonthDatas.set(depMonthDataValue, monthValue);
                                    //departmentBucket.set(depMonthDatas, dataItem.RBDepartment);
                                    depMonthDatas.set(monthValue, depMonthDataValue);
                                    //departmentBucket.set(dataItem.RBDepartment, depMonthDatas);

                                }
                            }
                            if (flag) {
                                departmentBucket.set(dataItem.RBDepartment, depMonthDatas);
                            }
                        }
                    }
                }

            }
        }

        //build Rates
        var rateResults = [];
        var TmonthDataDic = new buckets.Dictionary();
        for (var monthKey in monthlist) {
            var monthValue = monthlist[monthKey];
            var monthData = 0;
            TmonthDataDic.set(monthValue, monthData);
        }
        console.dir(departmentBucket);

        //departmentBucket.forEach((key, value) => {
        //load total employee num in dep
        var totalNum = 0;
        for (var depKey in departmentList) {
            var key = departmentList[depKey];
            var value = departmentBucket.get(key);
            var totalDepNum = this.loadDepartmentEmployeeNum(userList, key);
            totalNum += totalDepNum;
            var rateArr = [];
            for (var mkey in monthlist) {
                var monthStr = monthlist[mkey];
                //get number of 
                var valueNum = value.get(monthStr);
                var TvalueNum = TmonthDataDic.get(monthStr);
                //count Total num
                //TmonthDataDic.set(TvalueNum + valueNum, monthStr);
                TmonthDataDic.set(monthStr, TvalueNum + valueNum);
                rateArr.push(Math.round(valueNum * 100 / totalDepNum));
            }

            rateResults.push({
                name: key,
                type: 'line',
                data: rateArr
            });
        }
        //});

        var TRateArr = [];
        for (var mkey in monthlist) {
            var monthStr = monthlist[mkey];
            var TvalueNum = TmonthDataDic.get(monthStr);
            TRateArr.push(Math.round(TvalueNum * 100 / totalNum));
        }

        rateResults.push({
            name: 'Total',
            type: 'line',
            data: TRateArr
        });
        return rateResults;
    },
    loadDepartmentEmployeeNum: function(userList, department) {
        var i = 0;
        for (var key in userList) {
            var item = userList[key];
            if (item.Department == department) {
                i++;
            }
        }
        return i;
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