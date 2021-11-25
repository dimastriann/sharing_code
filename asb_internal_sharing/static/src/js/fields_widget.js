odoo.define('asb_internal_sharing.BoardInfo', function(require){
"use strict";

const field_utils = require('web.field_utils');
const AbstractFieldOwl = require('web.AbstractFieldOwl')
//const fieldRegistry = require('web.field_registry')
const fieldRegistryOwl = require('web.field_registry_owl');

const FORMAT_OPTIONS = {
    // allow to decide if utils.human_number should be used
    humanReadable: function (value) {
        return Math.abs(value) >= 1000000;
    },
    // with the choices below, 1250000 is represented by 1.25M
    minDigits: 1,
    decimals: 2,
    // avoid comma separators for thousands in numbers when human_number is used
    formatterCallback: function (str) {
        return str;
    },
};


class BoardInfo extends AbstractFieldOwl {
    constructor(){
        super(...arguments)
//        console.log('const', this)
    }

    get boardInfo(){
        return JSON.parse(this.value)
    }

    get action(){
        return this.boardInfo.action || {}
    }

    get type(){
        return this.boardInfo.type
    }

    get dataValue(){
        const length = this.boardInfo.data.toString().length
        return length < 4 
                ? this.boardInfo.data 
                : this.formatValue(this.boardInfo.data)
    }

    setup(){
        super.setup()
        console.log('setup', this)
    }

    async willStart(){
        await super.willStart()
//        console.log('will start')
        return owl.utils.loadJS('/web/static/lib/Chart/Chart.js')
    }

    mounted(){
        super.mounted()
        this.notifyInfoNoModel()
        if(this.props.options.dashboard){
            this.el.classList.remove('o_field_widget');
        }
        this.applyInfoToDOM()
    //        console.log('mounted', this.boardInfo);
    }

    patched(){
        super.patched()
        this.notifyInfoNoModel()
        this.applyInfoToDOM()
    //        console.log('patched', this)
    }

    async willUpdateProps(nextProps) {
        super.willUpdateProps(nextProps)
//        console.log('will update', nextProps)
    }

    willPatch() {
        super.willPatch()
//        console.log('will patch')
    }

    applyInfoToDOM(){
        switch(this.boardInfo.type){
            case 'card':
                this.toggleWrapper(true)
                this.el.style.background = this.bgColor();
                break;
            case 'line':
            case 'bar':
                this.toggleWrapper(false)
                this.renderChart();
                break;
        }
    }

    bgColor(){
        const fColor = this.boardInfo.first_color
        const sColor = this.boardInfo.second_color
        const linearBgColor = `linear-gradient(to top left, ${fColor}, ${sColor})`;
        return linearBgColor
    }

    formatValue(value){
        const formatter = field_utils.format.float;
        FORMAT_OPTIONS.decimals = this.boardInfo.type_count === "count" ? 0 : 2
        FORMAT_OPTIONS.digits = this.boardInfo.type_count === "count" ? [16, 0] : [16, 2]
        const formattedValue = formatter(value, undefined, FORMAT_OPTIONS);
        return formattedValue;
    }

    // create element for notify empty model
    notifyInfoNoModel(){
        if(!this.boardInfo){
            const spanEl = document.createElement("span")
            spanEl.setAttribute("id", "empty_model")
            spanEl.innerText = "Please select the model first."
            this.el.append(spanEl)
        }
    }  

    // render chart
    renderChart(){
        const config = {
            type: this.type,
            data: {
                labels: this.boardInfo.labels,
                datasets: this.boardInfo.data,
            },
            options: {
                responsive: true,
                title: {
                    display: true,
                    text: `${this.boardInfo.title}`,
                },
            }
        }

        this.canvasChart = document.createElement('canvas');
        var context = this.canvasChart.getContext('2d');
        if(this.el.querySelector('canvas')){
            this.el.querySelector('canvas').remove();
        }
        this.el.append(this.canvasChart);
        this.chart = new Chart(context, config);
    }

    toggleWrapper(display){
        if(this.el.parentElement){
            this.el.parentElement.classList.toggle('card-wrapper', display)
        }
    }

   // event handler for open record,
   // when user click the value of card and then open
   // the record with domain
    onOpenRecord(info){
        const action = {
            type: 'ir.actions.act_window',
            name: this.env._t(info.title),
            res_model: this.action.res_model || info.action.res_model,
            view_mode: 'list,form',
            views: [[false, 'list'], [false, 'form']],
            target: 'current',
            domain: this.action.domain || info.action.domain,
            context: Object.assign({},
                this.props.record.context,
                {create: false, edit: false, delete: false, duplicate: false}
            )
        }
        this.trigger('do-action', { action });
    }

}

BoardInfo.template = "BoardInfo";
BoardInfo.description = "Board Info";
BoardInfo.supportedFieldTypes = ['char', 'text'];

fieldRegistryOwl.add('board_info', BoardInfo);

return { BoardInfo }
})