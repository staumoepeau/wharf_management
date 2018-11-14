# Copyright (c) 2013, Sione Taumoepeau and contributors
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
		_("Cargo Type") + ":Data:80",
		_("Container No") + ":Data:120",
		_("ETA Date") + ":Date:110",
		_("Content") + ":Data:80",
		_("Size") + ":Data:80",
		_("Ref #") + ":Data:120",
		_("Inspection Create By") + ":Data:120",
		_("Ins Create Date") + ":Date:110",
		_("Ins Submit Date") + ":Date:110",
		_("Inspection Efficiency") + ":Time:120"
#		_("Warrant No") + ":Data:90",
#		_("Consignee") + ":Data:120",
#		_("Agents") + ":Data:120",
#		_("Chasis No") + ":Data:120",
#		_("Mark") + ":Data:60",
#		_("Gate 1 Status") + ":Data:110",
#		_("Gate 1 Date") + ":Date:110",
#		_("Gate 1 ata") + ":Time:110",
#		_("Main Gate Status") + ":Data:110",
#		_("Main Gate Date") + ":Date:110",
#		_("Main Gate Time") + ":Time:110",
#		_("Main Gate Content") + ":Data:110",
#		_("Truck") + ":Data:80",
#		_("Truck Driver") + ":Data:90"
		
	]

def get_cargo_movement_data(filters, columns):
	data = []

	cargo_movement_data = get_cargo_movement_details(filters)

	for cont in cargo_movement_data:
#		owner_posting_date = container["owner"]+c cont.modifiestr(container["posting_date"])
#		row = [cont.cargo_type, cont.container_no, cont.container_content, cont.container_size, cont.cargo_description, cont.warrant_number, cont.consignee, cont.agents, 
#		cont.chasis_no, cont.mark, cont.status, cont.eta_date, cont.movement_date, cont.gate1_time, cont.main_gate_status, cont.main_gate_date, cont.main_gate_time, cont.main_gate_content, cont.truck, cont.truck_driver]
		row = [cont.cargo_type, cont.container_no, cont.eta, cont.container_content, cont.container_size, cont.Ref, 
		cont.owner, cont.creation, cont.modified, cont.inspection_eff]
		data.append(row)
	return data

def get_conditions(filters):
	conditions = "1=1"
	if filters.get("booking"): conditions += " and booking_ref = %(booking)s"
#	if filters.get("from_date"): conditions += " and eta >= %(from_date)s"
#	if filters.get("to_date"): conditions += " and eta <= %(to_date)s"
#	if filters.get("status"): conditions += " and status = %(status)s"
#	if filters.get("owner"): conditions += " and a.owner = %(owner)s"
#	if filters.get("pos_profile"): conditions += " and a.is_pos = %(pos_profile)s"
#	if filters.get("status"): conditions += " and a.status = %(status)s"
	return conditions


def get_cargo_movement_details(filters):
	conditions = get_conditions(filters)
	return frappe.db.sql("""
		select c.cargo_type, c.container_no, c.eta_date as eta, c.container_content, c.container_size, c.name as Ref, 
		t.owner, t.creation, t.modified, TIME_FORMAT(t.creation, 'H:i:s') as inpection_eff
		from `tabPre Advice` c LEFT JOIN `tabInspection` t ON c.name = t.cargo_ref 
		WHERE c.docstatus < 2
		AND c.cargo_type IS NOT NULL
			and {conditions}			
	""".format(conditions=conditions), filters, as_dict=1)

