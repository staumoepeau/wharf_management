from __future__ import unicode_literals
import frappe
from frappe import _
import frappe.www.list

no_cache = 1
no_sitemap = 1

def get_context(context):
    
    context.items = frappe.db.sql("SELECT `tabYard Settings`.name, `tabCargo`.status, `tabYard Settings`.yard_slot, `tabYard Settings`.yard_section, `tabCargo`.name as cargo_ref, `tabCargo`.container_no, `tabCargo`.container_size FROM `tabYard Settings` LEFT JOIN `tabCargo` ON `tabYard Settings`.yard_slot = `tabCargo`.yard_slot ORDER BY `tabYard Settings`.yard_slot" , as_dict=True)
#    context.schedule = frappe.db.sql("SELECT name, vessel, voyage_no, vessel_type, agents, eta_date, etd_date, status FROM `tabBooking Request` ORDER BY etd_date ASC", as_dict=True)

