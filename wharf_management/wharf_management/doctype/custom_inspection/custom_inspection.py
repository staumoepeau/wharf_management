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

	def validate(self):
    		self.check_movement()
	
	def check_movement(self):
    		if not self.movement:
    				 msgprint(_("Please enter value for Movement"), raise_exception=1)
			
	def update_custom_inspection_status(self):		
			frappe.db.sql("""Update `tabCargo` set yard_slot="CI" where name=%s""", (self.cargo_ref))
