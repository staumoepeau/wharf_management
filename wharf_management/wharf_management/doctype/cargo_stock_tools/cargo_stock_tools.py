# -*- coding: utf-8 -*-
# Copyright (c) 2018, Sione Taumoepeau and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document

class CargoStockTools(Document):

	def on_submit(self):
		self.update_stock_refrence()
		self.move_stock_to_stock_history()
	
	def validate(self):
		self.check_status()
	

	def check_status(self):
		if not self.status or self.status == "Open":
			self.status = self.get_status()

	
	def get_status(self):
		mystatus = "Closed"
		return mystatus
	
	def update_stock_refrence(self):
		frappe.db.sql("""Update `tabCargo Stock Refrence` set status="Closed" where name=%s""", (self.stock_ref))
	
	def move_stock_to_stock_history(self):
		cargo_list = frappe.db.sql("""Select container_no,container_type,cargo_type,qty,mark,pat_code,chasis_no,
		status,yard_slot,yard_status,title,yard_date,container_size,final_status,
		cargo_stock_ref,loading_error,export_error,in_stock,discharged_error from `tabCargo Stock`""", as_dict=1)

		entries = sorted(list(cargo_list))

#		doc = frappe.new_doc("Cargo Stock History")
		for val in entries:
			doc = frappe.new_doc("Cargo Stock History")
			doc.update({
						"docstatus" : 1,
						"container_no" : val.container_no,
						"container_type" : val.container_type,
						"cargo_type"  : val.cargo_type,
						"qty" : val.qty,
						"mark" : val.mark,
						"pat_code" : val.pat_code,
						"chasis_no" : val.chasis_no,
						"status" : val.status,
						"yard_slot" : val.yard_slot,
						"yard_status" : val.yard_status,
						"title" : val.title,
						"yard_date" : val.yard_date,
						"container_size" : val.container_size,
						"final_status" : val.final_status,
						"cargo_stock_ref" : self.stock_ref,
						"loading_error" : val.loading_error,
						"export_error" : val.export_error,
						"in_stock" : val.in_stock,
						"discharged_error" : val.discharged_error,
						"posting_date" : self.posting_date
						
					})
			doc.insert()
		doc.submit()
		frappe.db.sql("""delete from `tabCargo Stock`""")

