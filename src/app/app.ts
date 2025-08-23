import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './header/header';
import { Footer } from './footer/footer';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Footer, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('youtube-player');
  private numberOfLights: number = 10;

  lights = Array.from({ length: this.numberOfLights }, _ => ({
    top: `${Math.random() * 90}%`,
    left: `${Math.random() * 90}%`,
    size: 100 + Math.random() * 150,
    color: this.getRandomColor(),
    delay: `${Math.random() * 10}s`,
  }));

  private getRandomColor(): string {
    let hex = "#";

    for (let i = 0; i < 3; i++) {
      let res = Math.floor(Math.random() * 256).toString(16);
      hex += res.length === 1 ? '0' + res : res;
    }

    console.log(hex);
    return hex;
  }
}
