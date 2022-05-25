import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-are-you-ready',
  templateUrl: './are-you-ready.component.html',
  styleUrls: ['./are-you-ready.component.scss']
})
export class AreYouReadyComponent implements OnInit {

  message = '01'

  constructor() { }

  ngOnInit(): void {
  }

}
