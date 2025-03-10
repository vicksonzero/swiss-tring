import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ButtonComponent } from './components/button/button.component';
import { EditableWrapperComponent } from './components/editable-wrapper/editable-wrapper.component';
import { MainComponent } from './main/main.component';
import { StepComponent } from './step/step.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ColumnComponent } from './column/column.component';
import { ViewWidgetComponent } from './view-widget/view-widget.component';
import { OperatorWidgetComponent } from './operator-widget/operator-widget.component';
import { CircleComponent } from './components/circle/circle.component';
import { TextareaViewComponent } from './view-widget/textarea-view/textarea-view.component';
import { JsonViewComponent } from './view-widget/json-view/json-view.component';

@NgModule({
  declarations: [
    AppComponent,
    MainComponent,
    ButtonComponent,
    StepComponent,
    EditableWrapperComponent,
    ColumnComponent,
    ViewWidgetComponent,
    OperatorWidgetComponent,
    CircleComponent,
    TextareaViewComponent,
    JsonViewComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FontAwesomeModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
