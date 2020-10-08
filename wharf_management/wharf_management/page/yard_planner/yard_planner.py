'''
Copyright (C) 2019  Sione Taumoepeau
<https://www.gnu.org/licenses/>.
'''

from __future__ import unicode_literals
import frappe
from frappe import _
from frappe.utils import now
import json
from jinja2 import Environment, FunctionLoader

#def get_context(context):
#    context.show_search = True

@frappe.whitelist()
def get_items():
    items = []

    items = frappe.db.sql("""SELECT `tabYard Settings`.name, `tabCargo`.status, `tabYard Settings`.yard_slot, `tabYard Settings`.yard_section, 
        `tabYard Settings`.yard_sub_section, `tabCargo`.name as cargo_ref, `tabCargo`.container_no, `tabCargo`.container_size, `tabCargo`.hazardous
        FROM `tabYard Settings` 
        LEFT JOIN `tabCargo` ON `tabYard Settings`.yard_slot = `tabCargo`.yard_slot
        ORDER BY `tabYard Settings`.yard_slot""" , as_dict=True)
    return items

#    yardlist = frappe.db.sql("""SELECT `tabYard Settings`.yard_section FROM `tabYard Settings` """, as_dict=True)

#    return yardlist