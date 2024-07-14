import { Component, OnInit } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { AfterViewInit } from '@angular/core';
import { SharedService } from 'src/app/services/shared.service';
import { ApiService } from 'src/app/services/api.service';
import { Customer } from 'src/app/shared/models/customer';
import { Question } from 'src/app/shared/models/question';
import { Section } from 'src/app/shared/models/section';
import { Site } from 'src/app/shared/models/site';
import { SurveyData } from 'src/app/shared/models/surveyData';
import { SectionPhoto } from 'src/app/shared/models/photo';
import { Device } from '@capacitor/device';
import { CustomerSyncDto, MobileSyncResponseDto } from 'src/app/shared/models/models';
import { Directory, Filesystem } from '@capacitor/filesystem';
import Cropper from 'cropperjs';
import { readAndCompressImage } from 'browser-image-resizer';

@Component({
  selector: 'app-capture-survey',
  templateUrl: './capture-survey.component.html',
  styleUrls: ['./capture-survey.component.scss'],
})
export class CaptureSurveyComponent implements OnInit, AfterViewInit {
  sections: Section[] = [];
  surveyData: SurveyData[] = [];
  isLastQuestion: boolean = false;

  currentQuestionIndex: number = 0;
  choices = [true, false];
  clients: CustomerSyncDto[] = [];
  selectedCustomer: Customer | null = null;
  selectedSite: Site | null = null;
  selectedSection: Section | null = null;
  selectedQuestion: Question | null = null;
  showQuestions: boolean = false;
  nextButtonText: string = 'Next';
  storedSurveyId: string | null = null;

  completedSection: Section[] = [];
  syncData: MobileSyncResponseDto = {} as MobileSyncResponseDto;
  uploading: boolean = false;

  constructor(
    private sanitizer: DomSanitizer,
    public alertController: AlertController,
    private router: Router,
    private sharedService: SharedService,
    private apiService: ApiService
  ) {}

  ngOnInit() {
    const syncData = this.sharedService.getData();
    this.syncData = syncData;

    this.resetData();

    const id = history.state.surveyId;
    if (localStorage.getItem(`survey_${id}`) !== null) {
      const survey = JSON.parse(localStorage.getItem(`survey_${id}`)?.toString() || '');
      this.storedSurveyId = id;
      this.surveyData = survey;
      this.sections = survey.sections;
      this.selectedCustomer = survey.customer;
      this.selectedSite = survey.site;
    } else {
      this.storedSurveyId = null;
    }
  }

  async lockLandscapeOrientation() {
    const info = await Device.getInfo();
    if (info.platform === 'android' || info.platform === 'ios') {
      // screen.orientation.lock('landscape');
    }
  }

  async unlockOrientation() {
    const info = await Device.getInfo();
    if (info.platform === 'android' || info.platform === 'ios') {
      screen.orientation.unlock();
    }
  }

  resetData() {
    this.clients = this.syncData.customers;
  }

  ngAfterViewInit() {}

  getCompletedSections() {
    return this.sections.filter((section) => this.sectionCompleted(section));
  }

  getSectionImage(section: Section) {
    return section.photos;
  }

  answeredQuestions(section: Section) {
    return section.inspectionQuestions.filter((question: Question) => question.answered).length;
  }

  onSectionClick(section: Section) {
    this.selectedSection = section;
    this.selectedQuestion = section.inspectionQuestions[0];
    this.showQuestions = true;
    this.currentQuestionIndex = 0;
  }

  selectAnswer(question: Question, answer: boolean) {
    question.answer = answer;
    question.answered = true;
    this.saveSurvey();
  }

  goToNextQuestion() {
    if (this.currentQuestionIndex < this.selectedSection!.inspectionQuestions.length - 1) {
      this.currentQuestionIndex++;
    }
    if (this.currentQuestionIndex === this.selectedSection!.inspectionQuestions.length - 1) {
      this.isLastQuestion = true;
      this.nextButtonText = 'Submit';
    }
  }

  goToPreviousQuestion() {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
    }
  }

  async takePicture() {
    const photo = await Camera.getPhoto({
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
      quality: 100,
      allowEditing: false,
    });

    const newImage: SectionPhoto = {
      filepath: photo.webPath!,
      webviewPath: photo.webPath!,
      comment: '',
      id: this.newGuid(),
      uploaded: false,
    };

    if (this.selectedSection?.photos === undefined) {
      this.selectedSection!.photos = [];
    }
    this.selectedSection?.photos.push(newImage);
  }

  private newGuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = (Math.random() * 16) | 0,
        v = c == 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  sanitizeImageUrl(url: string): SafeUrl {
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }

  removeImage(section: Section, index: number) {
    section?.photos!.splice(index, 1);
  }

  goToSections() {
    this.selectedSection = null;
    this.currentQuestionIndex = 0;
    this.isLastQuestion = false;
    this.nextButtonText = 'Next';
  }

   async saveBlobToDevice(blobUrl: string, fileName: string): Promise<void> {
    try {
      const resizeConfig = {
        quality: 1,
        maxWidth: 1600,
        maxHeight: 1200,
        autoRotate: true,
        debug: false,
        mimeType: 'image/png',
      };
      let resizedBlobUrl = '';

      try {
        const imageBlob = await this.blobURLToBlob(blobUrl);
        const blobAsFile = this.blobToFile(imageBlob, fileName);
        const resizedImageBlob = await readAndCompressImage(blobAsFile, resizeConfig);
        resizedBlobUrl = URL.createObjectURL(resizedImageBlob);
      } catch (error) {
        console.error('Error resizing image:', error);
      }

      const arrayBuffer = await this.fetchBlobAsArrayBuffer(resizedBlobUrl);
      const base64Data = this.arrayBufferToBase64(arrayBuffer);

      await Filesystem.writeFile({
        path: `${fileName}`,
        data: base64Data,
        directory: Directory.Documents,
        recursive: true,
      });
    } catch (error) {
      console.error('Error saving file:', error);
    }
  }

  async blobURLToBlob(blobURL: string): Promise<Blob> {
    const response = await fetch(blobURL);
    if (!response.ok) {
      throw new Error(`Failed to fetch Blob from URL: ${blobURL}`);
    }
    const blob = await response.blob();
    return blob;
  }

  blobToFile(blob: Blob, fileName: string): File {
    const file = new File([blob], fileName, {
      type: blob.type,
      lastModified: new Date().getTime(),
    });
    return file;
  }

  async uploadFiles(surveyData: SurveyData) {
    const uploadPromises: any[] = [];

    surveyData.sections.forEach((section) => {
      section.photos?.forEach((photo) => {
        const uploadPromise = new Promise<void>(async (resolve) => {
          const fileName = photo.id + '.jpg';
          await this.saveBlobToDevice(photo.filepath, fileName!);
          const imageDataUrl = await this.readFileAsDataUrl(fileName);

          this.apiService.uploadFile(imageDataUrl, fileName).subscribe((res) => {
            photo.uploaded = true;
            resolve();
          });
        });

        uploadPromises.push(uploadPromise);
      });
    });

    await Promise.all(uploadPromises);

    return surveyData;
  }
  async fetchBlobAsArrayBuffer(blobUrl: string): Promise<ArrayBuffer> {
    const response = await fetch(blobUrl);
    const blob = await response.blob();
    return new Response(blob).arrayBuffer();
  }

  arrayBufferToBase64(arrayBuffer: ArrayBuffer): string {
    const bytes = new Uint8Array(arrayBuffer);
    const len = bytes.byteLength;
    let binary = '';

    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }

    return btoa(binary);
  }

  async processImage(imageUrl: string) {
    const imageElement = document.createElement('img');
    imageElement.src = imageUrl;

    const cropper = new Cropper(imageElement, {
      aspectRatio: 16 / 9,
      crop(event) {},
    });
  }



  async completeSurvey() {
    let surveyData: SurveyData = this.getSurveyData();
    await this.saveSurvey();
    this.uploading = true;

    this.uploadFiles(surveyData)
      .then((data) => {
        this.uploading = false;
        surveyData = data;
        const surveyDataString = JSON.stringify(surveyData);

        this.saveSurvey();
        this.selectedSection = null;
        this.selectedCustomer = null;
        this.selectedSite = null;
        this.resetData();

        this.apiService.submitSurveyData(data).subscribe((res) => {});

        this.router.navigate(['/home']);
      })
      .catch((error) => {});
  }

  getSurveyData(): SurveyData {
    try {
      const currentDate = new Date();
      const month = currentDate.toLocaleString('default', { month: 'long' });
      const year = currentDate.getFullYear();
      const surveyId = this.storedSurveyId || `survey_${Date.now()}`;

      let surveyData: SurveyData = {
        id: surveyId,
        customer: this.selectedCustomer!,
        site: this.selectedSite!,
        address: '',
        userEmail: localStorage.getItem('emailAddress') || '',
        inspectionDate: `${month} ${year}`,
        uploaded: false,
        sections: this.sections.map((section) => {
          return {
            ...section,
            additionalComments: section.additionalComments,
            photos: section.photos || [],
          };
        }),
      };
      return surveyData;
    } catch (error) {
      throw error;
    }
  }

  saveSurvey() {
    let surveyData: SurveyData = this.getSurveyData();
    surveyData.sections.forEach(section => {
      section.photos!.forEach(photo => {
        photo.webviewPath = ''; // Clear webviewPath before saving
      });
    });
  
    const surveyDataString = JSON.stringify(surveyData);
  
    if (this.storedSurveyId === null) {
      const surveyId = `survey_${Date.now()}`;
      localStorage.setItem(surveyId, surveyDataString);
      this.storedSurveyId = surveyId.replace('survey_', '');
    } else {
      localStorage.setItem(`survey_${this.storedSurveyId}`, surveyDataString);
    }
  }
  
  async readFileAsDataUrl(filePath: string): Promise<string> {
    try {
      const fileResult = await Filesystem.readFile({
        path: filePath,
        directory: Directory.Documents,
      });
      return `data:image/jpeg;base64,${fileResult.data}`;
    } catch (error) {
      throw error;
    }
  }

  async addComment() {
    const alert = await this.alertController.create({
      header: 'Add Comment',
      inputs: [
        {
          name: 'comment',
          type: 'text',
          placeholder: 'Enter your comment here',
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Add',
          handler: (data) => {
            if (this.selectedSection) {
              if (this.selectedSection.additionalComments) {
                this.selectedSection.additionalComments += `\n${data.comment}`;
              } else {
                this.selectedSection.additionalComments = data.comment;
              }
            }
          },
        },
      ],
    });

    await alert.present();
  }

  selectClient(customer: any) {
    this.selectedCustomer = customer;
  }

  selectSite(site: any) {
    this.selectedSite = site;
  
    const siteInspectionTemplateId = site.inspectionTemplateId;
  
    const template = this.syncData.inpectionTemplates.find(
      (template) => template.inpectionTemplateId === siteInspectionTemplateId
    );
  
    if (template) {
      this.sections = template.inspectionSections.map((section: any) => {
        return {
          sectionId: section.sectionId,
          name: section.name,
          images: section.images,
          inspectionQuestions: section.inspectionQuestions.map((question: any) => {
            return {
              questionId: question.questionId,
              question: question.question,
              answer: question.answer,
            };
          }),
          additionalComments: '',
          photos: [],
        };
      });
    }
  }
  
  goToHome() {
    this.router.navigate(['/home']);
  }

  sectionCompleted(section: Section): boolean {
    return section.inspectionQuestions.every((question: Question) => question.answered);
  }

  allSectionsCompleted(): boolean {
    return this.sections.every((section) => this.sectionCompleted(section));
  }
}
