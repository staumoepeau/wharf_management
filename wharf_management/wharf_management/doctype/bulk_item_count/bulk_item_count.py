# -*- coding: utf-8 -*-
# Copyright (c) 2017, Sione Taumoepeau and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document

class BulkItemCount(Document):
    	
		
		def on_submit(self):
    			self.update_cargo_table()


		def update_cargo_table(self):
    			self.count_items = self.break_bulk_item_count + 1
				
			frappe.db.sql("""Update `tabCargo` set break_bulk_item_count=%s where name=%s""", (self.count_items, self.cargo_ref))