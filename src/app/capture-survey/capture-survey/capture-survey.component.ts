import { Component, OnInit } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';

interface Photo {
  filepath: string;
  webviewPath: string;
  comment?: string;

}
@Component({
  selector: 'app-capture-survey',
  templateUrl: './capture-survey.component.html',
  styleUrls: ['./capture-survey.component.scss'],
})
export class CaptureSurveyComponent implements OnInit {
  sections = [
    {
      name: 'Communal passages',
      questions: [
        { text: 'Are the communal passages clean?', choices: ['Yes', 'No'], answered: false, selectedAnswer: null, comments: null, remedialActions: null },
        { text: 'Are the pillars clean?', choices: ['Yes', 'No'], answered: false },
        { text: 'Are seating areas and benches clean?', choices: ['Yes', 'No'], answered: false },
        { text: 'Is the area clean of cigarette butts?', choices: ['Yes', 'No'], answered: false },
        { text: 'Is the paved walkway clean?', choices: ['Yes', 'No'], answered: false },

      ],
    },
    {
      name: 'Toilet facilities',
      questions: [
        { text: 'Is the signage clean?', choices: ['Yes', 'No'], answered: false },
        { text: 'Are the soap dispensers stocked, clean and in working order?', choices: ['Yes', 'No'], answered: false },
        { text: 'Are the toilet roll dispensers clean and in good order?', choices: ['Yes', 'No'], answered: false },
      ],
    },
  ];
  currentSection: any = null;
  currentQuestionIndex: number = 0;

  clients = [
    {
      name: 'Client 1',
      sites: ['Site 1', 'Site 2', 'Site 3'],
    },
    {
      name: 'Client 2',
      sites: ['Site 4', 'Site 5', 'Site 6'],
    },
  ];
  
  selectedClient: any = null;
  selectedSite: string | null = null;
  

  constructor(private sanitizer: DomSanitizer, public alertController: AlertController, private router: Router) {}

  ngOnInit() {}
  answeredQuestions(section: any) {
    return section.questions.filter((question: any) => question.answered)
      .length;
  }

  selectSection(section: any) {
    this.currentSection = section;
    this.currentQuestionIndex = 0;
  }

  selectAnswer(question: any, answer: any) {
    question.selectedAnswer = answer;
    question.answered = true;
  }

  goToNextQuestion() {
    if (this.currentQuestionIndex < this.currentSection.questions.length - 1) {
      this.currentQuestionIndex++;
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
    });

    const newImage: Photo = {
      filepath: photo.webPath!,
      webviewPath: photo.webPath!,
    };

    if(this.currentSection.questions[
      this.currentQuestionIndex
    ].photos === undefined) {
      this.currentSection.questions[
        this.currentQuestionIndex
      ].photos = [];
    }
    this.currentSection.questions[
      this.currentQuestionIndex
    ].photos.push(newImage);
  }

  sanitizeImageUrl(url: string): SafeUrl {
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }
  removeImage(index: number) {
    this.currentSection.questions[this.currentQuestionIndex].photos.splice(index, 1);
  }

  async addImageComment(index: number) {
    const alert = await this.alertController.create({
      header: 'Add Image Comment',
      inputs: [
        {
          name: 'comment',
          type: 'text',
          placeholder: 'Enter comment',
          value: this.currentSection.questions[this.currentQuestionIndex].photos[index].comment || '',
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
            this.currentSection.questions[this.currentQuestionIndex].photos[index].comment = data.comment;
          },
        },
      ],
    });
  
    await alert.present();
  }

  selectClient(client: any) {
    this.selectedClient = client;
  }
  
  selectSite(site: string) {
    this.selectedSite = site;
  }
  

  goToHome() {
    this.router.navigate(['/home']); // Assuming the home screen is at the root path
  }

  sectionCompleted(section: any): boolean {
    return section.questions.every((question: any) => question.answered);
  }

  allSectionsCompleted(): boolean {
    return this.sections.every((section) => this.sectionCompleted(section));
  }
  
  
}
