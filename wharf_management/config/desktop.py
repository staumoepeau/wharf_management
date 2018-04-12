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
			"label": _("Ports Management")
		},
		{
			"module_name": "Agency",
			"color": "red",
			"icon": "fa fa-ship",
			"type": "module",
			"label": _("Agency")
		},
		{
			"module_name": "Freight Forwarder",
			"color": "green",
			"icon": "fa fa-cubes",
			"type": "module",
			"label": _("Freight Forwarder")
		},
	]
