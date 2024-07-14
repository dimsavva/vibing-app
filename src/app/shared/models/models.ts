export interface SurveyResponseDto {
    data: SurveyResponseData[];
  }
  
  export interface SurveyResponseData {
    customerId: string;
    client: string;
    siteId: string;
    site: string;
    address: string;
    inspectionDate: Date;
    sections: SurveyResponseSection[];
  }
  
  export interface SurveyResponseSection {
    surveySectionId: string;
    description: string;
    images: string[];
    questions: SurveyResponseQuestion[];
    additionalComments: string;
  }
  
  export interface SurveyResponseQuestion {
    questionId: string;
    question: string;
    answer: boolean;
    answered: boolean;
  }
  
  export interface MobileSyncResponseDto {
    customers: CustomerSyncDto[];
    inpectionTemplates: InpectionTemplateSyncDto[];
  }
  
  export interface CustomerSyncDto {
    customerId: string;
    customerName: string;
    emailAddress: string;
    templateId: string;
    sites: SiteSyncDto[];
  }
  
  export interface SiteSyncDto {
    siteId: string;
    siteName: string;
    inspectionTemplateId: string;
  }
  
  export interface InpectionTemplateSyncDto {
    inpectionTemplateId: string;
    name: string;
    inspectionSections: SectionSyncDto[];
  }
  
  export interface SectionSyncDto {
    sectionId: string;
    name: string;
    inspectionQuestions: QuestionSyncDto[];
  }
  
  export interface QuestionSyncDto {
    questionId: string;
    question: string;
  }