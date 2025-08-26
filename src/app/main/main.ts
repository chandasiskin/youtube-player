import { Component, inject, OnInit } from '@angular/core';
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

  playlist: Video[] = [];

  ngOnInit(): void {
    this.playlistService.playlist$.subscribe(playlist => this.playlist = playlist);

    this.playlistService.addVideoByUrl("https://www.youtube.com/watch?v=tPEE9ZwTmy0");
    this.playlistService.addVideoByUrl("https://www.youtube.com/watch?v=-FTNbqxCfhA");
    this.playlistService.addVideoByUrl("https://www.youtube.com/watch?v=yebNIHKAC4A");
    this.playlistService.addVideoByUrl("https://www.youtube.com/watch?v=983bBbJx0Mk");
    this.playlistService.addVideoByUrl("https://www.youtube.com/watch?v=TbMEMCvFbZk");
    this.playlistService.addVideoByUrl("https://www.youtube.com/watch?v=tPEE9ZwTmy0");
    this.playlistService.addVideoByUrl("https://www.youtube.com/watch?v=-FTNbqxCfhA");
    this.playlistService.addVideoByUrl("https://www.youtube.com/watch?v=yebNIHKAC4A");
    this.playlistService.addVideoByUrl("https://www.youtube.com/watch?v=983bBbJx0Mk");
    this.playlistService.addVideoByUrl("https://www.youtube.com/watch?v=TbMEMCvFbZk");
  }

  drop(event: CdkDragDrop<Video[]>): void {
    moveItemInArray(this.playlist, event.previousIndex, event.currentIndex);
  }

  onDragStart(): void {
    console.log("drag started");
  }

  onDragEnd(): void {
    console.log("drag ended");
  }

  playVideo(video: Video): void {
    this.playlistService.playVideo(video);
  }

  moveScroll(event: any): void {
    const container = document.getElementById('playlist');
    const containerHeight = container?.offsetHeight;
    const scrollTop = container?.scrollTop;
    const scrollHeight = container?.scrollHeight;
    console.log(container, containerHeight, scrollTop, scrollHeight, event);
  }
}
