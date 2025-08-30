import { Component, inject, OnInit } from '@angular/core';
import { Video } from '../models/video';
import { CommonModule } from '@angular/common';
import { Playlist } from '../services/playlist';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { Controller } from '../services/controller';
import { PlayerCommands } from '../enums/playerCommands.enum';

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
  private controllerService = inject(Controller);

  playlist: Video[] = [];
  isDragging: boolean = false;

  ngOnInit(): void {
    this.playlistService.playlist$.subscribe(playlist => this.playlist = playlist);

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
    this.isDragging = true;
  }

  onDragEnd(): void {
    this.isDragging = false;
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
