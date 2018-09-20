# -*- coding: utf-8 -*-
# Copyright (c) 2017, Caitlah Technology and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document
from frappe.utils import cstr, cint, flt, fmt_money, formatdate
from frappe import msgprint, _, scrub


class BulkPayment(Document):

#	def on_submit(self):
#		self.create_sales_invoices_paid()
	

    	
	def insert_containers(self):
    		container_list = frappe.db.sql("""select t1.name as cargo_refrence, t1.cargo_description, t1.container_type, t1.container_size, t1.container_no, t1.bol,
			 t1.cargo_type, t1.work_type, t1.chasis_no, t1.container_content, t1.status, t1.voyage_no, t1.booking_ref, t1.custom_warrant, t1.mark from `tabCargo` t1 where t1.bulk_payment='Yes' and t1.consignee = %s and bulk_payment_code= %s""",(self.consignee, self.payment_code), as_dict=1)

		entries = sorted(list(container_list))
		self.set('container_list', [])
#		msgprint(_(entries), raise_exception=1)
		for d in entries:
			row = self.append('bulk_cargo_table', {
				'container_no':d.container_no,
				'cargo_type':d.cargo_type,
				'work_type':d.work_type,
				'container_content':d.container_content,
				'status':d.status,
				'voyage_no':d.voyage_no,
				'bol':d.bol,
				'booking_ref':d.booking_ref,
				'cargo_refrence':d.cargo_refrence,
				'container_type':d.container_type,
				'container_size':d.container_size,
				'chasis_no':d.chasis_no,
				'cargo_description':d.cargo_description,
				'custom_warrant':d.custom_warrant,
				'mark':d.mark
		})

	def insert_empty_containers(self):
    		container_list = frappe.db.sql("""select t1.name as cargo_refrence, t1.container_type, t1.container_size, t1.container_no,
			 t1.cargo_type, t1.container_content, t1.status from `tabEmpty Containers` t1 where t1.bulk_payment='Yes' and t1.status="Paid" and t1.consignee = %s""",(self.consignee), as_dict=1)

		entries = sorted(list(container_list))
		self.set('container_list', [])
#		msgprint(_(entries), raise_exception=1)
		for d in entries:
			row = self.append('bulk_cargo_table', {
				'container_no':d.container_no,
				'cargo_type':d.cargo_type,
				'container_content':d.container_content,
				'status':d.status,
#				'booking_ref':d.booking_ref,
				'cargo_refrence':d.cargo_refrence,
				'container_type':d.container_type,
				'container_size':d.container_size
		})

	def insert_bulk_fees(self):
    		
    		fees_list = frappe.db.sql("""select docB.item, docB.price, Sum(docB.qty) as qty, Sum(docB.qty * docB.price) as Total, docB.description
    			from `tabWharf Payment Fee` as docA,`tabWharf Fee Item` as docB where docA.name = docB.parent and docA.bulk_payment_code = %s and docA.consignee = %s group by docB.item""", 
    			(self.payment_code, self.consignee), as_dict=1 )

	#	msgprint(_(fees_list), raise_exception=1)
		fees_entries = sorted(list(fees_list))
		self.set('fees_list', [])
		self.total_fee = 0
		for d in fees_entries:
			self.total_fee = float(self.total_fee + float(d.Total))


		for f in fees_entries:
    			row = self.append('bulk_fees_items', { 
					'item': f.item,
					'description': f.description,
					'price': f.price,
					'qty': f.qty,
					'total': float(f.qty * f.price)
				})
		self.total_amount = self.total_fee
	
	def insert_bulk_fees_empty_containers(self):
    		
    		fees_list = frappe.db.sql("""select docB.item, docB.price, Sum(docB.qty) as qty, Sum(docB.qty * docB.price) as Total, docB.description
    			from `tabEmpty Deliver Payment` as docA,`tabWharf Fee Item` as docB where docA.name = docB.parent and docA.bulk_payment = "Yes" and docA.consignee = %s group by docB.item""", 
    			(self.consignee), as_dict=1 )

	#	msgprint(_(fees_list), raise_exception=1)
		fees_entries = sorted(list(fees_list))
		self.set('fees_list', [])
		self.total_fee = 0
		for d in fees_entries:
			self.total_fee = float(self.total_fee + float(d.Total))

		for f in fees_entries:
    			row = self.append('bulk_fees_items', { 
					'item': f.item,
					'description': f.description,
					'price': f.price,
					'qty': f.qty,
					'total': float(f.qty * f.price)
				})
		self.total_amount = self.total_fee
	

#	def create_sales_invoices_paid(self):

#		items = frappe.db.sql("""select docB.item, docB.price, Sum(docB.qty) as qty, Sum(docB.qty * docB.price) as Total, docB.description
#    			from `tabWharf Payment Fee` as docA,`tabWharf Fee Item` as docB where docA.name = docB.parent and docA.bulk_payment_code = %s and docA.consignee = %s group by docB.item""", 
#    			(self.payment_code, self.consignee), as_dict=1 )
#		entries = sorted(list(items))
#		self.set('items', [])

#		doc = frappe.new_doc("Sales Invoice")
#		doc.customer = self.consignee
#		doc.due_date = self.posting_date
#		doc.bulk_payment_ref = self.name
#		doc.is_pos = True
#		doc.status = "Paid"

#		doc.paid_amount = self.paid_amount
#		doc.base_paid_amount = self.total_amount
		
#		if self.discount_amount:
#			doc.discount_amount = self.discount_amount
		
#		doc.outstanding_amount = 0
#		payments = doc.append('payments', {
#		'mode_of_payment': self.payment_method,
#		'amount' : self.paid_amount
#		})

#		for d in entries:
#			item = doc.append('items', {
#			'item_code' : d.item,
#			'item_name' : d.item,
#			'description' : d.description,
#			'rate' : d.price,
#			'qty' : d.qty
#			})
		
#		doc.save(ignore_permissions=True)
#		doc.submit()