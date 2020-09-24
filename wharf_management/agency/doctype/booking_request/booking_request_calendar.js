// Copyright (c) 2018, Sione Taumoepeau and contributors
// For license information, please see license.txt


frappe.views.calendar["Booking Request"] = {
    field_map: {
        "start": "eta_date",
        "end": "etd_date",
        "id": "name",
        "title": "vessel",
        "allDay": "allDay",
        "eventColor": "color"

    },
    order_by: "eta_date",
    gantt: true,
    filters: [{
        "fieldtype": "Data",
        "fieldname": "voyage_no",
        "label": __("Voyage No")
    }],
    get_events_method: "wharf_management.agency.calendar.get_events"
}