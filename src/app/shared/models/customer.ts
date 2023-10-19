import { Site } from "./site";

export interface Customer {
    customerId: number;
    customerName: string;
    emailAddress: string;
    sites: Site[];
  }