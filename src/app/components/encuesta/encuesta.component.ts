import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import * as Survey from 'survey-angular';

@Component({
  selector: 'app-encuesta',
  templateUrl: './encuesta.component.html',
  styleUrls: ['./encuesta.component.css']
})
export class EncuestaComponent implements OnInit {

  @Output() encuestaTerminada: EventEmitter<string> = new EventEmitter();
  @Input() set json(value: object) {
    Survey.StylesManager.applyTheme("bootstrap");
    // Survey.defaultBootstrapCss.navigationButton = "btn btn-info";
    const surveyModel = new Survey.Model(value);
    // Survey.SurveyWindowsNG.render("surveyElement", {
    Survey.SurveyNG.render("surveyElement", {
      model: surveyModel,
      // isExpanded: true
    });
    surveyModel.onComplete.add((sender) => {
      console.log(sender.data);
      this.encuestaTerminada.emit(sender.data);
      // document.querySelector('#surveyResult')!.textContent = "Result JSON:\n" + JSON.stringify(sender.data, null, 3)
    });
  }

  constructor() { }

  ngOnInit(): void {
  }
}
