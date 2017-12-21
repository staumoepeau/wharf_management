# -*- coding: utf-8 -*-
# Copyright (c) 2017, Caitlah Technology and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document

class CargoOperationPlanning(Document):

	def get_operation_list(self):
		condition = ""
		cargo_booking_manifest_table = frappe.db.sql("""select cargo_type, container_size, work_type, qty, cargo_content, dis_charging, loading, weight, total_weight, parent
			from `tabCargo Booking Manifest Table`
			where parent = %s {0}""".format(condition), (self.booking_ref), as_dict=1)

		entries = sorted(list(cargo_booking_manifest_table),
			key=lambda k: k['parent'])

		self.set('cargo_booking_manifest_table', [])


		for d in entries:
			row = self.append('cargo_booking_manifest_table', {})
			row.update(d)

	def get_forklift_list(self):
		condition = ""
		forklift_table = frappe.db.sql("""select forklift_require, forklift_qty, parent
			from `tabForklift Table`
			where parent = %s {0}""".format(condition), (self.booking_ref), as_dict=1)

		entries = sorted(list(forklift_table),
			key=lambda k: k['parent'])

		self.set('forklift_table', [])

		for d in entries:
			row = self.append('forklift_table', {})
			row.update(d)
