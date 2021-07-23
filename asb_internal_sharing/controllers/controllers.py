# -*- coding: utf-8 -*-
# from odoo import http


# class AsbInternalSharing(http.Controller):
#     @http.route('/asb_internal_sharing/asb_internal_sharing/', auth='public')
#     def index(self, **kw):
#         return "Hello, world"

#     @http.route('/asb_internal_sharing/asb_internal_sharing/objects/', auth='public')
#     def list(self, **kw):
#         return http.request.render('asb_internal_sharing.listing', {
#             'root': '/asb_internal_sharing/asb_internal_sharing',
#             'objects': http.request.env['asb_internal_sharing.asb_internal_sharing'].search([]),
#         })

#     @http.route('/asb_internal_sharing/asb_internal_sharing/objects/<model("asb_internal_sharing.asb_internal_sharing"):obj>/', auth='public')
#     def object(self, obj, **kw):
#         return http.request.render('asb_internal_sharing.object', {
#             'object': obj
#         })
