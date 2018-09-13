# -*- coding: utf-8 -*-
# Copyright (c) 2017, Sione Taumoepeau and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document

class CargoWarehouse(Document):
	
	def on_submit(self):
		self.validate_status()

	
	def validate_status(self):
		if not self.status:
			self.status = "Booked"
		if not self.inspection_status:
			self.inspection_status = "Open"