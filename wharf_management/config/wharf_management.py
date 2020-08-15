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
					"onboard": 1,
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
					"name": "Pre Advice",
					"description": _("Pre Advice."),
					"onboard":1
				},
				{
					"type": "doctype",
					"name": "Cargo",
					"description": _("Cargo."),
					"onboard":1
				},
				{
					"type": "doctype",
					"name": "Cargo Manifest",
					"description": _("Cargo Manifest."),
					"onboard":1
				},
				{
					"type": "doctype",
					"name": "Cargo Operation Planning",
					"description": _("Cargo Operation Planning."),
					"onboard":1
				},

			]
		},
		
		{
			"label": _("Warehouse"),
			"items": [
				{
					"type": "doctype",
					"name": "Devaning Request",
					"description": _("Devaning Request."),
					"onboard":1
				},
				{
					"type": "doctype",
					"name": "Cargo Warehouse",
					"description": _("Warehouse."),
					"onboard":1
				},
				{
					"type": "doctype",
					"name": "Warehouse Inspection",
					"description": _("Warehouse Inspection."),
					"onboard":1
				},
				{
					"type": "doctype",
					"name": "Warehouse Custom Check",
					"description": _("Warehouse Custom Check."),
					"onboard":1
				},
				{
					"type": "doctype",
					"name": "Warehouse Fee Payment",
					"description": _("Warehouse Fee Payment."),
					"onboard":1
				},
				{
					"type": "doctype",
					"name": "Cargo Warehouse Security",
					"description": _("Cargo Warehouse Security."),
					"onboard":1
				},
				{
					"type": "doctype",
					"name": "Warehouse Storage Fee",
					"description": _("Warehouse Storage Fee."),
					"onboard":1
				},
			]
		},
		{
			"label": _("Cargo Movement"),
			"items": [
				{
					"type": "doctype",
					"name": "Transhipment Cargo",
					"description": _("Transhipment Cargo."),
				},
				{
					"type": "doctype",
					"name": "Export",
					"description": _("Export Cargo."),
				},
				{
					"type": "doctype",
					"name": "Empty Deliver Payment",
					"description": _("Empty Deliver Payment."),
				},
				{
					"type": "doctype",
					"name": "Empty Containers",
					"description": _("Empty Containers."),
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
					"onboard":1
				},
				{
					"type": "doctype",
					"name": "Yard",
					"description": _("Yard Operation."),
					"onboard":1
				},
				{
					"type": "doctype",
					"name": "Cargo Stock Refrence",
					"description": _("Cargo Stock Refrence."),
					"onboard":1
				},
				{
					"type": "doctype",
					"name": "Cargo Stock",
					"description": _("Cargo Stock."),
					"onboard":1
				},
				{
					"type": "page",
					"name": "yard-planner",
					"label": _("Wharf Yard Planner"),
					"description": _("QSC Yard Planner."),
					"onboard":1
				},
			]
		},
		{
			"label": _("Security"),
			"items": [
				{
					"type": "doctype",
					"name": "Custom Inspection",
					"description": _("Custom Inspection."),
					"onboard":1
				},
				{
					"type": "doctype",
					"name": "Gate1",
					"description": _("Security Gate 1."),
					"onboard":1
				},
				{
					"type": "doctype",
					"name": "Bulk Item Count",
					"description": _("Bulk Item Count."),
					"onboard":1
				},
				{
					"type": "doctype",
					"name": "Gate2",
					"description": _("Security Main Gate."),
					"onboard":1
				},
				{
					"type": "doctype",
					"name": "Gate1 Export",
					"description": _("Gate1 Export."),
					"onboard":1
				},
				{
					"type": "doctype",
					"name": "Main Gate Export",
					"description": _("Main Gate Export."),
					"onboard":1
				},
			]
		},
		{
			"label": _("Pilot"),
			"items": [
				{
					"type": "doctype",
					"name": "Pilot Log",
					"description": _("Pilot Log Details."),
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
					"onboard":1
				},
				{
					"type": "doctype",
					"name": "Agents",
					"description": _("Agents."),
					"onboard":1
				},
				{
					"type": "doctype",
					"name": "Vessel Type",
					"description": _("Vessel Type"),
					"onboard":1
				},
				{
					"type": "doctype",
					"name": "Vessels",
					"description": _("Vessels."),
					"onboard":1
				},
				{
					"type": "doctype",
					"name": "Cargo Type",
					"description": _("Cargo Type"),
					"onboard":1
				},
				{
					"type": "doctype",
					"name": "Container Type",
					"description": _("Container Type"),
					"onboard":1
				},
				{
					"type": "doctype",
					"name": "Ports",
					"description": _("Ports"),
					"onboard":1
				},
				{
					"type": "doctype",
					"name": "Shift",
					"description": _("Working Shift"),
				},
				{
					"type": "doctype",
					"name": "Work Type",
					"description": _("Work Type"),
					"onboard":1
				},
				{
					"type": "doctype",
					"name": "Container Truck",
					"description": _("Container Truck"),
					"onboard":1
				},
				{
					"type": "doctype",
					"name": "Truck Drivers",
					"description": _("Truck Drivers"),
					"onboard":1
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
					"onboard":1
				},
				{
					"type": "doctype",
					"name": "Berthage Fee",
					"description": _("Berthage Fee"),
					"onboard":1
				},
				{
					"type": "doctype",
					"name": "Storage Fee",
					"description": _("Storage Fee"),
					"onboard":1
				},
			
				{
					"type": "doctype",
					"name": "Wharfage Fee",
					"description": _("Wharfage Fee"),
					"onboard":1
				},
				{
					"type": "doctype",
					"name": "Devanning Fee",
					"description": _("Devanning Fee"),
					"onboard":1
				},
			]
		},
		{
			"label": _("Reports"),
			"items": [
				{
					"type": "report",
					"is_query_report": True,
					"name": "Cargo Movement"
				},
				{
					"type": "report",
					"is_query_report": True,
					"name": "Cargo Warehouse Movement"
				},
				{
					"type": "report",
					"is_query_report": True,
					"name": "Cargo Yard Efficiency Report"
				},
				{
					"type": "report",
					"is_query_report": True,
					"name": "Cargo Statitics"
				},
				{
					"type": "report",
					"is_query_report": True,
					"name": "Cargo Report"
				},
				{
					"type": "report",
					"is_query_report": True,
					"name": "Vessels Report"
				},
			]
		},
	]
