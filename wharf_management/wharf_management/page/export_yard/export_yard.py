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

    items = frappe.db.sql("""SELECT DISTINCT `tabExport Yard Settings`.name, `tabExport`.status, `tabExport`.container_content,`tabExport Yard Settings`.yard_slot, `tabExport Yard Settings`.yard_section, 
    `tabExport`.cargo_type, `tabExport Yard Settings`.yard_sub_section, `tabExport`.name as cargo_ref, `tabExport`.container_no, `tabExport`.container_size, `tabExport`.hazardous, `tabExport`.chasis_no
        FROM `tabExport Yard Settings` 
        LEFT JOIN `tabExport` ON `tabExport Yard Settings`.yard_slot = `tabExport`.yard_slot
        ORDER BY `tabExport Yard Settings`.yard_slot""" , as_dict=True)
    return items

#    yardlist = frappe.db.sql("""SELECT `tabYard Settings`.yard_section FROM `tabYard Settings` """, as_dict=True)


@frappe.whitelist()
def get_export_items():

    export_items = frappe.db.sql("""SELECT name, status, container_no, container_size, cargo_type, chasis_no, mark, container_content
        FROM `tabExport` WHERE status in ('Paid','Gate1 IN')""" , as_dict=True)
    return export_items


@frappe.whitelist()
def update_yard(ref):
    
#    yard = frappe.db.get_value("Cargo", {"name": ref}, ["yard_slot"])
    
    frappe.db.sql("""UPDATE `tabYard Settings` SET occupy=0 WHERE yard_slot=%s""", (ref))

    msgprint(_("Old Yard Slot").format(ref),
                    raise_exception=1)

@frappe.whitelist()
def update_cargo(status, cargo_ref, new_yard, drop_cargo_ref, yard_id):

    if status == "Inspection":
        frappe.db.set_value("Cargo", cargo_ref, "yard_slot", new_yard)
        frappe.db.sql("""UPDATE `tabCargo` SET status='Yard', yard_status='Closed', yard_date=%s WHERE name=%s""", (frappe.utils.datetime.datetime.now(), cargo_ref))
    
    if yard_id != "Inspection":
        frappe.db.set_value("Cargo", drop_cargo_ref, "yard_slot", new_yard)
    
    frappe.db.set_value("Yard Settings", new_yard, "occupy", 1)