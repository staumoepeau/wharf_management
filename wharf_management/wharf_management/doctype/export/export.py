# -*- coding: utf-8 -*-
# Copyright (c) 2017, Sione Taumoepeau and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document
import datetime

class Export(Document):

	def validate(self):
		self.validate_status()
	
	def on_submit(self):
		if self.paid_status == "Paid":
			self.create_sales_invoices_paid()
	

	def validate_status(self):
		if self.paid_status == "Paid" and not self.container_content:
			frappe.throw(_("Please make sure that Container Content is FULL or EMPTY"))


	def create_sales_invoices_paid(self):

		item = frappe.db.get_value("Wharfage Fee", {"cargo_type" : self.cargo_type, "container_size" : self.container_size}, "item_name")
		dc = frappe.db.get_value("Item", item, ["description", "standard_rate"], as_dict=True)

		doc = frappe.new_doc("Sales Invoice")
		doc.customer = self.customer
		doc.due_date = self.posting_date
		doc.export_ref = self.name
		doc.is_pos = True
		doc.status = "Paid"

		doc.paid_amount = self.total_fee
		doc.base_paid_amount = self.total_fee
		doc.outstanding_amount = 0
		payments = doc.append('payments', {
		'mode_of_payment': self.payment_method,
		'amount' : self.total_fee
		})

		item = doc.append('items', {
		'item_code' : item,
		'item_name' : item,
		'description' : dc.description,
		'rate' : dc.standard_rate,
		'qty' : 1
		})

		if self.apply_vgm_fee:
			item = doc.append('items', {
			'item_code' : "VGM",
			'item_name' : "VGM",
			'description' : "VGM Fee",
			'rate' : self.vgm_fee,
			'qty' : 1
			})
			
		doc.save(ignore_permissions=True)
		doc.submit()
