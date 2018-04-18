# -*- coding: utf-8 -*-
# -*- coding: utf-8 -*-
# Copyright (c) 2017, Caitlah Technology and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe, json
import frappe.defaults
from frappe.model.document import Document
from frappe.utils import cstr, flt, fmt_money, formatdate
from frappe import msgprint, _, scrub

class Gate2(Document):
	
	def on_submit(self):
		self.update_gate2_status()
#		self.update_export_status()
		self.update_cargo_movement()
	
	def update_gate2_status(self):
   			frappe.db.sql("""Update `tabCargo` set gate1_status='Closed', gate2_status='Closed', yard_slot=NULL, status='Gate Out' where name=%s""", (self.cargo_ref))
	
#	def update_yard(self):
#			frappe.db.sql("""Delete `tabCargo` where name=%s""", (self.cargo_ref))
			
#	def update_export_status(self):		
#			if self.status == 'Export':
#   				frappe.db.sql("""Update `tabCargo` set export_status="Main Gate", gate1_status="Open", gate2_status="Open", payment_status="Open", yard_status="Open", inspection_status="Open" where name=%s""", (self.cargo_ref))
	
	def update_cargo_movement(self):

		val = frappe.db.get_value("Cargo", {"name": self.cargo_ref}, ["pat_code","cargo_type","container_no","custom_code"], as_dict=True)

		vals = frappe.db.get_value("Cargo Movement", {"container_no": self.container_no}, ["refrence"], as_dict=True)
		
		if self.custom_code == "MTY" or self.custom_code == "DLWS" or self.custom_code == "DDLW":
			gate_content = "EMPTY"
		elif self.custom_code != "MTY" or self.custom_code != "DLWS" or self.custom_code != "DDLW":
			gate_content = "FULL"

		if not vals.refrence:
			frappe.db.sql("""Update `tabCargo Movement` set main_gate_status='OUT', main_gate_content=%s, main_gate_date=%s, main_gate_time=%s where container_no=%s""", (gate_content, self.modified, self.modified, self.container_no))
		
		if vals.refrence:
			frappe.db.sql("""Update `tabCargo Movement` set main_gate_status='OUT', main_gate_content=%s, main_gate_date=%s, main_gate_time=%s where refrence=%s""", (gate_content, self.modified, self.modified, self.cargo_ref))