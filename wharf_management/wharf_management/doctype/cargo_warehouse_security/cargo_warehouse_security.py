# -*- coding: utf-8 -*-
# Copyright (c) 2018, Sione Taumoepeau and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe import _, msgprint, throw
from frappe.model.document import Document

class CargoWarehouseSecurity(Document):
	
	
	def on_submit(self):
		self.update_status()
		self.update_cargo_warehouse_movement()

	def validate(self):
		self.validate_warrant_no()


	def validate_warrant_no(self):
		if self.custom_code != self.warrant_no:
			msgprint(_("Wrong WARRANT NO!"), raise_exception=1)
	

	def update_status(self):
		frappe.db.sql("""Update `tabCargo Warehouse` set yard_slot = "", status='Delivered' where name=%s""", (self.cargo_warehouse_ref))

		if not self.status:
			self.status == "Delivered"

	def update_cargo_warehouse_movement(self):

		val = frappe.db.get_value("Cargo Warehouse", {"name": self.cargo_warehouse_ref}, ["cargo_type","agents", "chasis_no", "mark", 
		"qty", "consignee","cargo_description", "warrant_no","vehicle_licenses_plate","driver_information"], as_dict=True)

		doc = frappe.new_doc("Cargo Warehouse Movement")
		doc.update({
					"docstatus" : 1,
					"cargo_type" : val.cargo_type,
#					"work_type" : self.work_type,
					"agents" : val.agents,
					"consignee" : val.consignee,
					"cargo_description" : val.cargo_description,
					"gate_status" : "OUT",
					"movement_date" : self.modified,
					"gate1_time" : self.modified,
					"truck" : val.vehicle_licenses_plate,
					"truck_driver" : val.driver_information,
					"refrence": self.cargo_warehouse_ref,
					"chasis_no" : val.chasis_no,
					"mark" : val.mark,
					"qty" : val.qty,
					"warrant_number" : self.custom_code
				})
		doc.insert()
		doc.submit()