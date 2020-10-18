'''
Copyright (C) 2019  Sione Taumoepeau
<https://www.gnu.org/licenses/>.
'''

from __future__ import unicode_literals
import frappe
from frappe import msgprint, _, scrub
from frappe.utils import now
import json
from jinja2 import Environment, FunctionLoader

#def get_context(context):
#    context.show_search = True

@frappe.whitelist()
def get_items():
    items = []

    items = frappe.db.sql("""SELECT DISTINCT `tabYard Settings`.name, `tabCargo`.status, `tabYard Settings`.yard_slot, `tabYard Settings`.yard_section, 
        `tabYard Settings`.yard_sub_section, `tabCargo`.name as cargo_ref, `tabCargo`.container_no, `tabCargo`.container_size, `tabCargo`.hazardous
        FROM `tabYard Settings` 
        LEFT JOIN `tabCargo` ON `tabYard Settings`.yard_slot = `tabCargo`.yard_slot
        ORDER BY `tabYard Settings`.yard_slot""" , as_dict=True)
    return items

#    yardlist = frappe.db.sql("""SELECT `tabYard Settings`.yard_section FROM `tabYard Settings` """, as_dict=True)

@frappe.whitelist()
def update_yard(ref):
    
#    yard = frappe.db.get_value("Cargo", {"name": ref}, ["yard_slot"])
    
    frappe.db.sql("""UPDATE `tabYard Settings` SET occupy=0 WHERE yard_slot=%s""", (ref))

    msgprint(_("Old Yard Slot").format(ref),
                    raise_exception=1)
    