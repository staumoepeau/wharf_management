'''
Copyright (C) 2019  Sione Taumoepeau
<https://www.gnu.org/licenses/>.
'''

from __future__ import unicode_literals
import frappe
from frappe import msgprint, _, scrub
from frappe.utils import now, getdate,today
import json
from jinja2 import Environment, FunctionLoader

#def get_context(context):
#    context.show_search = True

@frappe.whitelist()
def get_items():
    items = []

    items = frappe.db.sql("""SELECT DISTINCT `tabYard Settings`.name, `tabCargo`.status, `tabCargo`.container_content,`tabYard Settings`.yard_slot, `tabYard Settings`.yard_section, `tabCargo`.cargo_type,
        `tabYard Settings`.yard_sub_section, `tabCargo`.name as cargo_ref, `tabCargo`.container_no, `tabCargo`.container_size, `tabCargo`.hazardous, `tabCargo`.chasis_no, `tabCargo`.cargo_condition
        FROM `tabYard Settings` 
        LEFT JOIN `tabCargo` ON `tabYard Settings`.yard_slot = `tabCargo`.yard_slot AND `tabCargo`.cargo_type in ("Vehicles","Heavy Vehicles")
        ORDER BY `tabYard Settings`.yard_slot DESC""", as_dict=True)
    return items

#    yardlist = frappe.db.sql("""SELECT `tabYard Settings`.yard_section FROM `tabYard Settings` """, as_dict=True)

@frappe.whitelist()
def get_inspection_items():

    inspection_items = frappe.db.sql("""SELECT name, status, container_no, container_size, cargo_type, chasis_no, mark, container_content, cargo_condition
        FROM `tabCargo` WHERE status = 'Inspection' AND `tabCargo`.cargo_type in ("Vehicles","Heavy Vehicles")""" , as_dict=True)
    return inspection_items



@frappe.whitelist()
def get_express_items():

    express_items = frappe.db.sql("""SELECT DISTINCT `tabYard Settings`.name, `tabCargo`.status, `tabCargo`.container_content,`tabYard Settings`.yard_slot, `tabYard Settings`.yard_section, `tabCargo`.cargo_type,
        `tabYard Settings`.yard_sub_section, `tabCargo`.name as cargo_ref, `tabCargo`.container_no, `tabCargo`.container_size, `tabCargo`.hazardous, `tabCargo`.chasis_no, `tabCargo`.cargo_condition
        FROM `tabYard Settings` 
        LEFT JOIN `tabCargo` ON `tabYard Settings`.yard_slot = `tabCargo`.yard_slot
        ORDER BY `tabYard Settings`.yard_slot AND `tabCargo`.cargo_type in ("Vehicles","Heavy Vehicles")""" , as_dict=True)
    return express_items


@frappe.whitelist()
def update_yard(ref):
    
#    yard = frappe.db.get_value("Cargo", {"name": ref}, ["yard_slot"])
    
    frappe.db.sql("""UPDATE `tabYard Settings` SET occupy=0 WHERE yard_slot=%s""", (ref))

#    msgprint(_("Old Yard Slot").format(ref),
#                    raise_exception=1)

@frappe.whitelist()
def update_cargo(status, cargo_ref, new_yard, drop_cargo_ref, yard_id):

    if status == "Inspection":
        frappe.db.set_value("Cargo", cargo_ref, "yard_slot", new_yard)
        frappe.db.sql("""UPDATE `tabCargo` SET status='Yard', yard_status='Closed', yard_date=%s WHERE name=%s""", (frappe.utils.datetime.datetime.now(), cargo_ref))
    
    if yard_id != "Inspection":
        frappe.db.set_value("Cargo", drop_cargo_ref, "yard_slot", new_yard)
    
    frappe.db.set_value("Yard Settings", new_yard, "occupy", 1);