# -*- coding: utf-8 -*-
# Copyright (c) 2017, Sione Taumoepeau and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe

def get_notification_config():
	return {
		"for_doctype": {
			"Cargo Manifest": {"docstatus": 0},
			"Cargo Operation Planning": {"docstatus": 0},
			"Wharf Payment Entry": {"docstatus": 0},
			"Bulk Payment": {"docstatus": 0},
			"Wharf Payment Fee": {"docstatus": 0},
			"Inspection": {"docstatus": 0},
			"TYard": {"docstatus": 0},
			"Gate1": {"docstatus": 0},
			"Gate2": {"docstatus": 0}

		}
	}