# -*- coding: utf-8 -*-
{
    'name': "ASB Sharing",

    'summary': """
        Extending View""",

    'description': """
        Inheritance / Extending View
    """,

    'author': "PT. Arkana Solusi Bisnis",
    'website': "https://arkana.co.id",

    # Categories can be used to filter modules in modules listing
    # Check https://github.com/odoo/odoo/blob/14.0/odoo/addons/base/data/ir_module_category_data.xml
    # for the full list
    'category': 'Uncategorized',
    'version': '0.1',

    # any module necessary for this one to work correctly
    'depends': ['web', 'sale'],

    # always loaded
    'data': [
        # 'security/ir.model.access.csv',
        'views/assets.xml',
        'views/sale_order_views.xml',
    ],
    # qweb
    'qweb': [
        'static/src/xml/sale_dashboard_template.xml',
    ],
}
