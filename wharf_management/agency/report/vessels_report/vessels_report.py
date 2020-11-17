# Copyright (c) 2013, Sione Taumoepeau and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.utils import cstr, cint, getdate
from frappe import msgprint, _
from calendar import monthrange
from frappe.utils import cstr, today, flt
import pandas as pd
import numpy as np
#import DataTable from frappe-datatable



def execute(filters=None):
    columns, data = [], []
    vessels = get_vessels_info(filters)
    colnames = [key for key in vessels[2].keys()]
    df = pd.DataFrame.from_records(vessels, columns=colnames)
    pvt = pd.pivot_table(df, index=['YEAR','vessel_type'], columns=['MONTH'], values=['TOTAL'], fill_value=0)
    data = pvt.reset_index().values.tolist() # reset the index and create a list for use in report.
    columns += pvt.columns.values.tolist()

    return columns, data

def get_conditions(filters):
    conditions = ""
    if filters.get("year"): 
        conditions += """ and exists((SELECT DISTINCT DATE_FORMAT(eta_date, '%Y') 
        FROM `tabBooking Request`) = %(year)s)"""
    return conditions

def get_vessels_info(filters):
    conditions = get_conditions(filters)
    return frappe.db.sql("""
        SELECT vessel_type, DATE_FORMAT(eta_date, '%M') AS 'MONTH', COUNT(*) AS 'TOTAL',
        DATE_FORMAT(eta_date, '%Y') AS 'YEAR'
        FROM `tabBooking Request`
        WHERE docstatus=1 AND vessel_type IS NOT NULL
        GROUP BY vessel_type, DATE_FORMAT(eta_date, '%M')
	    """, as_dict=1)


@frappe.whitelist()
def get_eta_years():
    year_list = frappe.db.sql_list("""SELECT DISTINCT DATE_FORMAT(eta_date, '%Y') FROM `tabBooking Request` ORDER BY YEAR(eta_date) DESC""")
#	if not year_list:
#    year_list = getdate().year

    return "\n".join(str(year) for year in year_list)