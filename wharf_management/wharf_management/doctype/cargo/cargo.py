# -*- coding: utf-8 -*-
# Copyright (c) 2017, Caitlah Technology and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe, json
from frappe.model.document import Document
from frappe import msgprint, _, scrub
from frappe.utils import cstr, flt, fmt_money, formatdate


class Cargo(Document):

	def on_submit(self):
		self.check_validate()

	def check_validate(self):
		if not self.booking_ref:
			msgprint(_("Booking Ref # is Manadory").format(self.booking_ref),
					raise_exception=1)