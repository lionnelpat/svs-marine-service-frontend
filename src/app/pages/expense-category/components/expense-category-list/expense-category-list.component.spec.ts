import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpenseCategoryListComponent } from './expense-category-list.component';

describe('ExpenseCategoryListComponent', () => {
  let component: ExpenseCategoryListComponent;
  let fixture: ComponentFixture<ExpenseCategoryListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpenseCategoryListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpenseCategoryListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
