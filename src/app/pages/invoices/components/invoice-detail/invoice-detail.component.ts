// src/app/pages/invoices/components/invoice-detail/invoice-detail.component.ts

import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

// print invoice
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

// PrimeNG Imports
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';

// Models
import { Invoice, INVOICE_STATUS_LABELS, InvoiceStatus } from '../../../../shared/models/invoice.model';
import { COMPANY_CONFIG } from '../../../../shared/data/invoice.data';

// Services
import { LoggerService } from '../../../../core/services/logger.service';
import { CurrencyUtils } from '../../../../shared/utils';
import { MessageService } from 'primeng/api';

@Component({
    selector: 'app-invoice-detail',
    standalone: true,
    imports: [
        CommonModule,
        ButtonModule,
        TagModule,
        DividerModule,
        TableModule,
        TooltipModule
    ],
    templateUrl: './invoice-detail.component.html',
    styleUrls: ['./invoice-detail.component.scss']
})
export class InvoiceDetailComponent implements OnInit {
    @Input() invoice: Invoice | null = null;

    @ViewChild('invoiceContent') invoiceContent!: ElementRef;

    @Output() onEdit = new EventEmitter<Invoice>();
    @Output() onPrint = new EventEmitter<Invoice>();
    @Output() onExportPDF = new EventEmitter<Invoice>();
    @Output() onGoBack = new EventEmitter<void>();

    // Configuration de l'entreprise
    companyConfig = COMPANY_CONFIG;

    constructor(
        private readonly messageService: MessageService,
        private readonly logger: LoggerService
    ) {}

    ngOnInit(): void {
        if (this.invoice) {
            this.logger.info('Affichage détail facture', { numero: this.invoice.numero });
        }
    }

    // Actions
    goBack(): void {
        this.onGoBack.emit();
        this.logger.info('Retour à la liste des factures');
    }

    editInvoice(): void {
        if (this.invoice) {
            this.onEdit.emit(this.invoice);
            this.logger.info('Modification facture demandée', { id: this.invoice.id });
        }
    }

    printInvoice(): void {
        if (this.invoice) {
            // Sauvegarder les styles originaux
            const originalStyles = this.saveOriginalStyles();

            // Appliquer les styles d'impression
            this.applyPrintStyles();

            // Délai pour permettre l'application des styles
            setTimeout(() => {
                window.print();

                // Restaurer les styles originaux après l'impression
                setTimeout(() => {
                    this.restoreOriginalStyles(originalStyles);
                }, 500);

                if(this.invoice){
                    this.onPrint.emit(this.invoice);
                    this.logger.info('Impression facture', { id: this.invoice?.id });
                }

            }, 300);
        }
    }

    exportToPDF(): void {
        if (this.invoice) {
            this.generatePDF()
                .then(() => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Succès',
                        detail: 'PDF généré avec succès'
                    });
                    this.logger.info('Export PDF réussi', { id: this.invoice?.id });
                })
                .catch(error => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Erreur',
                        detail: 'Échec de la génération du PDF'
                    });
                    this.logger.error('Erreur lors de la génération du PDF', error);
                });
        }
    }

    private async generatePDF(): Promise<void> {
        if (!this.invoiceContent) {
            throw new Error('Element invoiceContent non trouvé');
        }

        const element = this.invoiceContent.nativeElement;
        const options = {
            scale: 2,
            useCORS: true,
            logging: true,
            scrollX: 0,
            scrollY: 0,
            windowWidth: element.scrollWidth,
            windowHeight: element.scrollHeight
        };

        // Sauvegarder les styles originaux
        const originalStyles = this.saveOriginalStyles();

        // Appliquer les styles optimisés pour PDF
        this.applyPDFStyles();

        try {
            // Délai pour permettre l'application des styles
            await new Promise(resolve => setTimeout(resolve, 300));

            const canvas = await html2canvas(element, options);
            const imgData = canvas.toDataURL('image/png');

            // Calcul des dimensions du PDF (format A4)
            const pdfWidth = 210; // mm
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            const pdf = new jsPDF('p', 'mm', 'a4');
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

            // Nom du fichier
            const fileName = `Facture_${this.invoice?.numero}_${new Date().toISOString().slice(0, 10)}.pdf`;

            pdf.save(fileName);
            if(this.invoice){
                this.onExportPDF.emit(this.invoice);
            }

        } finally {
            // Restaurer les styles originaux
            this.restoreOriginalStyles(originalStyles);
        }
    }

    private saveOriginalStyles(): { [key: string]: string } {
        const element = this.invoiceContent.nativeElement;
        const styles = getComputedStyle(element);

        return {
            width: styles.width,
            height: styles.height,
            padding: styles.padding,
            margin: styles.margin,
            boxShadow: styles.boxShadow,
            backgroundColor: styles.backgroundColor
        };
    }

    private applyPrintStyles(): void {
        const element = this.invoiceContent.nativeElement;

        // Styles optimisés pour l'impression
        element.style.width = '100%';
        element.style.height = 'auto';
        element.style.padding = '0';
        element.style.margin = '0';
        element.style.boxShadow = 'none';
        element.style.backgroundColor = 'white';
    }

    private applyPDFStyles(): void {
        const element = this.invoiceContent.nativeElement;

        // Styles optimisés pour le PDF
        element.style.width = '210mm';
        element.style.minHeight = '297mm';
        element.style.padding = '20mm';
        element.style.margin = '0 auto';
        element.style.boxShadow = 'none';
        element.style.backgroundColor = 'white';
    }

    private restoreOriginalStyles(styles: { [key: string]: string }): void {
        const element = this.invoiceContent.nativeElement;

        Object.keys(styles).forEach(key => {
            element.style[key] = styles[key];
        });
    }

    // Méthodes utilitaires
    isOverdue(): boolean {
        if (!this.invoice) return false;

        return this.invoice.statut !== InvoiceStatus.PAYEE &&
            this.invoice.statut !== InvoiceStatus.ANNULEE &&
            new Date() > new Date(this.invoice.dateEcheance);
    }

    getDaysOverdue(): number {
        if (!this.invoice || !this.isOverdue()) return 0;

        const today = new Date();
        const dueDate = new Date(this.invoice.dateEcheance);
        const diffTime = today.getTime() - dueDate.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    getStatusLabel(status: InvoiceStatus): string {
        return INVOICE_STATUS_LABELS[status];
    }

    getStatusSeverity(status: InvoiceStatus): 'success' | 'info' | 'warning' | 'danger' | 'secondary' {
        const severityMap: { [key in InvoiceStatus]: 'success' | 'info' | 'warning' | 'danger' | 'secondary' } = {
            [InvoiceStatus.BROUILLON]: 'secondary',
            [InvoiceStatus.EMISE]: 'info',
            [InvoiceStatus.PAYEE]: 'success',
            [InvoiceStatus.ANNULEE]: 'warning',
            [InvoiceStatus.EN_RETARD]: 'danger'
        };
        return severityMap[status];
    }

    formatCurrency(amount: number, currency = 'XOF'): string {
        return CurrencyUtils.formatCurrency(amount, currency)
    }
}
