import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

import {
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { YouTubePlayerModule } from '@angular/youtube-player';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-video-list',
  templateUrl: './video-list.component.html',
  standalone: true,
  imports: [YouTubePlayerModule, CommonModule, FormsModule],
  styleUrls: ['./video-list.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class VideoListComponent implements OnInit {
  videos: any[] = [];
  selectedVideoId: string | undefined;
  selectedVideoIndex: number = 0;
  apiKey: string = environment.apiKey;
  playlistId = environment.playlistId
  isDarkMode = false;
  nextPageToken: string | null = null;
  isLoading: boolean = false;
  playlistName: string = '';
  isAutoPlayEnabled = true;

  @ViewChild('scrollableList') scrollableList!: ElementRef;

  constructor(private readonly http: HttpClient) {
    this.fetchPlaylistDetails();
    this.fetchVideos();
  }

  fetchPlaylistDetails() {
    const url = `https://www.googleapis.com/youtube/v3/playlists?part=snippet&id=${this.playlistId}&key=${this.apiKey}`;

    this.http.get<any>(url).subscribe((response) => {
      if (response.items && response.items.length > 0) {
        this.playlistName = response.items[0].snippet.title; // Get the playlist name
      }
    });
  }

  ngOnInit(): void {}

  fetchVideos() {
    if (this.isLoading) return;
    this.isLoading = true;

    const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=10&playlistId=${
      this.playlistId
    }&key=${this.apiKey}${
      this.nextPageToken ? `&pageToken=${this.nextPageToken}` : ''
    }`;

    this.http.get<any>(url).subscribe((response) => {
      this.videos.push(
        ...response.items
          .filter((item: any) => item.snippet.title !== 'Private video')

          .map((item: any) => ({
            videoId: item.snippet.resourceId.videoId,
            title: item.snippet.title,
            description: item.snippet.description,
            thumbnail: item?.snippet?.thumbnails?.default?.url || '',
            channelTitle: item.snippet.channelTitle,
            publishTime: new Date(item.snippet.publishedAt).toLocaleString(),
          }))
      );

      // Check if there is a next page token
      this.nextPageToken = response.nextPageToken || null;

      if (this.videos.length > 0 && !this.selectedVideoId) {
        this.selectedVideoId = this.videos[0].videoId; // Set the first video as selected
      }

      this.isLoading = false;
    });
  }

  onScroll() {
    const scrollTop = this.scrollableList.nativeElement.scrollTop;
    const scrollHeight = this.scrollableList.nativeElement.scrollHeight;
    const offsetHeight = this.scrollableList.nativeElement.offsetHeight;

    // Add a larger buffer (e.g., 100px) to detect when nearing the bottom
    const buffer = 100; // Adjust as needed

    // If the scroll position is within the buffer from the bottom and there's a next page token
    if (
      scrollTop + offsetHeight >= scrollHeight - buffer &&
      this.nextPageToken
    ) {
      this.fetchVideos(); // Fetch more videos
    }
  }

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    // Update localStorage with the new preference
    localStorage.setItem('darkMode', this.isDarkMode.toString());

    // Toggle dark class on body
    if (this.isDarkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }

  selectVideo(videoId: string, index: number) {
    this.selectedVideoId = videoId;
    this.selectedVideoIndex = index;
  }

  prevVideo() {
    if (this.selectedVideoIndex > 0) {
      this.selectedVideoIndex--;
      this.selectedVideoId = this.videos[this.selectedVideoIndex].videoId;
    }
  }

  nextVideo() {
    if (this.selectedVideoIndex < this.videos.length - 1) {
      this.selectedVideoIndex++;
      this.selectedVideoId = this.videos[this.selectedVideoIndex].videoId;
    }
  }

  nexttVideo(currentVideoId: string): void {
    console.log(currentVideoId);
    const currentIndex = this.videos.findIndex(
      (video) => video.id === currentVideoId
    );
    const nextIndex = (currentIndex + 1) % this.videos.length; // Loop to the first video
    this.selectedVideoId = this.videos[nextIndex].id; // Set the next video
  }

  onPlayerReady(event: any): void {
    // Optional: Auto-play the video when the player is ready
    event.target.playVideo();
  }

  onPlayerStateChange(event: any): void {
    console.log('onPlayerStateChange', event);
    console.log('onPlayerStateChange', YT.PlayerState.ENDED);
    // Check if the video has ended and play the next video if autoplay is enabled
    if (event.data === YT.PlayerState.ENDED && this.isAutoPlayEnabled) {
      this.nextVideo();
    }
  }
}
