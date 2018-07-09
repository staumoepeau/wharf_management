# -*- coding: utf-8 -*-
# Copyright (c) 2017, Sione Taumoepeau and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe, os, json
from frappe import throw, _
from frappe.model.document import Document
import datetime

class Export(Document):

	def validate(self):
		self.validate_status()
		self.check_cargo_type()
	
	def on_submit(self):
		if self.paid_status == "Paid":
			self.create_sales_invoices_paid()
	

	def validate_status(self):
		if self.paid_status == "Paid" and not self.container_content:
			frappe.throw(_("Please make sure that Container Content is FULL or EMPTY"))
	
	def check_cargo_type(self):
		if self.cargo_type not in ["Tank Tainers", "Container", "Flatrack"]:
			if not self.volume:
				frappe.throw(_("Please make sure to input the Volume Value"))
			if not self.weight:
				frappe.throw(_("Please make sure to input the Weight Value"))
				
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


	def insert_fees(self):
		vgm_fee=0

		if self.apply_wharfage_fee == 1:
			if self.cargo_type in ["Tank Tainers", "Container", "Flatrack"]:
				qty = 1
				item_name = frappe.db.get_value("Wharfage Fee", {"cargo_type" : self.cargo_type, "container_size" : self.container_size}, "item_name")
				val = frappe.db.get_value("Item", item_name, ["description", "standard_rate"], as_dict=True)

			if self.cargo_type not in ["Tank Tainers", "Container", "Flatrack"]:
				qty = self.volume
				item_name = frappe.db.get_value("Wharfage Fee", {"cargo_type" : self.cargo_type}, "item_name")
				val = frappe.db.get_value("Item", item_name, ["description", "standard_rate"], as_dict=True)
				
			self.append("fees_table", { 
				"item": item_name,
				"description": val.description,
				"price": val.standard_rate,
				"qty": qty,
				"total" : (qty * val.standard_rate)
			})
		
		if self.apply_vgm_fee == 1:
			
			if self.cargo_type in ["Tank Tainers", "Container", "Flatrack"]:
				if self.container_size == "20":
					vgm_fee = 77.05
				if self.container_size == "40":
					vgm_fee = (77.05 * 2)
			if self.cargo_type not in ["Tank Tainers", "Container", "Flatrack"]:
				vgm_fee = 0
			
			self.append('fees_table', {
			'item' : "VGM",
			'item_name' : "VGM",
			'description' : "VGM Fee",
			'price' : vgm_fee,
			'qty' : 1,
			'total' : (1 * vgm_fee)
			})

		self.total_fee = ((qty * val.standard_rate) + (1 * vgm_fee))