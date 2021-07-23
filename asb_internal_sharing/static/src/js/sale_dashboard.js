odoo.define('asb_internal_sharing.sale_dashboard', function(require){
"use strict";

var ListController = require('web.ListController');
var ListRenderer = require('web.ListRenderer');
var ListModel = require('web.ListModel');
var ListView = require('web.ListView');
const view_registry = require('web.view_registry');
const core = require('web.core');
const field_utils = require('web.field_utils');

const Qweb = core.qweb;

var SaleListDashboardController = ListController.extend({
    events: _.extend({}, ListController.prototype.events, {
        'click .sd_open_action': '_onClickOpenOrders',
    }),

    _onClickOpenOrders: function(event) {
        event.preventDefault();
        var $action = $(event.currentTarget);
        var context = $action.attr('context') || '{}';
        return this.do_action($action.attr('action'), {
            additional_context: JSON.parse(context)
        });
    },

});

var SaleListDashboardRenderer = ListRenderer.extend({

    async _render(){
        await this._super(...arguments);
        var result = this.state.saleDashboardData;
        this.$el.parent().find('.sd_container').remove();
        const saleDashboard = $(Qweb.render('Sale.Dashboard', {
            quotations: result.quotations,
            orders: result.orders,
            currency_symbol: result.currency_symbol,
            formatFloat: this._formatFloat,
            formatInt: this._formatInt,
        }));
        this.$el.before(saleDashboard);
    },

    _formatFloat: function(value, symbol) {
        var res_format = field_utils.format.float(value);
        return symbol ? symbol + ". " + res_format : res_format;;
    },

    _formatInt: function(value) {
        return field_utils.format.integer(value);
    },

});

var SaleListDashboardModel = ListModel.extend({

    init: function(){
        this.saleDashboardData = {};
        this._super.apply(this, arguments);
    },

    __get: function(Id){
        var result = this._super.apply(this, arguments);
        if(_.isObject(result)){
            result.saleDashboardData = this.saleDashboardData[Id];
        }
        return result;
    },

    __load: function(){
        return this._loadSaleDashboard(this._super.apply(this, arguments));
    },

    __reload: function(){
        return this._loadSaleDashboard(this._super.apply(this, arguments));
    },

    _loadSaleDashboard: function(prom){
        const salePromise = this._rpc({
            model: "sale.order",
            method: "retrieve_sale_dashboard",
        });
        return Promise.all([prom, salePromise])
            .then( (results) => {
            let [ dataPointId, saleResult ] = results;
            this.saleDashboardData[dataPointId] = saleResult;
            return dataPointId;
        })
    },

});

var SaleListDashboardView = ListView.extend({
    config: _.extend({}, ListView.prototype.config, {
        Model: SaleListDashboardModel,
        Renderer: SaleListDashboardRenderer,
        Controller: SaleListDashboardController,
    }),

});

view_registry.add('sale_list_dashboard', SaleListDashboardView);

});