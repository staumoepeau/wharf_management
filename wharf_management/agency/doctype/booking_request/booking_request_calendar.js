// Copyright (c) 2018, Sione Taumoepeau and contributors
// For license information, please see license.txt


frappe.views.calendar["Booking Request"] = {
	field_map: {
		"start": "eta_date",
		"end": "etd_date",
		"id": "name",
		"title": "vessel",
		"allDay": "allDay"
//		"status": "status"
	},
	gantt: true,
//	filters: [
//		{
//			"fieldtype": "Link",
//			"fieldname": "project",
//			"options": "Project",
//			"label": __("Project")
//		}
//	],
	get_events_method: "frappe.desk.calendar.get_events"
}