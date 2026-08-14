import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-luxury-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './luxury-modal.html',
  styleUrls: ['./luxury-modal.scss']
})
export class LuxuryModalComponent {
  @Input() isOpen = false;
  @Input() title = 'Modal';
  @Input() icon = 'fa-wand-magic-sparkles';
  @Input() badgeText?: string;
  @Input() badgeIcon?: string;
  @Input() badgeClass = 'bg-warning text-dark fw-bold px-2.5 py-1 fs-xs rounded-pill';
  @Input() maxWidth = '800px';

  @Output() close = new EventEmitter<void>();

  protected onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop-container')) {
      this.close.emit();
    }
  }
}
