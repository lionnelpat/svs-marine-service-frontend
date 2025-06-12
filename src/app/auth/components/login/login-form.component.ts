// login-form.component.ts
import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { ButtonDirective } from 'primeng/button';
import { NgOptimizedImage } from '@angular/common';

@Component({
    selector: 'app-login-form',
    templateUrl: './login-form.component.html',
    styleUrls: ['./login-form.component.scss'],
    standalone: true,
    imports: [
        ReactiveFormsModule,
        InputText,
        ButtonDirective,
        NgOptimizedImage
    ]
})
export class LoginFormComponent {
    passwordVisible = signal(false);

    form!: FormGroup;

    constructor(private readonly fb: FormBuilder) {
        this.form = this.fb.group({
            email: ['admin@maritime.com', [Validators.required, Validators.email]],
            password: ['maritime123', Validators.required]
        });
    }





    login() {
        if (this.form.valid) {
            console.log(this.form.value);
            // Replace with real auth logic
        }
    }
}
