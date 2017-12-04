# -*- coding: utf-8 -*-
# Copyright (c) 2017, Sione Taumoepeau and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document

class WarehouseYard(Document):
	
	def on_submit(self):
		self.update_yard_status()

	

	def update_yard_status(self):
		self.status = "Closed"
		frappe.db.sql("""Update `tabCargo Warehouse` set yard_status="Closed", status="Yard", yard_slot=%s where name=%s""", (self.yard_slot, self.cargo_warehouse_ref))
	


