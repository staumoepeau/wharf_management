# -*- coding: utf-8 -*-
# Copyright (c) 2017, Caitlah Technology and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe, json
from frappe.model.document import Document

class Cargo(Document):

	def on_submit(self):
		self.check_update()

	def check_update(self):
		if self.work_type == 'Discharged':
			self.status = "Unknown"
