import { Component, OnInit } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { AfterViewInit } from '@angular/core';
import { SharedService } from 'src/app/services/shared.service';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { ApiService } from 'src/app/services/api.service';
import { readAndCompressImage } from 'browser-image-resizer';
import { Customer } from 'src/app/shared/models/customer';
import { Question } from 'src/app/shared/models/question';
import { Section } from 'src/app/shared/models/section';
import { Site } from 'src/app/shared/models/site';
import { SurveyData } from 'src/app/shared/models/surveyData';
import { SectionPhoto } from 'src/app/shared/models/photo';

import { Device } from '@capacitor/device';
import Cropper from 'cropperjs';


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
  choices = ['Yes', 'No'];
  clients: Customer[] = [];
  selectedCustomer: Customer | null = null;
  selectedSite: Site | null = null;
  selectedSection: Section | null = null;
  selectedQuestion: Question | null = null;
  showQuestions: boolean = false;
  nextButtonText: string = 'Next';
  storedSurveyId: string | null = null;

  completedSection: Section[] = [];
  syncData : any;
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
      const survey = JSON.parse(
        localStorage.getItem(`survey_${id}`)?.toString() || ''
      );
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
      screen.orientation.lock('landscape');
    }
  }
  
  async unlockOrientation() {
    const info = await Device.getInfo();
    if (info.platform === 'android' || info.platform === 'ios') {
      screen.orientation.unlock();
    }
  }

  resetData() {


    this.clients = this.syncData.result.customers;

    const sectionsData =
      this.syncData.result.inpectionTemplates[0].inspectionSections;

    this.sections = sectionsData.map((section: any) => {
      return {
        sectionId: section.sectionId,
        name: section.name,
        images: section.images,
        inspectionQuestions: section.inspectionQuestions.map(
          (question: any) => {
            return {
              questionId: question.questionId,
              question: question.question,
              answer: '',
            };
          }
        ),
        additionalComments: '',
        photos: [],
      };
    });
  }
  ngAfterViewInit() {}

  getCompletedSections() {
    return this.sections.filter((section) => this.sectionCompleted(section));
  }

  getSectionImage(section: Section) {
    return section.photos;
  }
  answeredQuestions(section: Section) {
    return section.inspectionQuestions.filter(
      (question: Question) => question.answered
    ).length;
  }

  onSectionClick(section: Section) {
    this.selectedSection = section;
    this.selectedQuestion = section.inspectionQuestions[0];
    this.showQuestions = true;
    this.currentQuestionIndex = 0;
  }

  selectAnswer(question: Question, answer: any) {
    question.answer = answer;
    question.answered = true;
    this.saveSurvey();
  }

  goToNextQuestion() {
    if (
      this.currentQuestionIndex <
      this.selectedSection!.inspectionQuestions.length - 1
    ) {
      this.currentQuestionIndex++;
    }
    if (
      this.currentQuestionIndex ===
      this.selectedSection!.inspectionQuestions.length - 1
    ) {
      this.isLastQuestion = true;
      this.nextButtonText = 'Submit';
    }
  }

    private newGuid() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0,
        v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
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

    console.log(newImage);

    if (this.selectedSection?.photos === undefined) {
      this.selectedSection!.photos = [];
    }
    this.selectedSection?.photos.push(newImage);
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

  async uploadFiles(surveyData : SurveyData) {
    const uploadPromises: any[] = [];
  
    surveyData.sections.forEach((section) => {
      section.photos?.forEach((photo) => {
        const uploadPromise = new Promise<void>(async (resolve) => {
          console.log(photo);
          const fileName = photo.id + '.jpg';
  
          await this.saveBlobToDevice(photo.filepath, fileName!);
  
          const imageDataUrl = await this.readFileAsDataUrl(fileName);

          console.log(fileName);
          console.log(imageDataUrl)
  
          this.apiService.uploadFile(imageDataUrl, fileName).subscribe((res) => {
            console.log('upload success');
            photo.uploaded = true;
            resolve();
          });
        });
  
        uploadPromises.push(uploadPromise);
      });
    });
  
    // Wait for all file uploads to complete
    await Promise.all(uploadPromises);

    return surveyData
  
    // Execute more code here when all files have been uploaded
  }

  async processImage(imageUrl: string) {
    const imageElement = document.createElement('img');
    imageElement.src = imageUrl;
  
    const cropper = new Cropper(imageElement, {
      aspectRatio: 16 / 9,
      crop(event) {
        console.log(event.detail);
      },
    });
  
    // Use `cropper.getCroppedCanvas()` to get the cropped image as a canvas.
    // You can then convert this canvas to a data URL or a Blob for further use.
  }

  async completeSurvey() {
    let surveyData: SurveyData = this.getSurveyData();
    // Convert the survey data object to a JSON string

    // Save the JSON string to local storage with a unique key (e.g., using a timestamp)

 
    this.uploading = true;
    
    this.uploadFiles(surveyData).then((data) => {
      console.log('All files have been uploaded.');
      this.uploading = false;

      surveyData = data;

      console.log('uploaded');

      const surveyDataString = JSON.stringify(surveyData);



      this.saveSurvey();
  
      this.selectedSection = null;
      this.selectedCustomer = null;
      this.selectedSite = null;
      this.resetData();

       this.apiService.submitSurveyData(JSON.parse(surveyDataString)).subscribe((res) => {
       });
  
      // Navigate back to the home screen or another appropriate screen
      // (Assuming you have NavController imported and injected in the constructor)
      this.router.navigate(['/home']); // Assuming the home screen is at the root path
            }).catch((error) => {
      console.error('An error occurred during file uploads:', error);
    });


 

  }

  private getSurveyData() {
    const currentDate = new Date();
    const month = currentDate.toLocaleString('default', { month: 'long' });
    const year = currentDate.getFullYear();
    let surveyData: SurveyData = {
      customer: this.selectedCustomer!,
      site: this.selectedSite!,
      address: '',
      userEmail : localStorage.getItem('emailAddress') || '',
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
  }

   saveSurvey() {
    const timestamp = new Date().getTime();

    let surveyData: SurveyData = this.getSurveyData();
    const surveyDataString = JSON.stringify(surveyData);


    if (this.storedSurveyId === null) {

      const surveyId = `survey_${timestamp}`;

      localStorage.setItem(surveyId, surveyDataString);
      this.storedSurveyId = surveyId.replace('survey_', '');
    } else {

      localStorage.setItem(`survey_${this.storedSurveyId}`, surveyDataString);
    }
  }

  extractGuid(blobUrl: string): string | null {
    const guidPattern = /\/([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})/;
    const match = blobUrl.match(guidPattern);
    return match ? match[1] : null;
  }

  async readFileAsDataUrl(filePath: string): Promise<string> {
    try {
      console.log('Reading file:', filePath);
      const fileResult = await Filesystem.readFile({
        path: filePath,
        directory: Directory.Documents,
      });
      return `data:image/jpeg;base64,${fileResult.data}`;
    } catch (error) {
      console.error('Error reading file:', error);
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
  
  async  saveBlobToDevice(blobUrl: string, fileName: string): Promise<void> {
    try {
      const resizeConfig = {
        quality: 1,
        maxWidth: 1600,
        maxHeight: 1200,
        autoRotate: true,
        debug: false,
        mimeType: 'image/png', // Set output format to PNG
      };
      let rezizedblobUrl = ''


      try {

        

       const imageBlob = await this.blobURLToBlob(blobUrl);

        const blobAsFIle = this.blobToFile(imageBlob, fileName);


       const resizedImageBlob = await readAndCompressImage(blobAsFIle, resizeConfig);

        rezizedblobUrl = URL.createObjectURL(resizedImageBlob);


      } catch (error) {
        console.error('Error resizing image:', error);
      }
      const arrayBuffer = await this.fetchBlobAsArrayBuffer(rezizedblobUrl);
      const base64Data = this.arrayBufferToBase64(arrayBuffer);
  

      
      await Filesystem.writeFile({
        path: `${fileName}`,
        data: base64Data,
        directory: Directory.Documents,
        recursive: true,
      });
  
      console.log('File saved successfully');
    } catch (error) {
      console.error('Error saving file:', error);
    }
  }
   dataUrlToBlob(dataUrl: string): Blob {
    const binary = atob(dataUrl.split(',')[1]);
    const array = new Uint8Array(binary.length);
  
    for (let i = 0; i < binary.length; i++) {
      array[i] = binary.charCodeAt(i);
    }
  
    return new Blob([array], { type: 'image/jpeg' });
  }

   blobToDataUrl(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
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
  

  async addImageComment(section: Section, index: number) {
    const alert = await this.alertController.create({
      header: 'Add Image Comment',
      inputs: [
        {
          name: 'comment',
          type: 'text',
          placeholder: 'Enter comment',
          value: section.photos![index].comment || '',
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Save',
          handler: (data) => {
            section.photos![index].comment = data.comment;
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
  }

  goToHome() {
    this.router.navigate(['/home']); // Assuming the home screen is at the root path
  }

  sectionCompleted(section: Section): boolean {
    return section.inspectionQuestions.every(
      (question: Question) => question.answered
    );
  }

  allSectionsCompleted(): boolean {
    return this.sections.every((section) => this.sectionCompleted(section));
  }
}
