import { Component, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { SectionPhoto } from '../shared/models/photo';
import { Section } from '../shared/models/section';

@Component({
  selector: 'app-list-surveys',
  templateUrl: './list-surveys.component.html',
  styleUrls: ['./list-surveys.component.scss'],
})
export class ListSurveysComponent implements OnInit {
  surveys: any[] = [];

  constructor(
    private alertController: AlertController,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadSurveys();
  }
  loadSurveys() {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('survey_')) {
        const storedSurvey = localStorage.getItem(key);
        if (storedSurvey) {
          const survey = JSON.parse(storedSurvey);
          survey.sections as Section[];

          const photoList : SectionPhoto[]= []
          let allPhotos = survey.sections.map((section: Section) => {
           section.photos?.map((photo: SectionPhoto) => {
              photoList.push(photo);
            });
          });
          allPhotos = photoList.filter((photo: SectionPhoto) => photo !== undefined);
          const uploaded = allPhotos.filter((photo: SectionPhoto) => photo.uploaded).length;
          const notUploaded = allPhotos.filter((photo: SectionPhoto) => !photo.uploaded).length;

          survey.id = key.split('_')[1];
          console.log("id",survey.id, "uploaded", uploaded, "notUploaded", notUploaded, "allPhotos", allPhotos.length);

          survey.timestamp = key.split('_')[1];
          survey.uploaded = uploaded === allPhotos.length;
          this.surveys.push(survey);
        }
      }
    }
  }
  async editSurvey(survey: any) {
    // Logic for editing the survey

    const extras: NavigationExtras = { state: { surveyId: survey.id } };
    this.router.navigate(['/capture-survey'], extras);

    // this.router.navigateByUrl('/capture-survey', extras);
  }

  async deleteSurvey(index: number) {
    const alert = await this.alertController.create({
      header: 'Confirm',
      message: 'Are you sure you want to delete this survey?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Delete cancelled');
          },
        },
        {
          text: 'Delete',
          handler: () => {
            const survey = this.surveys[index];
            console.log(`survey_${survey.timestamp}`);
            console.log(index);
            console.log(this.surveys);

            localStorage.removeItem(`survey_${survey.timestamp}`);
            this.surveys.splice(index, 1);
            console.log('Survey deleted');
          },
        },
      ],
    });

    await alert.present();
  }
}
