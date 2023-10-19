import { SectionPhoto } from "./photo";
import { Question } from "./question";

export interface Section {
    sectionId: number;
    name: string;
    images: string[];
    inspectionQuestions: Question[];
    additionalComments: string;
    photos?: SectionPhoto[];
  }
  