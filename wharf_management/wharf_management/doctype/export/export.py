# -*- coding: utf-8 -*-
# Copyright (c) 2017, Sione Taumoepeau and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document
import datetime

class Export(Document):
	
	def on_submit(self):
		self.create_sales_invoices_paid()

	def create_sales_invoices_paid(self):

		doc = frappe.new_doc("Sales Invoice")
		doc.customer = self.customer
		doc.due_date = datetime.date.today()
#		doc.pms_ref = self.name
		doc.is_pos = True
		doc.status = "Paid"

		doc.paid_amount = self.total_amount
		doc.base_paid_amount = self.total_amount
		doc.outstanding_amount = 0
		payments = doc.append('payments', {
		'mode_of_payment': self.payment_method,
		'amount' : self.total_amount
		})

		item = doc.append('items', {
		'item_code' : d.item,
		'item_name' : d.item,
		'description' : d.description,
		'rate' : d.price,
		'qty' : d.qty
		})
		
		doc.save(ignore_permissions=True)
		doc.save()
		doc.submit()
