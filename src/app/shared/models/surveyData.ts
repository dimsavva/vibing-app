import { Customer } from "./customer";
import { Section } from "./section";
import { Site } from "./site";

export interface SurveyData {
    id: string;
    customer: Customer;
    site : Site;
    address: string;
    userEmail : string;
    inspectionDate: string;
    uploaded: boolean;
    sections: Section[];
  }