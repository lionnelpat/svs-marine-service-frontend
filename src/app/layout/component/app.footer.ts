import { Component } from '@angular/core';

@Component({
    standalone: true,
    selector: 'app-footer',
    template: `<div class="layout-footer">
        Salane Vision S.a.r.l by
        <a href="#" target="_blank" rel="noopener noreferrer" class="text-primary font-bold hover:underline">Model Technologie</a>
    </div>`
})
export class AppFooter {}
