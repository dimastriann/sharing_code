/** @odoo-module **/

import { registry } from "@web/core/registry";

const { Component, onWillStart, onMounted,
    onPatched, onWillRender, onRendered, useRef } = owl;


/* Widget */
export class MyCustomWidget extends Component {

    setup(){
        this.rootRef = useRef('custom-widget');

        /* Lifecycle hooks */
        onWillStart( function(){
            console.log(this, 'onWillStart')
        })

        onWillRender( () => {
            console.log(this, 'onWillRender')
        })

        onMounted( () => {
            console.log(this, 'onMounted')
        })

        onRendered( () => {
            console.log(this, 'onRendered')
        })

        onPatched( () => {
            console.log(this, 'onPatched')
            console.log($(this.rootRef.el))
        })
    }

    get classes() {
        let classes = this.props.bgClass;
        if (this.props.text.length > 15) {
            classes += " o_small";
        } else if (this.props.text.length > 10) {
            classes += " o_medium";
        }
        return classes;
    }

    onClickWidget(ev){
        console.log(ev)
        alert(`Widget Clicked ${this.props.text}`);
    }
}

MyCustomWidget.template = 'MyCustomWidget';
MyCustomWidget.defaultProps = {
    title: "",
    bgClass: "bg-success",
};

MyCustomWidget.extractProps = ({ attrs }) => {
    return {
        text: attrs.title || attrs.text,
        title: attrs.tooltip,
        bgClass: attrs.bg_color,
    };
};

registry.category('view_widgets').add('custom_widget', MyCustomWidget);


/* Fields Widget */
export class WidgetFields extends Component{

    setup(){
        this.fieldRef = useRef('custom-field-widget');

        onMounted( () => {
            this.mountedField();
        })
    }

    mountedField(){
        // can manipulate the element on DOM
        console.log('mounted the field widget', this)
    }
}

WidgetFields.template = 'CustomFieldWidget';

registry.category('fields').add('my_field_widget', WidgetFields);
