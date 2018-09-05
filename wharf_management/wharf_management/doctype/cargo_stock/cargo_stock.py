# -*- coding: utf-8 -*-
# Copyright (c) 2018, Sione Taumoepeau and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document

class CargoStock(Document):
	

	def on_submit(self):
		self.update_status()
	

	def validate(self):
		self.update_cargo_stock_ref()

	
	def update_cargo_stock_ref(self):
		if not self.cargo_stock_ref:
    			self.cargo_stock_ref = self.get_ref()
	

	def get_ref(self):
		return self.name


	def update_status(self):
		frappe.db.sql("""Update `tabCargo Stock` set status="Stock Completed" where container_no=%s""", (self.cargo_stock_ref))