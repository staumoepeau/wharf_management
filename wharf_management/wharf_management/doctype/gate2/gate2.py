# -*- coding: utf-8 -*-
# -*- coding: utf-8 -*-
# Copyright (c) 2017, Caitlah Technology and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe, json
import frappe.defaults
from frappe.model.document import Document
from frappe.utils import cstr, flt, fmt_money, formatdate
from frappe import msgprint, _, scrub

class Gate2(Document):
	
	def on_submit(self):
		self.update_gate2_status()
		self.update_export_status()
	
	def update_gate2_status(self):
#    		if self.status != "Export":
   			frappe.db.sql("""Update `tabCargo` set gate1_status='Closed', gate2_status='Closed', yard_slot=NULL, status='Gate Out' where name=%s""", (self.cargo_ref))
	
#	def update_yard(self):
#			frappe.db.sql("""Delete `tabCargo` where name=%s""", (self.cargo_ref))
			
	def update_export_status(self):		
			if self.status == 'Export':
    				frappe.db.sql("""Update `tabCargo` set export_status="Main Gate", gate1_status="Open", gate2_status="Open", payment_status="Open", yard_status="Open", inspection_status="Open" where name=%s""", (self.cargo_ref))
    				