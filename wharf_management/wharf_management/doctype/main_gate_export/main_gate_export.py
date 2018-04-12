# -*- coding: utf-8 -*-
# Copyright (c) 2017, Sione Taumoepeau and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document

class MainGateExport(Document):

	def on_submit(self):
		self.update_export_status()
		self.update_cargo_movement()
			
	def update_export_status(self):		
			frappe.db.sql("""Update `tabExport` set main_gate_start=%s, main_gate_ends=%s, status="Main Gate" where container_no=%s""", (self.creation, self.modified, self.container_no))
    				

	def update_cargo_movement(self):

		val = frappe.db.get_value("Export", {"container_no": self.container_no}, ["name","cargo_type","container_no","agents","container_type","container_size","container_content","cargo_description"], as_dict=True)
		if not val.cargo_type:
			if val.container_content == "EMPTY" or val.container_content == "FULL":
				val.cargo_type == "Container"

		doc = frappe.new_doc("Cargo Movement")
		doc.update({
					"docstatus" : 1,
					"cargo_type" : val.cargo_type,
					"container_no" : val.container_no,
					"agents" : val.agents,
					"container_type" : val.container_type,
					"container_size" : val.container_size,
					"consignee" : val.consignee,
					"main_gate_content" : val.container_content,
					"cargo_description" : val.cargo_description,
					"main_gate_status" : "IN",
					"main_gate_date" : self.modified,
					"main_gate_time" : self.modified,
					"truck" : self.truck_licenses_plate,
					"truck_driver" : self.drivers_information,
					"refrence": val.name
				})
		doc.insert()
		doc.submit()