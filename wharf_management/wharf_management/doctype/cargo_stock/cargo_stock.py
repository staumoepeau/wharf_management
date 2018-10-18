# -*- coding: utf-8 -*-
# Copyright (c) 2018, Sione Taumoepeau and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document

class CargoStock(Document):
	

	def on_submit(self):
		self.update_status()
		self.check_export()
		self.check_cargo_loading()
		self.check_cargo_discharged()
	

	def validate(self):
		self.update_cargo_title()

	
	def update_cargo_title(self):
		if not self.title:
    			self.title = self.get_title()
	

	def get_title(self):
		return self.name


	def update_status(self):
		frappe.db.sql("""Update `tabCargo Stock` set status="Stock Completed" where name=%s""", (self.title))
	

	def check_export(self):
		cargo_exist=None

		if self.cargo_type in ["Container", "Tank Tainer", "Flatrack"]:
			cargo_exist = frappe.db.sql("""Select name from `tabExport` where container_no=%s""", (self.container_no))

		if self.cargo_type in ["Loose Cargo", "Break Bulk"]:
			cargo_exist  = frappe.db.sql("""Select name from `tabExport` where mark=%s""", (self.mark))
		
		if self.cargo_type in ["Vehicles", "Heavy Vehicles"]:
			cargo_exist  = frappe.db.sql("""Select name from `tabExport` where chasis_no=%s""", (self.chasis_no))

		if cargo_exist:
			frappe.db.sql("""Update `tabCargo Stock` set in_stock=1 where name=%s""", (self.title))
	

	def check_cargo_loading(self):
		cargo_exist=None

		if self.cargo_type in ["Container", "Tank Tainer", "Flatrack"]:
			cargo_exist = frappe.db.sql("""Select name from `tabCargo` where docstatus = "1" and status="Outbound" and manifest_check != "Confirm" and work_type="Loading" and container_no=%s""", (self.container_no))
			
		if self.cargo_type in ["Loose Cargo", "Break Bulk"]:
			cargo_exist  = frappe.db.sql("""Select name from `tabCargo` where docstatus = "1" and status="Outbound" and manifest_check != "Confirm" and work_type="Loading" and mark=%s""", (self.mark))
		
		if self.cargo_type in ["Vehicles", "Heavy Vehicles"]:
			cargo_exist = frappe.db.sql("""Select name from `tabCargo` where docstatus = "1" and status="Outbound" and manifest_check != "Confirm" and work_type="Loading" and chasis_no=%s""", (self.chasis_no))

		if cargo_exist:
			frappe.db.sql("""Update `tabCargo Stock` set loading_error=1 where name=%s""", (self.title))
	

	def check_cargo_discharged(self):
		cargo_exist=None
		if self.cargo_type in ["Container", "Tank Tainer", "Flatrack"]:
			cargo_exist = frappe.db.sql("""Select name from `tabCargo` where docstatus = "1" and manifest_check != "Confirm" and payment_status = "Open" and work_type="Discharged" and container_no=%s""", (self.container_no))
			
		if self.cargo_type in ["Loose Cargo", "Break Bulk"]:
			cargo_exist = frappe.db.sql("""Select name from `tabCargo` where docstatus = "1" and manifest_check != "Confirm" and payment_status = "Open" and work_type="Discharged" and mark=%s""", (self.mark))
		
		if self.cargo_type in ["Vehicles", "Heavy Vehicles"]:
			cargo_exist = frappe.db.sql("""Select name from `tabCargo` where docstatus = "1" and manifest_check != "Confirm" and payment_status = "Open" and work_type="Discharged" and chasis_no=%s""", (self.chasis_no))

		if not cargo_exist:
			frappe.db.sql("""Update `tabCargo Stock` set discharged_error=1 where name=%s""", (self.title))