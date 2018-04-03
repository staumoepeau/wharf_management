# -*- coding: utf-8 -*-
# Copyright (c) 2018, Sione Taumoepeau and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document

class PilotLog(Document):

	def on_submit(self):
		self.check_grt()


	def check_grt(self):
		if self.change_grt == 1:
			frappe.db.sql("""Update `tabVessels` set vessel_gross_tonnage=%s, where name=%s""", (self.gross_tonnage, self.vessel))

