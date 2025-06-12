import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { AvatarModule } from 'primeng/avatar';
import { Company } from '../../../../shared/models/company.model';

@Component({
  selector: 'app-company-detail',
  imports: [
      CommonModule,
      ButtonModule,
      TagModule,
      DividerModule,
      AvatarModule
  ],
    standalone: true,
  templateUrl: './company-detail.component.html',
  styleUrl: './company-detail.component.scss'
})
export class CompanyDetailComponent {
    @Input() company: Company | null = null;
    @Output() editClick = new EventEmitter<Company>();
    @Output() closeClick = new EventEmitter<void>();

    getInitials(name: string): string {
        return name
            .split(' ')
            .map(word => word.charAt(0))
            .join('')
            .substring(0, 2)
            .toUpperCase();
    }

    formatDate(date: Date): string {
        if (!date) return '';

        const dateObj = new Date(date);
        return new Intl.DateTimeFormat('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(dateObj);
    }

    openInMaps(): void {
        if (this.company) {
            const address = encodeURIComponent(
                `${this.company.adresse}, ${this.company.ville}, ${this.company.pays}`
            );
            const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${address}`;
            window.open(mapsUrl, '_blank');
        }
    }

    onEdit(): void {
        if (this.company) {
            this.editClick.emit(this.company);
        }
    }

    onClose(): void {
        this.closeClick.emit();
    }

}
