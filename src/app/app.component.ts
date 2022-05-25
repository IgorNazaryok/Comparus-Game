import { Component, ComponentFactoryResolver, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AreYouReadyComponent } from './are-you-ready/are-you-ready.component';
import { GameOverComponent } from './game-over/game-over.component';
import { RefDirective } from './ref.directive';

interface Cube {
  id: number
  color: string
  isActive: boolean
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{

  @ViewChild(RefDirective) refDir: RefDirective

  form: FormGroup

  isGameRun = false
  scoreUser = 0
  scorePC = 0
  cubes: Cube[] =[]
  droppedNumbers: number[] = []
  timerId: any

  constructor(private resolver:ComponentFactoryResolver){}

  ngOnInit(): void {

    this.form = new FormGroup({
      time: new FormControl(1000, [Validators.required, Validators.min(500), Validators.max(2000)]),
    })
    this.resetGame()
  }

  resetGame(): void {
    this.droppedNumbers.length = 0
    this.cubes.length = 0
    for (let i = 1; i < 101; i++) {
      const cube: Cube = {
        id: i,
        color: 'blue',
        isActive: false
      }
      this.cubes.push(cube)
    }
    this.scorePC = this.scoreUser = 0
    this.form.get('time')?.enable()
  }

  addColor(id: number, color: string, isActive: boolean = false): void {
    const cube = this.cubes.find(cube => cube.id === id)!
    cube.color = color
    cube.isActive = isActive
  }

  onClick(cube: Cube): void {
    if(cube.isActive) {
      clearTimeout(this.timerId)
      this.scoreUser++
      this.addColor(cube.id, 'green')
      this.next()
    }
  }

  startGame(): void {
    this.isGameRun = true
    this.form.get('time')?.disable()
    this.showGameOverModal()
  }

  next(): void {
    if (this.scoreUser < 10 && this.scorePC < 10) {
      const activeCubeId = this.generateNumber()
      this.addColor(activeCubeId, 'yellow', true)
  
      this.timerId = setTimeout(() => {
        this.scorePC++
        this.addColor(activeCubeId, 'red')
        this.next()
      }, this.form.value.time) 
    }
    else {
      this.showGameOverModal()
    }
  }

  showGameOverModal(): void {
    this.refDir.containerRef.clear()
    
    if (this.scoreUser == this.scorePC && this.scorePC == 0){
      const modalFactory = this.resolver.resolveComponentFactory(AreYouReadyComponent)
      const component = this.refDir.containerRef.createComponent(modalFactory)
      let time = 2
      component.instance.message = 'Start: 3'
      let interval = setInterval(() => {
        if(time < 1){
          clearInterval(interval)
          this.refDir.containerRef.clear()
            this.next()
        }
        component.instance.message = `Start: ${time}`
        time--
      },1000)
    }
    else {
      const modalFactory = this.resolver.resolveComponentFactory(GameOverComponent)
      const component = this.refDir.containerRef.createComponent(modalFactory)
      component.instance.message = this.scoreUser == 3 ? `Congratulations, you won with a score ${this.scoreUser}:${this.scorePC}` : `Alas, you lost by the score ${this.scoreUser}:${this.scorePC}`
  
      component.instance.close.subscribe(() => {
        this.refDir.containerRef.clear()
        this.resetGame()
        this.isGameRun = false
      })
    }
  }

  generateNumber(): number {
    let randomNumber: number
    do {
      randomNumber =  1 + Math.floor(Math.random() * 100)
    } while (this.droppedNumbers.includes(randomNumber))
    this.droppedNumbers.push(randomNumber)
   return randomNumber
  }
}
