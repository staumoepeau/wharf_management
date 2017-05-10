# -*- coding: utf-8 -*-
# Copyright (c) 2017, Caitlah Technology and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe import throw, _
from frappe.model.document import Document

class Yard(Document):


	def on_submit(self):
		self.update_yard_slot()


	def update_yard_slot(self):
		frappe.db.sql("""Update `tabCargo` set yard_slot=%s, yard_status="Closed", status='Yard' where name=%s""", (self.yard_slot, self.cargo_ref))
