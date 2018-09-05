// Copyright (c) 2017, Sione Taumoepeau and contributors
// For license information, please see license.txt

frappe.listview_settings['Cargo'] = {
	add_fields: ["status"],
	has_indicator_for_draft: 1,
	get_indicator: function(doc) {

		if(doc.docstatus==0){
			if(doc.status=="Export"){
				return [__("Export"), "red", "status,=,Export"];
			} else{
				return [__("Need Attention"), "red", "status,=,'Uploaded'"];
			}
		} else if(doc.status=== "Uploaded"){
			return [__("Uploaded"), "purple", "status,=,Uploaded"];
			
		} else if (doc.status === "Re-stowing"){
			return [__("Re-stowing"), "grey", "status,=,Re-stowing"];

		} else if (doc.status === "Transhipment"){
				return [__("Transhipment"), "grey", "status,=,Transhipment"];

		} else if (doc.status === "Outbound"){
			return [__("Outbound"), "purple", "status,=,Outbound"];

		} else if (doc.status === "Inspection"){
			return [__("Inspection"), "green", "status,=,Inspection"];

		} else if (doc.status === "Yard"){
			return [__("Yard"), "purple", "status,=,Yard"];

		} else if (doc.status === "Paid"){
			return [__("Paid"), "orange", "status,=,Paid"];

		} else if (doc.status === "Gate1"){
			return [__("Passed Gate1"), "blue", "status,=,Gate1"];

		}else if (doc.status === "Gate Out"){
			return [__("Outward"), "green", "status,=,Gate2"];

		}else if (doc.status === "Devanning"){
			return [__("Devan"), "black", "status,=,Devanning"];
		
		}else if (doc.status === "CCV"){
			return [__("CCV"), "black", "status,=,CCV"];

		}else if (doc.status === "Split Ports"){
			return [__("Split Ports"), "black", "status,=,Split Ports"];
		}
	}
};
