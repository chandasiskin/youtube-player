import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';
import { Video } from '../models/video';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class Playlist {
  private playlist = new BehaviorSubject<Video[]>([]);
  private currentVideo = new BehaviorSubject<Video | null>(null);

  playlist$ = this.playlist.asObservable();
  currentVideo$ = this.currentVideo.asObservable();

  constructor(private http: HttpClient) {}

  addVideoByUrl(youtubeUrl: string) {
    const videoId = this.extractVideoId(youtubeUrl);

    if (!videoId) return;

    const apiKey = environment.apiKey;
    const apiUrl = `${environment.apiUrl}&key=${apiKey}&id=${videoId}`;
    
    this.http.get<any>(apiUrl)
      .pipe(map(res => {
        const snippet = res.items[0]?.snippet;

        if (!snippet) return null;

        const duration = res.items[0].contentDetails.duration.substring(2).toLowerCase();
        const durationInSeconds = this.convertToSeconds(duration);

        const video: Video = {
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

  private extractVideoId(url: string): string | null {
    const match = url.match(/(?:v=|youtu\.be\/)([^&]+)/);

    return match ? match[1] : null;
  }

  private convertToSeconds(time: string): Number {
    const match = time.match(/^(?:(\d+)H)*(?:(\d+)M)*(?:(\d+)S)*$/i);

    if (!match) return 0;
    
    return 3600 * Number(match[1] ?? 0) + 60 * Number(match[2] ?? 0) + Number(match[3] ?? 0);
  }
}
