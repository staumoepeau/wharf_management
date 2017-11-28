from __future__ import unicode_literals
from frappe import _

def get_data():
	return [
		{
			"label": _("Freight Forwarder"),
			"items": [
				{
					"type": "doctype",
					"name": "Devaning Request",
					"description": _("Devaning Request."),
				},
			]
		}
	]
