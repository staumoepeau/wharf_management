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

	def validate(self):
		self.validate_warrant_no()


	def validate_warrant_no(self):
		if self.custom_code != self.warrant_no:
			msgprint(_("Please Make sure that is the correct WARRANT NO"), raise_exception=1)
	

	def update_status(self):
		frappe.db.sql("""Update `tabCargo Warehouse` set yard_slot = "", status='Delivered' where name=%s""", (self.cargo_warehouse_ref))

		if not self.status:
			self.status == "Delivered"