# -*- coding: utf-8 -*-
# Copyright (c) 2017, Caitlah Technology and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe, erpnext, json
from frappe import msgprint, _, scrub
from frappe.model.document import Document

class Inspection(Document):

	def validate(self):
    		
		self.validate_work_type()	
		self.validate_crane_no()


	def on_submit(self):	
		if self.final_work_type == "Discharged":
			self.update_inspection_status()
		
		elif self.final_work_type == "Loading":
			self.update_final_status()

		if self.secondary_work_type == "Devanning":
    			self.update_final_status_devanning()
		
	def validate_work_type(self):
		if not self.final_work_type:
			msgprint(_("Work Type is Manadory").format(self.final_work_type),
					raise_exception=1)

	def validate_crane_no(self):
    		if not self.crane_no:
				msgprint(_("Crane No is Manadory").format(self.crane_no),
						raise_exception=1)

	def update_inspection_status(self):
    		if self.qty > 1:
    				frappe.db.sql("""Update `tabCargo` set break_bulk_item_count=1, inspection_status="Closed", final_status="Discharged", status="Inspection", file_attach=%s, inspection_comment=%s where name=%s""", (self.file_attach, self.cargo_condition, self.cargo_ref))
		if self.qty == 1:
    			frappe.db.sql("""Update `tabCargo` set inspection_status="Closed", final_status="Discharged", status="Inspection", file_attach=%s, inspection_comment=%s where name=%s""", (self.file_attach, self.cargo_condition, self.cargo_ref))
		if self.qty == 0:
    			frappe.db.sql("""Update `tabCargo` set inspection_status="Closed", final_status="Discharged", status="Inspection", file_attach=%s, inspection_comment=%s where name=%s""", (self.file_attach, self.cargo_condition, self.cargo_ref))
	
	def update_final_status(self):
		frappe.db.sql("""Update `tabCargo` set status="Outbound", inspection_status="Closed", yard_status="Closed", payment_status="Closed", gate1_status="Closed", gate2_status="Closed", final_status="Loading" where name=%s""", (self.cargo_ref))
	
	def update_final_status_devanning(self):
		frappe.db.sql("""Update `tabCargo` set secondary_work_type="devanning " where name=%s""", (self.cargo_ref))
