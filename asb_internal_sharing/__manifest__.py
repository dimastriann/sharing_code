# -*- coding: utf-8 -*-
{
    'name': "ASB Sharing",

    'summary': """
        ASB Sharing Code""",

    'description': """
        => Inheritance / Extending View,
        
        => Dashboard Client,
        
        => Field Widget [ widget report / summary ]
    """,

    'author': "PT. Arkana Solusi Bisnis",
    'website': "https://arkana.co.id",

    # Categories can be used to filter modules in modules listing
    # Check https://github.com/odoo/odoo/blob/14.0/odoo/addons/base/data/ir_module_category_data.xml
    # for the full list
    'category': 'hidden',
    'version': '0.2',

    # any module necessary for this one to work correctly
    'depends': ['web', 'sale', 'purchase', 'mrp'],

    # always loaded
    'data': [
        'security/ir.model.access.csv',

        'views/assets.xml',
        'views/sale_order_views.xml',

        'views/dashboard_data_views.xml',
        'views/dashboard_client_view.xml',

        'views/menu_item.xml',

    ],

    # qweb
    'qweb': [
        'static/src/xml/sale_dashboard_template.xml',

        'static/src/xml/dashboard_client.xml',
    ],
}
