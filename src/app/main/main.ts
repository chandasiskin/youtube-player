import { Component, inject, OnInit } from '@angular/core';
import { Video } from '../models/video';
import { Playlist } from '../services/playlist';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-main',
  imports: [CommonModule],
  templateUrl: './main.html',
  styleUrl: './main.scss'
})
export class Main implements OnInit {
  private playlistService = inject(Playlist);
  private sanitizer = inject(DomSanitizer);

  private intervalId: any = null;

  playlist: Video[] = [];

  currentVideoTitle: string = "";
  currentVideoUrl: SafeResourceUrl | null = null;
  currentVideoDuration: number = 0;

  progress: number = 0;

  ngOnInit(): void {
    this.playlistService.playlist$.subscribe(data => this.playlist = data);
    this.playlistService.currentVideo$.subscribe((video: Video | null) => {
      if (video) {
        const url = `https://www.youtube.com/embed/${video.id}?autoplay=1`;
        this.currentVideoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
        this.currentVideoTitle = video.title;
        this.currentVideoDuration = video.durationInSeconds;
      } else {
        this.currentVideoUrl = null;
      }
    })
  }

  play(video: Video) {
    this.playlistService.setCurrentVideo(video);

    this.clearMyInterval(this.intervalId);

    let startingTime = Date.now();
    this.progress = 0;

    this.intervalId = setInterval(() => {
      if (this.progress >= 100) {
        this.clearMyInterval(this.intervalId);
      }

      let elapsedTime = (Date.now() - startingTime) / 1000;
      let elapsedPercentage = (elapsedTime / this.currentVideoDuration) * 100;
      this.progress = Math.min(elapsedPercentage, 100);
    }, 200);
  }

  private clearMyInterval(intervalId: any): void {
    clearInterval(intervalId);
    this.intervalId = null;
  }
}
