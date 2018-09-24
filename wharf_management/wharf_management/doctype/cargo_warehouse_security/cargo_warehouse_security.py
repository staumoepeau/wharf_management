# -*- coding: utf-8 -*-
# Copyright (c) 2018, Sione Taumoepeau and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
from frappe.utils import add_days, cint, cstr, flt, getdate, rounded, date_diff, money_in_words
import frappe
from frappe import _, msgprint, throw
from frappe.model.document import Document

class CargoWarehouseSecurity(Document):
	
	
	def on_submit(self):
		self.update_status()
		self.update_cargo_warehouse_movement()
		self.update_cargo_table()

	def validate(self):
		self.validate_warrant_no()
		self.validate_qty()


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
	
	def validate_qty(self):
		if not self.security_item_count:
			if self.count_items > self.qty:
				msgprint(_("Items count is over the QTY"), raise_exception=1)
		elif self.security_item_count > 0:
			if ((self.security_item_count + self.count_items) > self.qty):
				msgprint(_("Items count is over the QTY"), raise_exception=1)

	def update_cargo_table(self):
		if not self.security_item_count:
			self.security_item_count == 0
		items = flt(self.security_item_count + self.count_items)
		frappe.db.sql("""Update `tabCargo Warehouse` set security_item_count=%s where name=%s""", (items, self.cargo_warehouse_ref))
				