# -*- coding: utf-8 -*-
from __future__ import unicode_literals
from frappe import _

def get_data():
	return [
		{
			"module_name": "Wharf Management",
			"color": "blue",
			"icon": "octicon octicon-tools",
			"type": "module",
			"link": "modules/Wharf Management",
			"label": _("Ports Management")
		},
		{
			"module_name": "Agency",
			"color": "#2ecc71",
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
		{
			"module_name": "Custom Inspection",
			"_doctype": "Custom Inspection",
			"color": "green",
			"icon": "octicon octicon-checklist",
			"type": "link",
			"link": "List/Custom Inspection",
			"label": _("Custom Inspection"),
		},
		{
			"module_name": "Export",
			"_doctype": "Export",
			"color": "blue",
			"icon": "octicon octicon-clippy",
			"type": "link",
			"link": "List/Export",
			"label": _("Export")
		},
		{
			"module_name": "Cargo Warehouse",
			"_doctype": "Cargo Warehouse",
			"color": "blue",
			"icon": "octicon octicon-home",
			"type": "link",
			"link": "List/Cargo Warehouse",
			"label": _("Warehouse")
		},
	]
