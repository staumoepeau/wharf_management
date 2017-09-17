# -*- coding: utf-8 -*-
# Copyright (c) 2017, Caitlah Technology and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document

class BulkPayment(Document):
    	
	def insert_containers(self):
		container_list = frappe.db.sql("""select name as cargo_refrence, container_no, bol, cargo_type,
		work_type, container_content, status, voyage_no, booking_ref from `tabCargo` where consignee = %s""",(self.consignee), as_dict=1)

		entries = sorted(list(container_list))
		self.set('container_list', [])

		for d in entries:
			row = self.append('bulk_cargo_table', {
				'cargo_refrence':d.cargo_refrence,
				'container_no':d.container_no,
				'cargo_type':d.cargo_type,
				'work_type':d.work_type,
				'container_content':d.container_content,
				'status':d.status,
				'voyage_no':d.voyage_no,
				'bol':d.bol,
				'booking_ref':d.booking_ref
			})

	pass
