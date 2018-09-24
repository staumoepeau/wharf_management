# -*- coding: utf-8 -*-
# Copyright (c) 2017, Sione Taumoepeau and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
from frappe.utils import add_days, cint, cstr, flt, getdate, rounded, date_diff, money_in_words
import frappe
from frappe import _, msgprint, throw
from frappe.model.document import Document

class Gate1ItemCount(Document):


		def on_submit(self):
    			self.update_cargo_table()
		
		def validate(self):
				self.validate_qty()
		

		def validate_qty(self):
			if not self.security_item_count:
				if self.count_items > self.qty:
					msgprint(_("Items count is over the QTY"), raise_exception=1)
			elif self.security_item_count > 1:
				if (flt(self.security_item_count) + self.count_items) > self.qty:
					msgprint(_("Items count is over the QTY"), raise_exception=1)

		def update_cargo_table(self):
			items = 0
			items = flt(self.security_item_count + self.count_items)
    			
			if self.mydoctype == "CARGO":
				frappe.db.sql("""Update `tabCargo` set security_item_count=%s where name=%s""", (items, self.cargo_ref))
				
			if self.mydoctype == "Warehouse":
				frappe.db.sql("""Update `tabCargo Warehouse` set security_item_count=%s where name=%s""", (items, self.cargo_ref))
				