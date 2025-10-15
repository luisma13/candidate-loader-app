import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { ErrorBannerComponent } from './error-banner.component';

describe('ErrorBannerComponent', () => {
  let component: ErrorBannerComponent;
  let fixture: ComponentFixture<ErrorBannerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ErrorBannerComponent],
      providers: [provideNoopAnimations()],
    }).compileComponents();

    fixture = TestBed.createComponent(ErrorBannerComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not display banner when message is null', () => {
    fixture.componentRef.setInput('message', null);
    fixture.detectChanges();

    const banner = fixture.nativeElement.querySelector('.error-banner');
    expect(banner).toBeFalsy();
  });

  it('should display banner when message is provided', () => {
    const errorMessage = 'Test error message';
    fixture.componentRef.setInput('message', errorMessage);
    fixture.detectChanges();

    const banner = fixture.nativeElement.querySelector('.error-banner');
    expect(banner).toBeTruthy();
  });

  it('should display the correct error message', () => {
    const errorMessage = 'Something went wrong';
    fixture.componentRef.setInput('message', errorMessage);
    fixture.detectChanges();

    const messageElement = fixture.nativeElement.querySelector('.message');
    expect(messageElement?.textContent).toContain(errorMessage);
  });

  it('should have error icon', () => {
    fixture.componentRef.setInput('message', 'Error');
    fixture.detectChanges();

    const icon = fixture.nativeElement.querySelector('mat-icon');
    expect(icon).toBeTruthy();
    expect(icon.textContent).toContain('error_outline');
  });

  it('should update when message changes', () => {
    const firstMessage = 'First error';
    const secondMessage = 'Second error';

    fixture.componentRef.setInput('message', firstMessage);
    fixture.detectChanges();

    let messageElement = fixture.nativeElement.querySelector('.message');
    expect(messageElement?.textContent).toContain(firstMessage);

    fixture.componentRef.setInput('message', secondMessage);
    fixture.detectChanges();

    messageElement = fixture.nativeElement.querySelector('.message');
    expect(messageElement?.textContent).toContain(secondMessage);
  });

  it('should hide banner when message is set to null after being visible', () => {
    fixture.componentRef.setInput('message', 'Error');
    fixture.detectChanges();

    let banner = fixture.nativeElement.querySelector('.error-banner');
    expect(banner).toBeTruthy();

    fixture.componentRef.setInput('message', null);
    fixture.detectChanges();

    banner = fixture.nativeElement.querySelector('.error-banner');
    expect(banner).toBeFalsy();
  });
});

