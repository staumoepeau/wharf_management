# -*- coding: utf-8 -*-
from __future__ import unicode_literals
from frappe import _

def get_data():
	return [
		{
			"module_name": "Wharf Management",
			"color": "blue",
			"icon": "fa fa-gear",
			"type": "module",
			"label": _("PMS")
		},
		{
			"doctype_name": "Cargo",
			"color": "red",
			"icon": "fa fa-package",
			"type": "doctype",
			"label": _("Cargo")
		},
		{
			"module_name": "Agency",
			"color": "blue",
			"icon": "fa fa-ship",
			"type": "module",
			"label": _("Agency")
		},
	]
