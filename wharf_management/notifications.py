# -*- coding: utf-8 -*-
# Copyright (c) 2017, Sione Taumoepeau and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe

def get_notification_config():
	return {
		"for_doctype": {
			"Pre Advice": {"docstatus": 0},
			"Cargo Manifest": {"docstatus": 0},
			"Cargo Operation Planning": {"docstatus": 0},
			"Wharf Payment Entry": {"docstatus": 0},
			"Bulk Payment": {"docstatus": 0},
			"Wharf Payment Fee": {"docstatus": 0},
			"Inspection": {"docstatus": 0},
			"Yard": {"docstatus": 0},
			"Gate1": {"docstatus": 0},
			"Gate2": {"docstatus": 0}

		}
	}

	doctype = [d for d in notifications.get('for_doctype')]
	for doc in frappe.get_all('DocType',
		fields= ["name"], filters = {"name": ("not in", doctype), 'is_submittable': 1}):
		notifications["for_doctype"][doc.name] = {"docstatus": 0}

	return notifications
