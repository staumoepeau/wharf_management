# -*- coding: utf-8 -*-
# Copyright (c) 2017, Sione Taumoepeau and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document

class WarehouseCustomCheck(Document):
	
	def on_submit(self):
		self.update_custom_check_status()

	
	def update_custom_check_status(self):
		self.status = "Closed"
		frappe.db.sql("""Update `tabCargo Warehouse` set custom_check_status="Closed", status="Custom Check" where name=%s""", (self.cargo_warehouse_ref))
	

