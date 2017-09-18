# -*- coding: utf-8 -*-
# Copyright (c) 2017, Caitlah Technology and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe, json
from frappe.model.document import Document
from frappe.utils import cstr, flt, fmt_money, formatdate
from frappe import msgprint, _, scrub

class Gate1(Document):
	
	def on_submit(self):
		self.validate_warrant_no()
		self.update_export_status()
		self.update_not_export_status()
		
	
	def validate_warrant_no(self):
			if self.status != 'Export':
    				if self.warrant_no != self.custom_warrant:
        						msgprint(_("Please Make sure that is the correct WARRANT NO"), raise_exception=1)


	def update_not_export_status(self):
			if self.status != 'Export':
    				frappe.db.sql("""Update `tabCargo` set gate1_status="Closed", status='Gate1' where name=%s""", (self.cargo_ref))

	def update_export_status(self):		
			if self.status == 'Export':
    				frappe.db.sql("""Update `tabCargo` set export_status="Gate1", gate1_status="Open", gate2_status="Open", payment_status="Open", yard_status="Open", inspection_status="Open" where name=%s""", (self.cargo_ref))
    				