import { Component, inject, NgZone, OnInit } from '@angular/core';
import { Video } from '../models/video';
import { Playlist } from '../services/playlist';
import { CommonModule } from '@angular/common';
import { SafeResourceUrl } from '@angular/platform-browser';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { MatProgressBarModule } from '@angular/material/progress-bar';

const PLAYER_STATE_UNSTARTED = -1;
const PLAYER_STATE_ENDED = 0;
const PLAYER_STATE_PLAYING = 1;
const PLAYER_STATE_PAUSED = 2;
const PLAYER_STATE_BUFFERING = 3;
const PLAYER_STATE_VIDEO_CUED = 5;

declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    YT: any;
  }
}

@Component({
  selector: 'app-main',
  imports: [CommonModule, DragDropModule, MatProgressBarModule],
  templateUrl: './main.html',
  styleUrl: './main.scss'
})
export class Main implements OnInit {
  private playlistService = inject(Playlist);
  private zone = inject(NgZone);

  private player: any;

  playlist: Video[] = [];

  currentVideo: Video | null = null;
  currentVideoUrl: SafeResourceUrl | null = null;

  private myInterval: number = -1;
  progress: number = 0;
  currentPlaytime: string = "0s";

  currentState: "play_arrow" | "pause" | "brand_awareness" = "play_arrow";

  isDragging: boolean = false;

  ngOnInit(): void {
    this.playlistService.playlist$.subscribe(pl => this.playlist = pl);
    this.playlistService.currentVideo$.subscribe((video: Video | null) => {
      if (video) {
        this.currentVideo = video;
        
        this.player.cueVideoById(video.id);

        setTimeout(() => {
          this.playVideo();
        }, 500);
      } else {
        this.currentVideo = null;
      }
    });

    this.playlistService.addVideoByUrl("https://www.youtube.com/watch?v=tPEE9ZwTmy0");
    this.playlistService.addVideoByUrl("https://www.youtube.com/watch?v=-FTNbqxCfhA");
    this.playlistService.addVideoByUrl("https://www.youtube.com/watch?v=a3HZ8S2H-GQ");
    this.playlistService.addVideoByUrl("https://www.youtube.com/watch?v=72MYQo4IUNg");
    this.playlistService.addVideoByUrl("https://www.youtube.com/watch?v=yebNIHKAC4A");

    this.createPlayer();
  }

  private createPlayer(): void {
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode!.insertBefore(tag, firstScriptTag);

    window.onYouTubeIframeAPIReady = () => {
      this.zone.runOutsideAngular(() => {
        this.player = new window.YT.Player('player', {
          height: '0',
          width: '0',
          playerVars: {
            playsinline: 1
          },
          events: {
            onReady: this.onPlayerReady.bind(this),
            onStateChange: this.onPlayerStateChange.bind(this)
          }
        });
      });
    }
  }

  private onPlayerReady(event: any): void {
    event.target.setVolume(100);
    console.log("Player ready.\nSetting volume to max.");
  }

  private onPlayerStateChange(event: any): void {
    clearInterval(this.myInterval);

    // If song starts playing
    if (event.data === PLAYER_STATE_PLAYING) {
      this.zone.run(() =>
        this.myInterval = setInterval(() => {
          if (this.player) {
            let elapsedTime = this.player.getCurrentTime();
            let totalTime = this.player.getDuration();

            this.currentPlaytime = this.formatTime(elapsedTime);
            this.progress = 100 * elapsedTime / totalTime;
          }
        }, 200)
      );
    }
    
    // If song is paused
    else if (event.data === PLAYER_STATE_PAUSED) {}
    
    // If song has ended
    else if (event.data === PLAYER_STATE_ENDED) {
      this.playNextVideo();
    }
  }

  playPause(video: Video | null): void {
    if (video === null) {
      return;
    }

    if (this.player && !this.isDragging) {
      // If clicked on the current video, and it is currently playing, pause it
      if (this.player.getPlayerState() === PLAYER_STATE_PLAYING && this.currentVideo && this.currentVideo.uuid === video.uuid) {
        this.pauseVideo();
      }

      // If clicked on the current video, and it is currently pause, resume it
      else if (this.player.getPlayerState() === PLAYER_STATE_PAUSED && this.currentVideo && this.currentVideo.uuid === video.uuid) {
        this.playVideo();
      }

      // Else, start playing
      else {
        this.playlistService.setCurrentVideo(video);
      }
    }
  }

  playNextVideo(): void {
    const index = this.playlist.findIndex(video => video.uuid === this.currentVideo?.uuid);
    
    if (index === -1 || index + 1 >= this.playlist.length) {
      return;
    }

    const nextVideo = this.playlist[index + 1];
    this.playlistService.setCurrentVideo(nextVideo);
  }

  playPreviousVideo(): void {
    const index = this.playlist.findIndex(video => video.uuid === this.currentVideo?.uuid);
    
    if (index <= 0) {
      return;
    }

    const previousVideo = this.playlist[index - 1];
    this.playlistService.setCurrentVideo(previousVideo);
  }

  drop(event: CdkDragDrop<Video[]>): void {
    moveItemInArray(this.playlist, event.previousIndex, event.currentIndex);
    
    this.isDragging = false;
  }

  onDragStart(): void {
    this.isDragging = true;
  }

  onDragEnd(): void {
    this.isDragging = false;
  }

  private formatTime(time: number): string {
    let response: string = "";

    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);

    if (hours > 0) {
      response = `${hours}h${minutes}m${seconds}s`;
    }

    else if (minutes > 0) {
      response = `${minutes}m${seconds}s`;
    }

    else {
      response = `${seconds}s`;
    }

    return response;
  }

  replay(amount: number): void {
    this.player.seekTo(this.player.getCurrentTime() - amount);
  }

  forward(amount: number): void {
    this.replay(-amount);
  }

  playVideo(): void {
    this.currentState = "brand_awareness";
    this.player.playVideo();
  }

  pauseVideo(): void {
    this.currentState = "pause";
    this.player.pauseVideo();
  }

  removeFromPlaylist(event: CdkDragDrop<Video[]>): void {
    const video: Video = event.item.data;

    // If current video is playing, "stop" playing and remove from "current video"
    if (video === this.currentVideo) {
      this.pauseVideo();
      this.currentVideo = null;
    }

    this.playlistService.removeVideo(video);
  }
}
