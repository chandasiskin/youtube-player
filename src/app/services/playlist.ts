import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { Video } from '../models/video';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class Playlist {
  private playlist = new BehaviorSubject<Video[]>([]);
  private currentVideo = new BehaviorSubject<Video | null>(null);

  constructor(private http: HttpClient) {}

  get playlist$(): Observable<Video[]> {
    return this.playlist.asObservable();
  }

  get currentVideo$(): Observable<Video | null> {
    return this.currentVideo.asObservable();
  }

  addVideoByUrl(youtubeUrl: string) {
    const videoId = this.extractVideoId(youtubeUrl);

    if (!videoId) return;

    const apiUrl = `${environment.apiUrl}?id=${videoId}`;

    this.http.get<any>(apiUrl)
      .pipe(map(res => {
        const snippet = res.items[0]?.snippet;

        if (!snippet) return null;
        
        const duration = res.items[0].contentDetails.duration.substring(2).toLowerCase();
        const durationInSeconds = this.convertToSeconds(duration);

        const video: Video = {
          uuid: performance.now(),
          id: videoId,
          title: snippet.title,
          thumbnailUrl: snippet.thumbnails.default.url,
          url: youtubeUrl,
          duration: duration,
          durationInSeconds: durationInSeconds,
        };
        return video;
      }))
      .subscribe(video => {
        if (video) {
          const current = this.playlist.value;
          this.playlist.next([...current, video]);
        }
      });
  }

  setCurrentVideo(video: Video) {
    this.currentVideo.next(video);
  }

  getCurrentVideo(): Video | null {
    return this.currentVideo.value;
  }

  private extractVideoId(url: string): string | null {
    const match = url.match(/(?:v=|youtu\.be\/)([^&]+)/);

    return match ? match[1] : null;
  }

  private convertToSeconds(time: string): number {
    const match = time.match(/^(?:(\d+)H)*(?:(\d+)M)*(?:(\d+)S)*$/i);

    if (!match) return 0;
    
    return 3600 * Number(match[1] ?? 0) + 60 * Number(match[2] ?? 0) + Number(match[3] ?? 0);
  }

  removeVideo(video: Video): void {
    const updatedPlaylist = this.playlist.value.filter((v: Video) => v !== video);
    
    this.playlist.next(updatedPlaylist);
  }
}
