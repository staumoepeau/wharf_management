# -*- coding: utf-8 -*-
# Copyright (c) 2017, Sione Taumoepeau and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document

class MainGateExport(Document):

	def on_submit(self):
		self.update_export_status()
			
	def update_export_status(self):		
			frappe.db.sql("""Update `tabExport` set main_gate_start=%s, main_gate_ends=%s, status="Gate1" where container_no=%s""", (self.creation, self.modified, self.container_no))
    				

	
