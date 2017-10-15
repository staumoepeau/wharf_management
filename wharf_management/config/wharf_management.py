from __future__ import unicode_literals
from frappe import _

def get_data():
	return [
		{
			"label": _("Payment"),
			"items": [
				{
					"type": "doctype",
					"name": "Wharf Payment Entry",
					"description": _("Wharf Payment Entry"),
				},
				{
					"type": "doctype",
					"name": "Bulk Payment",
					"description": _("Bulk Payment"),
				},
				{
					"type": "doctype",
					"name": "Wharf Payment Fee",
					"description": _("Wharf Payment Fee"),
				},
			]
		},
		{
			"label": _("Cargo Operation"),
			"items": [
				{
					"type": "doctype",
					"name": "Cargo",
					"description": _("Cargo."),
				},
				{
					"type": "doctype",
					"name": "Cargo Manifest",
					"description": _("Cargo Manifest."),
				},
				{
					"type": "doctype",
					"name": "Cargo Operation Planning",
					"description": _("Cargo Operation Planning."),
				},
			]
		},
		{
			"label": _("Pilot"),
			"items": [
				{
					"type": "doctype",
					"name": "Pilot"
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
				{
					"type": "doctype",
					"name": "Gate2",
					"description": _("Security Main Gate."),
				},
			]
		},

		{
			"label": _("Fleet Management"),
			"items": [
				{
					"type": "doctype",
					"name": "Vehicle"
				},
				{
					"type": "doctype",
					"name": "Vehicle Log"
				},
			]
		},
		{
			"label": _("Setup"),
			"items": [
				{
					"type": "doctype",
					"name": "Item",
					"description": _("Item."),
				},
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
					"name": "Cargo Content",
					"description": _("Cargo Content.")
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
					"name": "Work Type",
					"description": _("Work Type"),
				},
			]
		},
		{
			"label": _("Fees"),
			"items": [
				
				{
					"type": "doctype",
					"name": "Wharf Handling Fee",
					"description": _("Wharf Handling Fee"),
				},
				{
					"type": "doctype",
					"name": "Storage Fee",
					"description": _("Storage Fee"),
				},
			
				{
					"type": "doctype",
					"name": "Wharfage Fee",
					"description": _("Wharfage Fee"),
				},
				{
					"type": "doctype",
					"name": "Devanning Fee",
					"description": _("Devanning Fee"),
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
