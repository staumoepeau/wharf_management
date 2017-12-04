# -*- coding: utf-8 -*-
# Copyright (c) 2017, Sione Taumoepeau and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document

class WarehouseInspection(Document):
	
	def on_submit(self):
		self.update_inspection_status()

	

	def update_inspection_status(self):
		self.status = "Closed"
		frappe.db.sql("""Update `tabCargo Warehouse` set inspection_status="Closed", status="Inspection", inspection_image=%s, inspection_comment=%s where name=%s""", (self.inspection_image, self.inspection_comment, self.cargo_warehouse_ref))
	

