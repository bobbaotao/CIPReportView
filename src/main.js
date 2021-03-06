// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import store from './store'
import { Button, Select, DatePicker, loading, TabPane, Tabs, Row, Col, Table, TableColumn } from 'element-ui';
import IEcharts from 'vue-echarts-v3/src/full.js';

import 'whatwg-fetch'
import VueFetch from 'vue-fetch'

Vue.use(VueFetch, {
    polyfill: true //should vue-fetch load promise polyfill, set to false to use customer polyfill
});
require('es6-promise').polyfill();
//require('fetch').polyfill();
Vue.config.productionTip = false;

Vue.component(Button.name, Button);
Vue.component(Select.name, Select);
Vue.component(DatePicker.name, DatePicker);
Vue.component(loading.name, loading);
Vue.component(TabPane.name, TabPane);
Vue.component(Tabs.name, Tabs);
Vue.component(Row.name, Row);
Vue.component(Col.name, Col);
Vue.component(Table.name, Table);
Vue.component(TableColumn.name, TableColumn);
Vue.component(IEcharts.name, IEcharts);

/* eslint-disable no-new */
new Vue({
    el: '#app',
    store,
    components: { App },
    template: '<App/>'
})