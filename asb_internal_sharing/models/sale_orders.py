# -*- coding: utf-8 -*-

from odoo import models, api


class SaleOrders(models.Model):
    _inherit = "sale.order"

    @api.model
    def retrieve_sale_dashboard(self):
        """this method return data for sale dashboard in list views"""
        res_quotations = self.search([('state', 'in', ['draft', 'sent']), ('user_id', '=', self.env.uid)])
        res_orders = self.search([('state', 'in', ['sale', 'done']), ('user_id', '=', self.env.uid)])
        res = {
            "quotations": {
                "total": len(res_quotations),
                "amount": sum(res_quotations.mapped('amount_total')),
                "products": len(res_quotations.order_line.mapped('product_id')),
                "qty": sum(res_quotations.order_line.mapped('product_uom_qty')),
            },
            "orders": {
                "total": len(res_orders),
                "amount": sum(res_orders.mapped('amount_total')),
                "products": len(res_orders.order_line.mapped('product_id')),
                "qty": sum(res_orders.order_line.mapped('product_uom_qty')),
            },
            "currency_symbol": self.env.user.currency_id.symbol,
        }
        return res
