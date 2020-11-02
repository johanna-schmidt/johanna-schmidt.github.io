import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { StartComponent } from './start/start.component';
import { SanitycheckComponent } from './sanitycheck/sanitycheck.component';
import { StudyComponent } from './study/study.component';

@NgModule({
  imports: [
    BrowserModule,
    FormsModule
  ],
  declarations: [
    AppComponent,
    StartComponent,
    SanitycheckComponent,
    StudyComponent
  ],
  bootstrap: [AppComponent]
})

export class AppModule { }
