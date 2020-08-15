# -*- coding: utf-8 -*-
from __future__ import unicode_literals
from frappe import _

def get_data():
	return [
		{
			"module_name": "Wharf Management",
			"category": "Modules",
			"label": _("Ports Management"),
			"color": "blue",
			"icon": "octicon octicon-tools",
			"type": "module",
			"description": "Wharf Management Operations"
		},
	]
