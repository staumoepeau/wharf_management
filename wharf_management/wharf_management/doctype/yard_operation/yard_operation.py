# -*- coding: utf-8 -*-
# Copyright (c) 2017, Caitlah Technology and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document

class YardOperation(Document):

	def submit(self):
		self.update_docstatus()
		self.update_yard_slot()
		
	
	def update_docstatus(self):
			frappe.db.sql("""Update `tabYard Operation` set docstatus=1 where name=%s""", self.container_no)
	
	def update_yard_slot(self):
			frappe.db.sql("""Update `tabCargo Operation` set yard_slot=%s, container_arrival_date=%s, status='Yard' where name=%s""", (self.yard_slot,self.container_arrival_date, self.container_no))