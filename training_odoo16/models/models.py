# -*- coding: utf-8 -*-

from odoo import models, fields, api


class ResUser(models.Model):
    _inherit = 'res.users'

    value_test = fields.Integer(string="Test Fields", default=80)
