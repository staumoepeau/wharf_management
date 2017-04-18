# -*- coding: utf-8 -*-
# Copyright (c) 2015, Caitlah Technology and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document

class CargoOperation(Document):
	
	def validate(self):

		if not self.title:
			self.title = self.get_title()
						
		
	def get_title(self):
		if self.cargo_type in ("Container","Vehicles"):
			self.name = self.container_no
			return self.container_no
		if self.cargo_type not in ("Container","Vehicles"):
			return self.name