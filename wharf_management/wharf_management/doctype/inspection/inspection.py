# -*- coding: utf-8 -*-
# Copyright (c) 2017, Caitlah Technology and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document

class Inspection(Document):

	def on_submit(self):
		if self.work_type == "Discharged":
			self.update_inspection_status()
		if self.work_type in ("Loading"):
			self.update_final_status()
		if self.work_type in ("Re-stowing"):
			self.update_final_status_re_stowing()

	def update_inspection_status(self):
		frappe.db.sql("""Update `tabCargo` set inspection_status="Closed", final_status="Inbound", status="Inspection", file_attach=%s, inspection_comment=%s where name=%s""", (self.file_attach, self.cargo_condition, self.cargo_ref))
	
	def update_final_status(self):
		frappe.db.sql("""Update `tabCargo` set inspection_status="Closed", yard_status="Closed", payment_status="Closed", gate1_status="Closed", gate2_status="Closed", final_status="Outbound" where name=%s""", (self.cargo_ref))
	
	def update_final_status_re_stowing(self):
		frappe.db.sql("""Update `tabCargo` set inspection_status="Closed", yard_status="Closed", payment_status="Closed", gate1_status="Closed", gate2_status="Closed", final_status="Re-stowing" where name=%s""", (self.cargo_ref))

	pass
