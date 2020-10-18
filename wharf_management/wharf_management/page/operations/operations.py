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
def get_loading_discharged():
    items = []

    items = frappe.db.sql("""SELECT name, status, booking_ref, container_no, cantainer_size, cargo_type, chasis_no, mark, work_type, secondary_work_type
        FROM `tabPre Advise`""" , as_dict=True)
    return items

#    yardlist = frappe.db.sql("""SELECT `tabYard Settings`.yard_section FROM `tabYard Settings` """, as_dict=True)

@frappe.whitelist()
def get_inspection_items():

    inspection_items = frappe.db.sql("""SELECT name, status, container_no, container_size, cargo_type, chasis_no, mark
        FROM `tabCargo` WHERE status = 'Inspection' """ , as_dict=True)
    return inspection_items


@frappe.whitelist()
def update_cargo(status, cargo_ref, new_yard, drop_cargo_ref, yard_id):

    if status == "Inspection":
        frappe.db.set_value("Cargo", cargo_ref, "yard_slot", new_yard)
        frappe.db.sql("""UPDATE `tabCargo` SET status='Yard', yard_status='Closed', yard_date=%s WHERE name=%s""", (frappe.utils.datetime.datetime.now(), cargo_ref))
    
    if yard_id != "Inspection":
        frappe.db.set_value("Cargo", drop_cargo_ref, "yard_slot", new_yard)
    
    frappe.db.set_value("Yard Settings", new_yard, "occupy", 1);