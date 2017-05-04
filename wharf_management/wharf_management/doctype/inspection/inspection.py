# -*- coding: utf-8 -*-
# Copyright (c) 2017, Caitlah Technology and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document

class Inspection(Document):

	def on_submit(self):
		self.update_inspection_status()

	def update_inspection_status(self):
		frappe.db.sql("""Update `tabCargo` set inspection_status="Closed", status='Inspection' where name=%s""", (self.container_no))

	pass
