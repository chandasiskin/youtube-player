import { Component, HostListener, inject, OnInit } from '@angular/core';
import { Video } from '../models/video';
import { CommonModule } from '@angular/common';
import { Playlist } from '../services/playlist';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';

declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    YT: any;
  }
}

@Component({
  selector: 'app-main',
  imports: [CommonModule, DragDropModule],
  templateUrl: './main.html',
  styleUrl: './main.scss'
})
export class Main implements OnInit {
  private playlistService = inject(Playlist);
  
  private scrollInterval: any;

  playlist: Video[] = [];
  isDragging: boolean = false;
  lastMouseY: number = 0;

  ngOnInit(): void {
    this.playlistService.playlist$.subscribe(playlist => this.playlist = playlist);

    this.playlistService.addVideoByUrl("https://www.youtube.com/watch?v=tPEE9ZwTmy0");
    this.playlistService.addVideoByUrl("https://www.youtube.com/watch?v=-FTNbqxCfhA");
    this.playlistService.addVideoByUrl("https://www.youtube.com/watch?v=yebNIHKAC4A");
    this.playlistService.addVideoByUrl("https://www.youtube.com/watch?v=983bBbJx0Mk");
    this.playlistService.addVideoByUrl("https://www.youtube.com/watch?v=TbMEMCvFbZk");

    document.addEventListener('mousemove', (e) => console.log('raw mousemove:', e.clientY));
  }

  drop(event: CdkDragDrop<Video[]>): void {
    moveItemInArray(this.playlist, event.previousIndex, event.currentIndex);
  }

  onDragStart(): void {
    this.isDragging = true;
    this.enableAutoScroll();
  }

  onDragEnd(): void {
    this.isDragging = false;
    this.disableAutoScroll();
  }

  @HostListener('document:mousemove', ['$event'])
  onmousemove(event: MouseEvent): void {
    this.lastMouseY = event.clientY;
    console.log(this.lastMouseY);
  }

  private enableAutoScroll() {
    const playlist = document.querySelector("#playlist");
    
    this.scrollInterval = setInterval(() => {
      if (!playlist) {
        return;
      }

      const bounding = playlist.getBoundingClientRect();
      const scrollZone = 50;
      const scrollSpeed = 10;

      if (this.lastMouseY < bounding.top + scrollZone) {
        playlist.scrollTop -= scrollSpeed;
      } else if (this.lastMouseY > bounding.bottom - scrollZone) {
        playlist.scrollTop += scrollSpeed;
      }
    }, 30);
  }

  private disableAutoScroll() {
    clearInterval(this.scrollInterval);
  }

  playVideo(video: Video): void {
    this.playlistService.playVideo(video);
  }

  getCurrentVideo(): Video | null {
    return this.playlistService.getCurrentVideo();
  }

  onDeleteVideo(event: any): void {
    const video = event.item.data;

    this.playlistService.removeVideo(video);
  }
}
