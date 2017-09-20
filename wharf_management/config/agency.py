from __future__ import unicode_literals
from frappe import _

def get_data():
	return [
		{
			"label": _("Agent"),
			"items": [
				{
					"type": "doctype",
					"name": "Booking Request",
					"description": _("Booking Request."),
				},
				{
					"type": "doctype",
					"name": "Vessels",
					"description": _("Vessels."),
				},
				{
					"type": "doctype",
					"name": "ETA Changes",
					"description": _("ETA Changes."),
				},
			]
		}
	]
