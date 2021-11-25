odoo.define('asb_internal_sharing.DashboardClient', function(require){
"use strict";

const FieldWrapper = require('web.FieldWrapper');
const AbstractAction = require('web.AbstractAction');
const core = require('web.core');
const FieldManagerMixin = require('web.FieldManagerMixin');
const { BoardInfo } = require('asb_internal_sharing.BoardInfo');

const action_registry = core.action_registry;

// extend Action Client
const BoardClientAction = AbstractAction.extend(FieldManagerMixin,{
    contentTemplate: "BoardClient",
    hasControlPanel: true,
    jsLibs: ['/web/static/lib/Chart/Chart.js'],

    // override init function, initialisation properties and call FieldManagerMixin init function
    init: function(parent, action){
        this._super.apply(this, arguments);
        FieldManagerMixin.init.call(this);
        this.action_manager = parent;
        this.action = action;
        this.modelName = "board.client.data";
        this.fieldName = "dashboard_data";
        this.cardWidget = []
        this.chartWidget = []
    },

    // override willStart function and search object
    async willStart(){
        const superParent = this._super.apply(this, arguments)
        this.resData = await this._rpc({
            model: this.modelName,
            method: "search_read",
            domain: [["show_dashboard", "=", true]],
            orderBy: [
                {name:"sequence", asc: true},
                {name: "type", asc: true},
                {name: "id", asc: true}
            ],
        })
        return Promise.all([superParent, this.renderDashboardWidget()])
    },

    // create record
    createRecord(value){
        return this.model.makeRecord(this.modelName, [{
            name: this.fieldName,
            type: 'char',
            value,
        }])
        .then( recordID => this.model.get(recordID))
    },

    // instantiate field widget from class widget
    instantiateWidget(fieldName, record, options){
        return new FieldWrapper(this, BoardInfo, {
            fieldName,
            record,
            options,
        })
    },

    // mounting widget
    renderDashboardWidget(){
//        this.resData.then( results => {
            this.resData.map( async (data) => {
                const record = await this.createRecord(data.dashboard_data)
                const widget = this.instantiateWidget(this.fieldName, record, {dashboard: true})
//                widget.__node = {};
                const divElement = document.createElement('div')
//                widget.mount(document.createDocumentFragment())
                widget.mount(divElement)
                if(data.type == "card"){
                    divElement.classList.add('col-lg-3', 'col-6', 'col-12')
                    this.cardWidget.push(divElement)
                } else if(["line", "bar"].includes(data.type)){
                    divElement.classList.add('col-lg-6', 'col-12')
                    this.chartWidget.push(divElement)
                } else {
                    console.warn("type of widget is wrong")
                }
            })
//        })
    },

    // override start function and call render function
    start: async function(){
        await this._super(...arguments);
        this.render()
    },

    // rendering widget to DOM
    render(){
        // append widget card
        const cardRow = this.el.querySelector('.card-row')
        this.cardWidget.forEach( widgetCardEl => {
            cardRow.append(widgetCardEl)
        })
        // append widget chart
        const chartRow = this.el.querySelector('.chart-row');
        this.chartWidget.forEach( widgetChartEl => {
            chartRow.append(widgetChartEl)
        })
    },

    // for refresh action url when user click no breadcrumbs
    on_attach_callback: function(){
        this._super(...arguments)
        console.log('on attach cb', this)
        this.action_manager.do_push_state({action: this.action.id})
    }

});

// register action client
action_registry.add('dashboard_client', BoardClientAction);

return BoardClientAction;

});