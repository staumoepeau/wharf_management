# -*- coding: utf-8 -*-
# Copyright (c) 2020, Sione Taumoepeau and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document

class AccessControlUser(Document):

	def autoname(self):
		if not self.full_name:
			self.set_employee_name()
#			self.name = self.full_name

		
	def validate(self):
		self.set_employee_name()

	def set_employee_name(self):
		self.full_name = ' '.join(filter(lambda x: x, [self.first_name, self.middle_name, self.last_name]))
