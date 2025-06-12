import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentMethodFormComponent } from './payment-method-form.component';

describe('PaymentMethodFormComponent', () => {
  let component: PaymentMethodFormComponent;
  let fixture: ComponentFixture<PaymentMethodFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentMethodFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaymentMethodFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
