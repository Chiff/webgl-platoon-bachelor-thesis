import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CubicComponent } from './cubic.component';

describe('CubicComponent', () => {
  let component: CubicComponent;
  let fixture: ComponentFixture<CubicComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CubicComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CubicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
