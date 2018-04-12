# -*- coding: utf-8 -*-
# Copyright (c) 2017, Caitlah Technology and contributors
# For license information, please see license.txt

from __future__ import unicode_literals

import frappe
from frappe import _
import json



@frappe.whitelist()
def get_events(doctype, start, end, field_map, filters=None, fields=None):
	field_map = frappe._dict(json.loads(field_map))

	if filters:
		filters = json.loads(filters or '')

	if not fields:
		fields = [field_map.start, field_map.end, field_map.title, 'name']

	start_date = "ifnull(%s, '0000-00-00 00:00:00')" % field_map.start
	end_date = "ifnull(%s, '2199-12-31 00:00:00')" % field_map.end

	filters += [
		[doctype, start_date, '<=', end],
		[doctype, end_date, '>=', start],
	]

	return frappe.get_list(doctype, fields=fields, filters=filters)