(function () {
    'use strict';
    angular.module('formData')
        .factory('formData', [function() {
            return [
                {
                    "Form": "VBA-21-526EZ-ARE",
                    "PDFFormLocator": null,
                    "Question": "Veteran First Name",
                    "Type": "text",
                    "DatumId": "veteran_first_name"
                },
                {
                    "Form": "VBA-21-526EZ-ARE",
                    "PDFFormLocator": null,
                    "Question": "Veteran Middle Initial",
                    "Type": "text",
                    "DatumId": "veteran_middle_initial"
                },
                {
                    "Form": "VBA-21-526EZ-ARE",
                    "PDFFormLocator": null,
                    "Question": "Veteran Last Name",
                    "Type": "text",
                    "DatumId": "veteran_last_name"
                },
                {
                    "Form": "VBA-21-526EZ-ARE",
                    "PDFFormLocator": null,
                    "Question": "Veteran Social Security Number",
                    "Type": "text",
                    "DatumId": "veteran_ssn"
                },
                {
                    "Form": "VBA-21-526EZ-ARE",
                    "PDFFormLocator": null,
                    "Question": "Veteran Date of Birth",
                    "Type": "date",
                    "DatumId": "veteran_dob"
                },
                {
                    "Form": "VBA-21-526EZ-ARE",
                    "PDFFormLocator": null,
                    "Question": "Veteran Sex",
                    "Type": "radio",
                    "Options": [
                        "Male", "Female"
                    ],
                    "DatumId": "veteran_sex"
                },
                {
                    "Form": "VBA-21-526EZ-ARE",
                    "PDFFormLocator": null,
                    "Question": "Veteran Previous Claim",
                    "Type": "radio",
                    "Options": [
                        "Yes", "No"
                    ],
                    "DatumId": "veteran_previous_claim_y_n"
                },
                {
                    "Form": "VBA-21-526EZ-ARE",
                    "PDFFormLocator": null,
                    "Question": "Veteran VA File Number",
                    "Type": "text",
                    "DependsOn": {
                        "DatumId": "veteran_previous_claim_y_n",
                        "Value": "Yes"
                    },
                    "DatumId": "veteran_previous_claim"
                },
                {
                    "Form": "VBA-21-526EZ-ARE",
                    "PDFFormLocator": null,
                    "Question": "Veteran Homeless",
                    "Type": "radio",
                    "Options": [
                        "Yes", "No"
                    ],
                    "DatumId": "veteran_homeless_y_n"
                },
                {
                    "Form": "VBA-21-526EZ-ARE",
                    "PDFFormLocator": null,
                    "Question": "Veteran Point of Contact",
                    "Type": "text",
                    "DependsOn": {
                        "DatumId": "veteran_homeless_y_n",
                        "Value": "Yes"
                    },
                    "DatumId": "veteran_homeless_point_of_contact"
                },
                {
                    "Form": "VBA-21-526EZ-ARE",
                    "PDFFormLocator": null,
                    "Question": "Veteran Point of Contact Phone Number",
                    "Type": "text",
                    "DependsOn": {
                        "DatumId": "veteran_homeless_y_n",
                        "Value": "Yes"
                    },
                    "DatumId": "veteran_homeless_point_of_contact_phone_number"
                },
                {
                    "Form": "VBA-21-526EZ-ARE",
                    "PDFFormLocator": null,
                    "Question": "Veteran Service Branch",
                    "Type": "checkbox",
                    "Options": [
                        "Army", "Navy", "Marine Corps", "Air Force", "Coast Guard"
                    ],
                    "DatumId": "veteran_service_branches"
                },
                {
                    "Form": "VBA-21-526EZ-ARE",
                    "PDFFormLocator": null,
                    "Question": "Veteran Service Component",
                    "Type": "checkbox",
                    "Options": [
                        "Active", "Reserves", "National Guard"
                    ],
                    "DatumId": "veteran_service_components"
                },
                {
                    "Form": "VBA-21-526EZ-ARE",
                    "PDFFormLocator": null,
                    "Question": "Veteran Home Zip Code",
                    "Type": "text",
                    "DatumId": "veteran_home_zip_code"
                },
                {
                    "Form": "VBA-21-526EZ-ARE",
                    "PDFFormLocator": null,
                    "Question": "Veteran Home Street",
                    "Type": "text",
                    "DatumId": "veteran_home_street"
                },

                {
                    "Form": "VBA-21-526EZ-ARE",
                    "PDFFormLocator": null,
                    "Question": "Veteran Home City",
                    "Type": "text",
                    "DatumId": "veteran_home_city"
                },
                {
                    "Form": "VBA-21-526EZ-ARE",
                    "PDFFormLocator": null,
                    "Question": "Veteran Home State",
                    "Type": "text",
                    "DatumId": "veteran_home_state"
                },
                {
                    "Form": "VBA-21-526EZ-ARE",
                    "PDFFormLocator": null,
                    "Question": "Veteran Home Country",
                    "Type": "text",
                    "DatumId": "veteran_home_country"
                },



                {
                    "Form": "VBA-21-526EZ-ARE",
                    "PDFFormLocator": null,
                    "Question": "Veteran Forwarding Zip Code",
                    "Type": "text",
                    "DatumId": "veteran_forwarding_zip_code"
                },
                {
                    "Form": "VBA-21-526EZ-ARE",
                    "PDFFormLocator": null,
                    "Question": "Veteran Forwarding Street",
                    "Type": "text",
                    "DatumId": "veteran_forwarding_street"
                },

                {
                    "Form": "VBA-21-526EZ-ARE",
                    "PDFFormLocator": null,
                    "Question": "Veteran Forwarding City",
                    "Type": "text",
                    "DatumId": "veteran_forwarding_city"
                },
                {
                    "Form": "VBA-21-526EZ-ARE",
                    "PDFFormLocator": null,
                    "Question": "Veteran Forwarding State",
                    "Type": "text",
                    "DatumId": "veteran_forwarding_state"
                },
                {
                    "Form": "VBA-21-526EZ-ARE",
                    "PDFFormLocator": null,
                    "Question": "Veteran Forwarding Country",
                    "Type": "text",
                    "DatumId": "veteran_forwarding_country"
                },

                {
                    "Form": "VBA-21-526EZ-ARE",
                    "PDFFormLocator": null,
                    "Question": "Veteran Forwarding Address Effective Date",
                    "Type": "date",
                    "DatumId": "veteran_forwarding_address_effective_date"
                },

                {
                    "Form": "VBA-21-526EZ-ARE",
                    "PDFFormLocator": null,
                    "Question": "Veteran Preferred Phone Number",
                    "Type": "text",
                    "DatumId": "veteran_phone_number"
                },

                {
                    "Form": "VBA-21-526EZ-ARE",
                    "PDFFormLocator": null,
                    "Question": "Veteran Preferred Email Address",
                    "Type": "text",
                    "DatumId": "veteran_email"
                },

                {
                    "Form": "VBA-21-526EZ-ARE",
                    "PDFFormLocator": null,
                    "Question": "Veteran Alternate Email Address",
                    "Type": "text",
                    "DatumId": "veteran_alternate_email"
                },

                {
                    "Form": "VBA-21-526EZ-ARE",
                    "PDFFormLocator": null,
                    "Question": "Veteran Disability",
                    "Type": "group",
                    "MaxSubElements": 20,
                    "SubQuestions": [
                        {
                            "Question": "Disability {N}",
                            "Type": "text",
                            "DatumId": "disability"
                        }
                    ],
                    "DatumId": "veteran_disability"
                },
                {
                    "Form": "VBA-21-526EZ-ARE",
                    "PDFFormLocator": null,
                    "Question": "Veteran VA Medical Centers Visited",
                    "Type": "group",
                    "MaxSubElements": 4,
                    "SubQuestions": [
                        {
                            "Question": "Name and Location {N}",
                            "Type": "text",
                            "DatumId": "prev_treatment_place"
                        },
                        {
                            "Question": "Treatment Start {N}",
                            "Type": "date",
                            "DatumId": "prev_treatment_start_date"
                        },
                        {
                            "Question": "Treatment End {N}",
                            "Type": "date",
                            "DatumId": "prev_treatment_end_date"
                        }
                    ],
                    "DatumId": "veteran_va_treatment"
                },
                {
                    "Form": "VBA-21-526EZ-ARE",
                    "PDFFormLocator": null,
                    "Question": "Veteran Served Under Alternate Name Yes/No",
                    "Type": "radio",
                    "Options": ["Yes", "No"],
                    "DatumId": "veteran_served_under_alternate_name_yes_no"
                },
                {
                    "Form": "VBA-21-526EZ-ARE",
                    "PDFFormLocator": null,
                    "Question": "Veteran Alternate Name Yes/No",
                    "Type": "text",
                    "DependsOn": {
                        "DatumId": "veteran_served_under_alternate_name_yes_no",
                        "Value": "Yes"
                    },
                    "DatumId": "veteran_alternate_name"
                },
                {
                    "Form": "VBA-21-526EZ-ARE",
                    "PDFFormLocator": null,
                    "Question": "Veteran Most Recent Active Service Entry",
                    "Type": "date",
                    "DatumId": "veteran_most_recent_active_service_entry_date"
                },
                {
                    "Form": "VBA-21-526EZ-ARE",
                    "PDFFormLocator": null,
                    "Question": "Veteran Service Number",
                    "NotApplicable": true,
                    "Type": "text",
                    "DatumId": "veteran_service_number"
                },
                {
                    "Form": "VBA-21-526EZ-ARE",
                    "PDFFormLocator": null,
                    "Question": "Veteran Most Recent Active Service Exit (Can be a date in the future)",
                    "Type": "date",
                    "DatumId": "veteran_service_exit"
                },
                {
                    "Form": "VBA-21-526EZ-ARE",
                    "PDFFormLocator": null,
                    "Question": "Veteran Served in Combat Zone Since 9/11/2001",
                    "Type": "radio",
                    "Options": ["Yes", "No"],
                    "DatumId": "veteran_served_combat_zone_since_9_11"
                },
                {
                    "Form": "VBA-21-526EZ-ARE",
                    "PDFFormLocator": null,
                    "Question": "Veteran Place of Last or Anticipated Separation",
                    "Type": "text",
                    "DatumId": "veteran_place_of_last_or_anticipated_separation"
                },
                {
                    "Form": "VBA-21-526EZ-ARE",
                    "PDFFormLocator": null,
                    "Question": "Veteran Served National Guard",
                    "Type": "radio",
                    "Options": ["Yes", "No"],
                    "DatumId": "veteran_served_national_guard_yes_no"
                },
                {
                    "Form": "VBA-21-526EZ-ARE",
                    "PDFFormLocator": null,
                    "Question": "Veteran National Guard Component",
                    "Type": "radio",
                    "Options": ["National Guard", "Reserved"],
                    "DependsOn": {
                        "DatumId": "veteran_served_national_guard_yes_no",
                        "Value": "Yes"
                    },
                    "DatumId": "veteran_served_national_guard_component"
                },
                {
                    "Form": "VBA-21-526EZ-ARE",
                    "PDFFormLocator": null,
                    "Question": "Veteran National Guard Term of Service Start",
                    "Type": "date",
                    "DependsOn": {
                        "DatumId": "veteran_served_national_guard_yes_no",
                        "Value": "Yes"
                    },
                    "DatumId": "veteran_served_national_guard_start_date"
                },
                {
                    "Form": "VBA-21-526EZ-ARE",
                    "PDFFormLocator": null,
                    "Question": "Veteran National Guard Term of Service End",
                    "Type": "date",
                    "DependsOn": {
                        "DatumId": "veteran_served_national_guard_yes_no",
                        "Value": "Yes"
                    },
                    "DatumId": "veteran_served_national_guard_end_date"
                },
                {
                    "Form": "VBA-21-526EZ-ARE",
                    "PDFFormLocator": null,
                    "Question": "Veteran National Guard Name and Address of Unit",
                    "Type": "text",
                    "DependsOn": {
                        "DatumId": "veteran_served_national_guard_yes_no",
                        "Value": "Yes"
                    },
                    "DatumId": "veteran_national_guard_unit_info"
                },
                {
                    "Form": "VBA-21-526EZ-ARE",
                    "PDFFormLocator": null,
                    "Question": "Veteran National Guard Phone Number of Unit",
                    "Type": "text",
                    "DependsOn": {
                        "DatumId": "veteran_served_national_guard_yes_no",
                        "Value": "Yes"
                    },
                    "DatumId": "veteran_national_guard_unit_phone_number"
                },
                {
                    "Form": "VBA-21-526EZ-ARE",
                    "PDFFormLocator": null,
                    "Question": "Veteran National Guard Currently Receiving Inactive Duty Training Pay",
                    "Type": "radio",
                    "Options": ["Yes", "No"],
                    "DependsOn": {
                        "DatumId": "veteran_served_national_guard_yes_no",
                        "Value": "Yes"
                    },
                    "DatumId": "veteran_national_guard_inactive_duty_training_pay_y_n"
                },
                {
                    "Form": "VBA-21-526EZ-ARE",
                    "PDFFormLocator": null,
                    "Question": "ARE YOU CURRENTLY ACTIVATED ON FEDERAL ORDERS WITHIN THE NATIONAL GUARD OR RESERVES?",
                    "Type": "radio",
                    "Options": ["Yes", "No"],
                    "DatumId": "veteran_national_guard_currently_activated_y_n"
                },
                {
                    "Form": "VBA-21-526EZ-ARE",
                    "PDFFormLocator": null,
                    "Question": "DATE OF ACTIVATION",
                    "Type": "date",
                    "DependsOn": {
                        "DatumId": "veteran_national_guard_currently_activated_y_n",
                        "Value": "Yes"
                    },
                    "DatumId": "veteran_national_guard_currently_activated_date_of_activation"
                },
                {
                    "Form": "VBA-21-526EZ-ARE",
                    "PDFFormLocator": null,
                    "Question": "ANTICIPATED SEPARATION DATE",
                    "Type": "date",
                    "DependsOn": {
                        "DatumId": "veteran_national_guard_currently_activated_y_n",
                        "Value": "Yes"
                    },
                    "DatumId": "veteran_national_guard_currently_activated_date_of_separation"
                },

                {
                    "Form": "VBA-21-526EZ-ARE",
                    "PDFFormLocator": null,
                    "Question": "HAVE YOU EVER BEEN A PRISONER OF WAR?",
                    "Type": "radio",
                    "Options": ["Yes", "No"],
                    "DatumId": "veteran_prisoner_of_war_y_n"
                },
                {
                    "Form": "VBA-21-526EZ-ARE",
                    "PDFFormLocator": null,
                    "Question": "DATE OF CONFINEMENT START",
                    "Type": "date",
                    "DependsOn": {
                        "DatumId": "veteran_prisoner_of_war_y_n",
                        "Value": "Yes"
                    },
                    "DatumId": "veteran_prisoner_of_war_start_date"
                },
                {
                    "Form": "VBA-21-526EZ-ARE",
                    "PDFFormLocator": null,
                    "Question": "DATE OF CONFINEMENT END",
                    "Type": "date",
                    "DependsOn": {
                        "DatumId": "veteran_prisoner_of_war_y_n",
                        "Value": "Yes"
                    },
                    "DatumId": "veteran_prisoner_of_war_end_date"
                },

                {
                    "Form": "VBA-21-526EZ-ARE",
                    "PDFFormLocator": null,
                    "Question": "DID/DO YOU RECEIVE ANY TYPE OF SEPARATION/SEVERANCE/RETIRED PAY",
                    "Type": "radio",
                    "Options": ["Yes", "No"],
                    "DatumId": "veteran_separation_pay_y_n"
                },

                {
                    "Form": "VBA-21-526EZ-ARE",
                    "PDFFormLocator": null,
                    "Question": "LIST AMOUNT",
                    "Type": "text",
                    "DependsOn": {
                        "DatumId": "veteran_separation_pay_y_n",
                        "Value": "Yes"
                    },
                    "DatumId": "veteran_separation_pay_amount"
                },

                {
                    "Form": "VBA-21-526EZ-ARE",
                    "PDFFormLocator": null,
                    "Question": "LIST TYPE",
                    "Type": "text",
                    "DependsOn": {
                        "DatumId": "veteran_separation_pay_y_n",
                        "Value": "Yes"
                    },
                    "DatumId": "veteran_separation_pay_type"
                },

                {
                    "Form": "VBA-21-526EZ-ARE",
                    "PDFFormLocator": null,
                    "Question": "I want military retired pay instead of VA compensation",
                    "Type": "radio",
                    "Options": ["Retired Pay", "VA Compensation"],
                    "DatumId": "veteran_military_retired_pay_or_va_compensation"
                },

                {
                    "Form": "VBA-21-526EZ-ARE",
                    "PDFFormLocator": null,
                    "Question": "I elect to waive VA benefits for the days I accrued inactive duty training pay in order to retain my inactive duty training pay.",
                    "Type": "radio",
                    "Options": ["Waive", "Do Not Waive"],
                    "DatumId": "veteran_waive_va_benefits"
                },

                {
                    "Form": "VBA-21-526EZ-ARE",
                    "PDFFormLocator": null,
                    "Question": "I elect to waive VA benefits for the days I accrued inactive duty training pay in order to retain my inactive duty training pay.",
                    "Type": "radio",
                    "Options": ["Waive", "Do Not Waive"],
                    "DatumId": "veteran_waive_va_benefits"
                },

                {
                    "Form": "VBA-21-526EZ-ARE",
                    "PDFFormLocator": null,
                    "Question": "ACCOUNT TYPE",
                    "Type": "radio",
                    "Options": ["Checking", "Saving", "No Bank Account"],
                    "DatumId": "veteran_dd_account_type"
                },

                {
                    "Form": "VBA-21-526EZ-ARE",
                    "PDFFormLocator": null,
                    "Question": "ACCOUNT NUMBER",
                    "Type": "text",
                    "DatumId": "veteran_dd_account_number"
                },

                {
                    "Form": "VBA-21-526EZ-ARE",
                    "PDFFormLocator": null,
                    "Question": "ACCOUNT NUMBER",
                    "Type": "text",
                    "DatumId": "veteran_dd_account_number"
                },

                {
                    "Form": "VBA-21-526EZ-ARE",
                    "PDFFormLocator": null,
                    "Question": "ACCOUNT ROUTING NUMBER",
                    "Type": "text",
                    "DatumId": "veteran_dd_routing_number"
                }
            ];
        }
])
}());