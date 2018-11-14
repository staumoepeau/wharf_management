# Copyright (c) 2018, Sione Taumoepeau and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe import _
from frappe.utils import cstr

def execute(filters=None):
	columns, data = [], []
	columns=get_columns()
	data=get_cargo_movement_data(filters, columns)
	return columns, data


def get_columns():
	return [
		_("Booking Ref") + ":Data:100",
		_("Cargo Type") + ":Data:80",
		_("Container No") + ":Data:120",
		_("Voyage No") + ":Data:60",
		_("Content") + ":Data:80",
		_("Size") + ":Data:80",
		_("Ref #") + ":Data:120",
		_("Inspection By") + ":Data:140",
		_("Start Date") + ":Date:130",
		_("End Date") + ":Date:130",
		_("Inspection Efficiency") + ":Time:130",
		_("Yard By") + ":Data:140",
		_("Start Date") + ":Date:130",
		_("End Date") + ":Date:130",
		_("Yard Efficiency") + ":Time:130",
		_("Efficiency") + ":Time:130"	
	]

def get_cargo_movement_data(filters, columns):
	data = []

	cargo_movement_data = get_cargo_movement_details(filters)

	for cont in cargo_movement_data:
		row = [cont.booking_ref, cont.cargo_type, cont.container_no, cont.voyage_no, cont.container_content, cont.container_size, cont.name, 
		cont.owner, cont.creation, cont.modified, cont.inspection, cont.yard_owner, cont.yard_creation, cont.yard_modified, cont.yard,
		cont.efficient]
		data.append(row)
	return data

def get_conditions(filters):
	conditions = "1=1"
	if filters.get("booking_ref"): conditions += " and c.booking_ref = %(booking_ref)s"
#	if filters.get("from_date"): conditions += " and eta >= %(from_date)s"
	return conditions


def get_cargo_movement_details(filters):
	conditions = get_conditions(filters)
	return frappe.db.sql("""
		SELECT c.booking_ref, 
			c.cargo_type, 
			c.container_no,
			c.voyage_no,
			c.container_content,
			c.container_size, 
			c.name,
			t.owner,
			t.creation,
			t.modified,
			TIMEDIFF(t.modified, t.creation) AS inspection,
			y.owner as yard_owner,
			y.creation as yard_creation,
			y.modified as yard_modified,
			TIMEDIFF(y.modified, y.creation) AS yard,
			TIMEDIFF(y.modified, t.creation) AS efficient
			FROM `tabPre Advice` c
			INNER JOIN `tabInspection` t ON t.cargo_ref = c.name
			INNER JOIN `tabYard` y ON y.cargo_ref = c.name
			WHERE c.docstatus < 2
			AND c.cargo_type IS NOT NULL
			and {conditions}			
	""".format(conditions=conditions), filters, as_dict=1)

