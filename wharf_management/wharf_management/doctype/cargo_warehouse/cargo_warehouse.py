# -*- coding: utf-8 -*-
# Copyright (c) 2017, Sione Taumoepeau and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe import msgprint, _, scrub
from frappe.model.document import Document

class CargoWarehouse(Document):
	
	def validate(self):
		self.check_status()

	
	def check_status(self):
		if not self.status:
			self.status = self.get_status()
		if not self.inspection_status:
			self.inspection_status = self.get_inspection_status()
	

	def get_status(self):
		mystatus = "Booked"
		return mystatus
	
	def get_inspection_status(self):
		inspection_status = "Open"
		return inspection_status