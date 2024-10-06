import { Component } from '@angular/core';
import { VideoListComponent } from './video-list/video-list.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [VideoListComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'youtube-player-app';
}
