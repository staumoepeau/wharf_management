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
def get_all_items():
    items = []

    items = frappe.db.sql("""SELECT DISTINCT `tabVehicle Yard Settings`.name, `tabCargo`.status, `tabCargo`.container_content,`tabVehicle Yard Settings`.vehicle_yard_slot, `tabVehicle Yard Settings`.vehicle_yard_section, `tabCargo`.cargo_type,
        `tabVehicle Yard Settings`.vehicle_yard_sub_section, `tabCargo`.name as cargo_ref, `tabCargo`.container_no, `tabCargo`.container_size, `tabCargo`.hazardous, `tabCargo`.chasis_no, `tabCargo`.cargo_condition
        FROM `tabVehicle Yard Settings` 
        LEFT JOIN `tabCargo` ON `tabVehicle Yard Settings`.vehicle_yard_slot = `tabCargo`.yard_slot AND `tabCargo`.cargo_type in ("Vehicles","Heavy Vehicles")
        ORDER BY `tabVehicle Yard Settings`.vehicle_yard_slot DESC""", as_dict=True)
    return items

@frappe.whitelist()
def get_chasis(chasis_no):
    items = []

    items = frappe.db.sql("""SELECT DISTINCT `tabYard Settings`.name, `tabCargo`.status, `tabCargo`.container_content,`tabVehicle Yard Settings`.vehicle_yard_slot, `tabVehicle Yard Settings`.vehicle_yard_section, `tabCargo`.cargo_type,
        `tabVehicle Yard Settings`.vehicle_yard_sub_section, `tabCargo`.name as cargo_ref, `tabCargo`.container_no, `tabCargo`.container_size, `tabCargo`.hazardous, `tabCargo`.chasis_no, `tabCargo`.cargo_condition
        FROM `tabVehicle Yard Settings` 
        LEFT JOIN `tabCargo` ON `tabVehicle Yard Settings`.vehicle_yard_slot = `tabCargo`.yard_slot AND `tabCargo`.cargo_type in ("Vehicles","Heavy Vehicles") AND `tabCargo`.chasis_no=%s 
        ORDER BY `tabVehicle Yard Settings`.vehicle_yard_slot DESC""",(chasis_no), as_dict=True)
    return items


@frappe.whitelist()
def get_bay(bay):
    items = []

    items = frappe.db.sql("""SELECT DISTINCT `tabYard Settings`.name, `tabCargo`.status, `tabCargo`.container_content,`tabVehicle Yard Settings`.vehicle_yard_slot, `tabVehicle Yard Settings`.vehicle_yard_section, `tabCargo`.cargo_type,
        `tabVehicle Yard Settings`.vehicle_yard_sub_section, `tabCargo`.name as cargo_ref, `tabCargo`.container_no, `tabCargo`.container_size, `tabCargo`.hazardous, `tabCargo`.chasis_no, `tabCargo`.cargo_condition
        FROM `tabVehicle Yard Settings` 
        LEFT JOIN `tabCargo` ON `tabVehicle Yard Settings`.vehicle_yard_slot = `tabCargo`.yard_slot AND `tabCargo`.cargo_type in ("Vehicles","Heavy Vehicles") WHERE `tabVehicle Yard Settings`.vehicle_yard_section=%s 
        ORDER BY `tabVehicle Yard Settings`.vehicle_yard_slot DESC""",(bay), as_dict=True)
    return items


#    yardlist = frappe.db.sql("""SELECT `tabYard Settings`.yard_section FROM `tabYard Settings` """, as_dict=True)

@frappe.whitelist()
def get_inspection_items():

    inspection_items = frappe.db.sql("""SELECT name, status, container_no, container_size, cargo_type, chasis_no, mark, container_content, cargo_condition
        FROM `tabCargo` WHERE status = 'Inspection' AND `tabCargo`.cargo_type in ("Vehicles","Heavy Vehicles")""" , as_dict=True)
    return inspection_items




@frappe.whitelist()
def update_cargo(status, cargo_ref, new_yard, drop_cargo_ref, yard_id):

    if status == "Inspection":
        frappe.db.set_value("Cargo", cargo_ref, "yard_slot", new_yard)
        frappe.db.sql("""UPDATE `tabCargo` SET status='Yard', yard_status='Closed', yard_date=%s WHERE name=%s""", (frappe.utils.datetime.datetime.now(), cargo_ref))
    
    if yard_id != "Inspection":
        frappe.db.set_value("Cargo", drop_cargo_ref, "yard_slot", new_yard)
    
    frappe.db.set_value("Yard Settings", new_yard, "occupy", 1);