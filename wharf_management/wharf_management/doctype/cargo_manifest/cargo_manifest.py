# -*- coding: utf-8 -*-
# Copyright (c) 2017, Caitlah Technology and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe, json
from frappe.model.document import Document


class CargoManifest(Document):

		def on_submit(self):
			self.update_cargo_table()


		def update_cargo_table(self):
			frappe.db.sql("""Update `tabCargo` set vessel = %s, voyage_no = %s where parent = %s""", (self.vessel, self.voyage_no, self.name))
			frappe.db.sql("""Update `tabCargo` set status='UNKNOWN' where parent = %s""", (self.name))
