from __future__ import unicode_literals
import frappe
from frappe.utils import now
from frappe import _

no_cache = 1
no_sitemap = 1

def get_context(context):

#    cargo = frappe.db.sql("select name, container_no, container_size, status, yard_slot from `tabCargo` where docstatus = 1 and cargo_type ='Container' and status in ('Yard','Paid') order by yard_slot", as_dict=True)
#    for d in cargo:
#        frappe.db.sql(""" Update `tabYard Settings` set cargo_ref=%s, container_no=%s, status=%s, container_size=%s, yard_slot=%s where yard_slot=%s""",(d.name, d.container_no, d.status, d.container_size, d.yard_slot, d.yard_slot))
#    context.items = frappe.db.sql("select name, cargo_ref, container_no, container_size, status, yard_slot, yard_section from `tabYard Settings`", as_dict=True)

    context.schedule = frappe.db.sql("SELECT name, vessel, voyage_no, vessel_type, agents, eta_date, etd_date, status FROM `tabBooking Request` WHERE DATE(eta_date) > '2019-01-11' ORDER BY etd_date DESC", as_dict=True)

