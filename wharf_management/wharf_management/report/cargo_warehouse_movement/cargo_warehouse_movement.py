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
		_("Cargo Description") + ":Data:120",
		_("Warrant No") + ":Data:90",
		_("Consignee") + ":Data:120",
		_("Agents") + ":Data:120",
		_("Chasis No") + ":Data:120",
		_("Mark") + ":Data:60",
		_("Delivery Status") + ":Data:110",
		_("Delivery Date") + ":Date:110",
		_("Delivery Time") + ":Time:110",
		_("Vehicle") + ":Data:80",
		_("Driver's Information") + ":Data:110"
		
	]

def get_cargo_movement_data(filters, columns):
	data = []

	cargo_movement_data = get_cargo_movement_details(filters)

	for cont in cargo_movement_data:
#		owner_posting_date = container["owner"]+cstr(container["posting_date"])
		row = [cont.cargo_type, cont.cargo_description, cont.warrant_number, cont.consignee, cont.agents, 
		cont.chasis_no, cont.mark, cont.status, cont.movement_date, cont.gate1_time, cont.truck, cont.truck_driver]
		data.append(row)
	return data

def get_conditions(filters):
	conditions = "1=1"
	if filters.get("from_date"): conditions += " and movement_date >= %(from_date)s"
	if filters.get("to_date"): conditions += " and movement_date <= %(to_date)s"
	if filters.get("status"): conditions += " and status = %(status)s"
#	if filters.get("owner"): conditions += " and a.owner = %(owner)s"
#	if filters.get("pos_profile"): conditions += " and a.is_pos = %(pos_profile)s"
#	if filters.get("status"): conditions += " and a.status = %(status)s"
	return conditions


def get_cargo_movement_details(filters):
	conditions = get_conditions(filters)
	return frappe.db.sql("""
		select
			cargo_type, cargo_description, consignee, agents, chasis_no, mark, gate_status as status, movement_date,
			gate1_time, truck, truck_driver, main_gate_date, main_gate_time, main_gate_status, main_gate_content, warrant_number
		from `tabCargo Warehouse Movement`
		where docstatus < 2
			and {conditions}			
	""".format(conditions=conditions), filters, as_dict=1)

