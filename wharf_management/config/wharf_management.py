from __future__ import unicode_literals
from frappe import _

def get_data():
	return [
		{
			"label": _("Pilot Operation"),
			"items": [
				{
					"type": "doctype",
					"name": "Vessel Booking",
					"description": _("Booking Vessel."),
				},
			]
		},
		{
			"label": _("Wharf Operation"),
			"items": [
				{
					"type": "doctype",
					"name": "Cargo Operation",
					"description": _("Cargo Operation."),
				},
				{
					"type": "doctype",
					"name": "Wharf Operations Booking",
					"description": _("Wharf Operations Booking."),
				},
				{
					"type": "doctype",
					"name": "Wharf Payment Fee",
					"description": _("Wharf Payment Fee"),
				},
			]
		},
		{
			"label": _("Yard Operation"),
			"items": [
				{
					"type": "doctype",
					"name": "Inspection",
					"description": _("Cargo Inspection."),
				},
				{
					"type": "doctype",
					"name": "Yard",
					"description": _("Yard Operation."),
				},
			]
		},
		{
			"label": _("Security Gate"),
			"items": [
				{
					"type": "doctype",
					"name": "Gate1",
					"description": _("Security Gate 1."),
				},
			]
		},
		{
			"label": _("Setup"),
			"items": [
				{
					"type": "doctype",
					"name": "Agents",
					"description": _("Agents."),
				},
				{
					"type": "doctype",
					"name": "Vessels",
					"description": _("Vessels."),
				},
				{
					"type": "doctype",
					"name": "Cargo Size",
					"description": _("Cargo Size.")
				},
				{
					"type": "doctype",
					"name": "Cargo Type",
					"description": _("Cargo Type"),
				},
				{
					"type": "doctype",
					"name": "Container Size",
					"description": _("Container Size"),
				},
				{
					"type": "doctype",
					"name": "Container Type",
					"description": _("Container Type"),
				},
				{
					"type": "doctype",
					"name": "Ports",
					"description": _("Ports"),
				},
				{
					"type": "doctype",
					"name": "Shift",
					"description": _("Working Shift"),
				},
				{
					"type": "doctype",
					"name": "Vessel",
					"description": _("Vessel List"),
				},
				{
					"type": "doctype",
					"name": "Wharf Handling Fee",
					"description": _("Wharf Handling Fee"),
				},
				{
					"type": "doctype",
					"name": "Work Type",
					"description": _("Work Type"),
				},
			]
		},
		{
			"label": _("Reports"),
			"items": [
				{
					"type": "report",
					"is_query_report": True,
					"name": "Tellers Report",
					"doctype": "Send Money"
				},
				{
					"type": "report",
					"is_query_report": True,
					"name": "Tellers Details Report Today",
					"doctype": "Send Money"
				},
				{
					"type": "report",
					"is_query_report": True,
					"name": "Tellers Details Report",
					"doctype": "Send Money"
				},
			]
		},
	]
