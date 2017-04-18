# -*- coding: utf-8 -*-
# Copyright (c) 2017, Caitlah Technology and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe import throw, _
from frappe.model.document import Document

class WharfPaymentFee(Document):
	
	def on_submit(self):
		self.update_payment_status()
	
	
	def update_payment_status(self):
		frappe.db.sql("""Update `tabCargo Operation` set payment_status="Closed", status='Paid' where name=%s""", (self.container_no))