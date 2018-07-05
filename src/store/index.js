import Vue from 'vue';
import Vuex from 'vuex';
var moment = require('moment');
var array = require('array');

Vue.use(Vuex)

const state = {
    monthList: [],
    userList: [], //[{Name: "", EmployeeNo: "", Department: "", Team: "" , DepartmentTeam: ""},{}]
    cipDataList: [],
    departmentList: [], //["a","b","c"]
    TeamList: [] //[{depaetment:"d1", Team: "t1", name: "d1-t1"},{depaetment:"d2", Team: "t2", name: "d2-t2"}]
}

const mutations = {
    initUserList(state, userData) {
        if (userData != null && userData.length > 0) {
            var uList = array();
            var tList = array();
            for (var key in userData) {
                var userItem = userData[key];
                var formatUserItem = {
                    Name: userItem.User.Title,
                    EmployeeNo: userItem.EmployeeNo,
                    Department: userItem.Department,
                    Team: userItem.Team,
                    DepartmentTeam: userItem.Department + "-" + userItem.Team,
                    RequestTimes: 0,
                    TotalScores: 0,
                    ImplementTimes: 0
                };
                var TeamItem = {
                    Department: userItem.Department,
                    Team: userItem.Team,
                    DepartmentTeam: userItem.Department + "-" + userItem.Team
                }
                tList.push(TeamItem);
                uList.push(formatUserItem);
            }

            state.userList = uList.unique().toArray();
            state.departmentList = uList.unique('Department').map('Department').toArray();
            state.TeamList = tList.unique().toArray();
        }
    },
    // TotalActiveNum: 0,
    //                 AcceptOnTimeNum: 0,
    //                 ClosedNum : 0,
    //                 TotalClosedDays : 0,
    //                 AcceptOnTimeRate: 0
    initCIPDateList(state, userData) {
        if (userData != null && userData.length > 0) {
            var CIPList = array();
            for (var key in userData) {
                var userItem = userData[key];
                userItem.ActiveNum = 0;
                userItem.AcceptOnTimeNum = 0;
                userItem.ClosedNum = 0;
                userItem.ClosedDays = 0;
                if (userItem.TargetMgrApproveDate != null) {
                    userItem.ActiveNum = 1;
                    var mRBMDate = moment(userItem.RBMgrApproveDate);
                    var mTARMDate = moment(userItem.TargetMgrApproveDate);
                    var acceptDays = mTARMDate.diff(mRBMDate, 'days');
                    if (acceptDays <= 7) {
                        userItem.AcceptOnTimeNum = 1;
                    }
                    if (userItem.RequesterConfirmDate != null) {
                        var mRDate = moment(userItem.RequesterConfirmDate);
                        userItem.ClosedNum = 1;
                        userItem.ClosedDays = mRDate.diff(mRBMDate, "days");
                    }
                }
                CIPList.push(userItem);
            }
            state.cipDataList = CIPList.toArray();
        }
    }
}

const getters = {
    //getDepartment
    //TODO
}

export default new Vuex.Store({
    state,
    getters,
    mutations
})