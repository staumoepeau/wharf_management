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
from wharf_management.wharf_management.utils import get_create_cargo

class Gate2(Document):
	
	def on_submit(self):

		if self.mydoctype == "CARGO":
			self.update_gate2_status()
			self.update_cargo_movement()
		if self.mydoctype == "EMPTY CONTAINERS":
			self.update_empty_containers_movement()

	
	def update_gate2_status(self):
		frappe.db.sql("""Update `tabCargo` set gate1_status='Closed', gate2_status='Closed', yard_slot=NULL, status='Gate Out' where name=%s""", (self.cargo_ref))
	
#	def update_yard(self):
#			frappe.db.sql("""Delete `tabCargo` where name=%s""", (self.cargo_ref))
			
	def update_empty_containers_movement(self):		
		frappe.db.sql("""UPDATE `tabCargo Movement` 
		SET main_gate_status='OUT', main_gate_content="EMPTY", 
		main_gate_date=%s, main_gate_time=%s, truck=%s, truck_driver=%s 
		WHERE refrence=%s""", (self.modified, self.modified, self.truck_licenses_plate, self.drivers_information, self.cargo_ref))

		frappe.db.sql("""UPDATE `tabEmpty Containers` SET gate1_date=%s, status='OUT' WHERE name=%s""", (self.modified, self.cargo_ref))


	def update_cargo_movement(self):

#		val = frappe.db.get_value("Cargo", {"name": self.cargo_ref}, ["pat_code","cargo_type","container_no","custom_code"], as_dict=True)

		if self.custom_code == "MTY" or self.custom_code == "DLWS" or self.custom_code == "DDLW":
			gate_content = "EMPTY"
		elif self.custom_code != "MTY" or self.custom_code != "DLWS" or self.custom_code != "DDLW":
			gate_content = "FULL"
		
		if self.cargo_type in ["Container", "Tank Tainer", "Split Ports", "Tanker"]:
			vals = frappe.db.get_value("Cargo Movement", {"container_no": self.container_no, "cargo_ref": self.cargo_ref}, ["refrence"], as_dict=True)
			val = frappe.db.get_value("Cargo", {"container_no": self.container_no, "cargo_ref": self.cargo_ref}, ["last_port"], as_dict=True)

			if not vals.refrence:
				frappe.db.sql("""UPDATE `tabCargo Movement` 
				SET main_gate_status='OUT', main_gate_content=%s, main_gate_date=%s, main_gate_time=%s, 
				truck=%s, truck_driver=%s WHERE container_no=%s""", 
				(gate_content, self.modified, self.modified, self.truck_licenses_plate, self.drivers_information, self.container_no))
		
			if vals.refrence:
				frappe.db.sql("""UPDATE `tabCargo Movement` 
				SET main_gate_status='OUT', main_gate_content=%s, main_gate_date=%s, main_gate_time=%s, 
				truck=%s, truck_driver=%s WHERE refrence=%s""", 
				(gate_content, self.modified, self.modified, self.truck_licenses_plate, self.drivers_information, self.cargo_ref))
			
			if self.cargo_type == "Split Ports" and val.last_port == "YES":
    				get_create_cargo(self.cargo_ref, "Loading", " ", self.cargo_type)
		
		if self.cargo_type not in ["Container", "Tank Tainer", "Split Ports", "Tanker"]:
			frappe.db.sql("""UPDATE `tabCargo Movement` 
			SET main_gate_status='OUT', main_gate_content=%s, main_gate_date=%s, 
			main_gate_time=%s, truck=%s, truck_driver=%s WHERE refrence=%s""", 
			(gate_content, self.modified, self.modified, self.truck_licenses_plate, self.drivers_information, self.cargo_ref))
		