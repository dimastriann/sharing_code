# -*- coding: utf-8 -*-
{
    'name': "Webinar Demo",

    'summary': """
        Odoo 16 Webinar Demo""",

    'description': """
        Odoo 16 Webinar Demo
    """,

    'author': "Dimastriann",
    'website': "https://dimastriann.github.io",

    'category': 'Hidden',
    'version': '0.1',

    # any module necessary for this one to work correctly
    'depends': ['web'],

    # always loaded
    'data': [
        # 'security/ir.model.access.csv',
        'views/views.xml',
        # 'views/templates.xml',
    ],

    'demo': [],

    'assets': {
        'web.assets_backend': [
            'training_odoo16/static/src/js/custom_widget.js',
            'training_odoo16/static/src/js/custom_widget.xml',
        ]
    }
}
