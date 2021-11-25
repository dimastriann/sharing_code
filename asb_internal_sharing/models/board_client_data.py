import ast
import json

from odoo import models, fields, api

TYPE = [
    ('card', 'Card'),
    ('line', 'Line Chart'),
    ('bar', 'Bar Chart'),
]

LAYOUT = [
    ('layout1', 'Card Layout 1'),
    ('layout2', 'Card Layout 2'),
    ('layout3', 'Card Layout 3'),
]

GROUP_DATE = [
    ('day', 'Day'), ('week', 'Week'),
    ('month', 'Month'), ('quarter', 'Quarter'),
    ('year', 'Year')
]


class DashboardClientData(models.Model):
    _name = 'board.client.data'
    _description = 'Dashboard Client Data'
    _order = 'sequence, id'

    name = fields.Char(string="Description")
    sequence = fields.Integer(default=10, string="Sequence")
    model_id = fields.Many2one('ir.model', string='Model', required=True, ondelete='cascade',
                               domain="[('id', '=', model_ids)]")
    model_name = fields.Char(related="model_id.model", string="Model Name")
    model_ids = fields.Many2many(comodel_name='ir.model', string="Available Model", compute='_compute_model',
                                 help="Search available model/table and not transient or abstract model")
    field_id = fields.Many2one(comodel_name='ir.model.fields', string="Field", ondelete='cascade',
                               domain="[('id', 'in', suitable_field_ids)]")
    groupby_field_id = fields.Many2one(comodel_name='ir.model.fields', string="Group By", ondelete='cascade',
                                       domain="[('id', 'in', suitable_fields_group_ids)]")
    group_by_date = fields.Selection(selection=GROUP_DATE, default='week', string="Group by Date")
    suitable_field_ids = fields.Many2many('ir.model.fields', compute='_compute_domain')
    suitable_fields_group_ids = fields.Many2many('ir.model.fields', compute='_compute_domain')
    group_field_type = fields.Selection(related='groupby_field_id.ttype', store=True)
    type = fields.Selection(selection=TYPE, string='Type', required=True, default='card')
    card_layout = fields.Selection(selection=LAYOUT, string="Card Layout", default='layout1')
    type_count = fields.Selection(selection=[('count', 'Count'), ('sum', 'Sum'), ('avg', 'Average')], required=True,
                                  default='count', string='Type Count')
    domain_data = fields.Char(string="Domain", default=[])
    color = fields.Char(string='Color', default="#1023AB")
    color2 = fields.Char(string='Second Color', default="#30E8AD")
    icon = fields.Char(string="Icon", default="fa-question")
    dashboard_data = fields.Char('Dashboard Data', compute='_compute_dashboard_data')
    show_dashboard = fields.Boolean(string="Show on Dashboard")
    user_id = fields.Many2one(comodel_name='res.users', string="Owner", default=lambda self: self.env.user)

    @api.onchange('model_id')
    def _change_model_id(self):
        self.ensure_one()
        self.name = self.model_id.name
        self._clear_field()

    @api.onchange('type', 'type_count')
    def _change_type(self):
        self._clear_field()

    def _clear_field(self):
        self.field_id = False
        self.groupby_field_id = False

    @api.depends('model_id')
    def _compute_model(self):
        for rec in self:
            suitable_model_ids = self.env['ir.model'].search([('transient', '=', False)])
            suitable_model_ids = list(fit.id for fit in suitable_model_ids if not self.env[fit.model]._abstract)
            rec.model_ids = [(6, 0, suitable_model_ids)]

    @api.depends('model_id', 'type', 'type_count')
    def _compute_domain(self):
        for rec in self:
            if rec.type_count == 'count':
                rec.suitable_field_ids = []
                rec.suitable_fields_group_ids = []
                continue
            domain_field = [('model_id', '=', rec.model_id.id), ('store', '=', True), ('name', '!=', 'id')]
            domain_group = [('model_id', '=', rec.model_id.id), ('store', '=', True), ('name', '!=', 'id')]
            domain_numeric = [('ttype', 'in', ['float', 'monetary', 'integer'])]
            if rec.type == 'card':
                domain_group += domain_numeric
            elif rec.type != 'card':
                domain_field += domain_numeric
                domain_group += [('ttype', 'in', ('date', 'datetime', 'many2one', 'selection', 'boolean', 'char'))]

            rec.suitable_field_ids = self.env['ir.model.fields'].search(domain_field)
            rec.suitable_fields_group_ids = self.env['ir.model.fields'].search(domain_group)

    @api.depends('model_id', 'field_id', 'groupby_field_id',
                 'domain_data', 'group_field_type', 'group_by_date',
                 'type', 'type_count',
                 'name', 'icon', 'color', 'color2', 'card_layout')
    def _compute_dashboard_data(self):
        for rec in self:
            if not rec.model_id or rec.type not in ['card', 'line', 'bar']:
                rec.dashboard_data = False
                continue

            domain = ast.literal_eval(rec.domain_data) or []
            to_render = {
                'title': rec.name or 'No Title',
                'icon': rec.icon,
                'action': {
                    'res_model': rec.model_name,
                    'domain': domain
                },
                'type': rec.type,
                'type_count': rec.type_count
            }
            if rec.type == 'card':
                field = rec.groupby_field_id.name or 'id'
                read_field = f"{rec.groupby_field_id.name or 'id'}:{rec.type_count}"
                result = self.env[rec.model_name].read_group(domain=domain, fields=[read_field], groupby=[], lazy=False)
                value = sum(res.get(field or 'id') for res in result if res.get(field))
                to_render.update({
                    'card_layout': rec.card_layout,
                    'data': value,
                    'first_color': rec.color,
                    'second_color': rec.color2,
                })
            elif rec.type in ['line', 'bar']:
                if rec.field_id and rec.groupby_field_id:
                    group_by = rec.groupby_field_id.name
                    field = rec.field_id.name
                    dict_selection = {}
                    if rec.group_field_type == 'selection':
                        dict_selection = dict(ast.literal_eval(rec.groupby_field_id.selection))
                    if rec.group_field_type in ['date', 'datetime']:
                        group_by = f"{group_by}:{rec.group_by_date}"
                    results = self.env[rec.model_name].read_group(domain=domain, fields=[field],
                                                                  groupby=[group_by], lazy=False)
                    res_data = []
                    labels = []
                    for res in results:
                        value = res.get(field)
                        if value is False or value is None:
                            value = 0
                        res_data.append(value)
                        if rec.group_field_type == 'selection':
                            labels.append(dict_selection[res[group_by]])
                        elif rec.group_field_type == 'many2one':
                            labels.append(str(res[group_by][1]) if res[group_by] else 'Nothing')
                        elif rec.group_field_type in ['date', 'datetime', 'boolean', 'char']:
                            labels.append(res[group_by])

                    datasets = [{
                        'label': rec.field_id.field_description,
                        'backgroundColor': rec.color2,
                        'borderColor': rec.color,
                        'fill': False,
                        'data': res_data,
                    }]

                else:
                    datasets, labels = rec._sample_data_chart()

                to_render.update({
                    'data': datasets,
                    'labels': labels,
                })
            rec.dashboard_data = json.dumps(to_render)

    # sample static chart datasets
    def _sample_data_chart(self):
        data = [{
            'label': self.field_id.field_description or 'No Field',
            'backgroundColor': self.color2,
            'borderColor': self.color,
            'fill': False,
            'data': ['1,000', '20,000', '30,000', '40,000', '100,000', '50,000', '150,000'],
        }]
        labels = ['January', 'February', 'March', 'April', 'May', 'June', 'July']
        return data, labels
