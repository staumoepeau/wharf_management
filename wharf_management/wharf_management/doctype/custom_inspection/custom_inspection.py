# -*- coding: utf-8 -*-
# Copyright (c) 2017, Sione Taumoepeau and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document
from frappe import msgprint, _, scrub

class CustomInspection(Document):
	
	def on_submit(self):
    		self.update_custom_inspection_status()

			
	def update_custom_inspection_status(self):
#		if not self.status or self.status != "Deliver":
#			self.status = self.get_status()
		
#		if not self.movement or self.movement != "Completed":
#			self.inspection_status = self.get_inspection_status()
		
		frappe.db.sql("""Update `tabCargo` set yard_slot=NULL, custom_inspection_status='Closed' where name=%s""", (self.cargo_ref))
		frappe.db.sql("""Update `tabCustom Inspection` set status="Deliver", movement='Completed0' where name=%s""", (self.name))


	
#	def get_status(self):
#		mystatus = "Deliver"
#		return mystatus
	
#	def get_inspection_status(self):
#		inspection_status = "Completed"
#		return inspection_status
		
