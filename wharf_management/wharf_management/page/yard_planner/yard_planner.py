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

  cargo = frappe.db.sql("select name, container_no, container_size, status, yard_slot from `tabCargo` where docstatus = 1 and cargo_type ='Container' and status in ('Yard','Paid') order by yard_slot", as_dict=True)

  for d in cargo:
      frappe.db.sql(""" Update `tabYard Settings` set cargo_ref=%s, container_no=%s, status=%s, container_size=%s where yard_slot=%s""",(d.name, d.container_no, d.status, d.container_size, d.yard_slot))

  
  items = frappe.db.sql("select name, cargo_ref, container_no, container_size, status, yard_slot, yard_section from `tabYard Settings`", as_dict=True)
  return items