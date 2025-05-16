import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyPrivilegesComponent } from './my-privileges.component';

describe('MyPrivilegesComponent', () => {
  let component: MyPrivilegesComponent;
  let fixture: ComponentFixture<MyPrivilegesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyPrivilegesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyPrivilegesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
