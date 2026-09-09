import { Component, inject, model, output } from '@angular/core';
import { copy, interpolate } from '../../copy/copy';
import { PreferencesService } from '../../services/preferences.service';
import { PersistenceService } from '../../services/persistence.service';
import { ToastService } from '../../services/toast.service';
import { SettingsComponent } from '../settings/settings';
import { ConfirmDialogComponent, type ConfirmRequest } from '../confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-ent-profile-menu',
  standalone: true,
  imports: [SettingsComponent, ConfirmDialogComponent],
  template: `
    <div style="position: relative">
      <button
        type="button"
        class="e-btn e-btn-icon"
        [attr.aria-label]="copy.header.profile"
        [attr.aria-expanded]="open()"
        (click)="open.set(!open())"
      >
        <span class="e-avatar" aria-hidden="true">{{ initials }}</span>
      </button>
      @if (open()) {
        <div class="e-profile-pop" role="menu" (click)="open.set(false)">
          <div class="e-profile-id">
            <span class="e-avatar-lg" aria-hidden="true">{{ initials }}</span>
            <div>
              <strong>{{ copy.demoUser.displayName }}</strong>
              <div class="e-muted">{{ copy.demoUser.roleLabel }}</div>
            </div>
          </div>
          <app-ent-settings />
          <div class="e-row" style="border-top: 1px solid var(--e-stroke); padding-top: var(--e-sp-1-5)">
            <button type="button" class="e-btn e-btn-sm e-btn-danger" (click)="askReset()">{{ copy.profile.reset }}</button>
          </div>
        </div>
      }
    </div>
    <app-ent-confirm-dialog [request]="resetRequest()" [(open)]="confirmOpen" (confirmed)="doReset()" />
  `,
  styles: [
    `
      .e-avatar, .e-avatar-lg {
        border-radius: 50%;
        display: grid; place-items: center;
        background: var(--e-brand);
        color: var(--e-on-accent);
        font-weight: 700;
      }
      .e-avatar { width: 26px; height: 26px; font-size: 11px; }
      .e-avatar-lg { width: 36px; height: 36px; font-size: 13px; flex-shrink: 0; }
      .e-profile-pop {
        position: absolute; right: 0; top: calc(100% + 6px);
        width: 300px;
        background: var(--e-surface-raised);
        color: var(--e-text);
        border: 1px solid var(--e-stroke);
        border-radius: var(--e-radius-lg);
        box-shadow: var(--e-shadow-2);
        padding: var(--e-sp-2);
        z-index: 120;
        display: flex; flex-direction: column; gap: var(--e-sp-1-5);
      }
      .e-profile-id { display: flex; gap: var(--e-sp-1-5); align-items: center; }
    `,
  ],
})
export class ProfileMenuComponent {
  readonly copy = copy;
  readonly interpolate = interpolate;
  readonly open = model(false);
  readonly confirmOpen = model(false);
  readonly resetRequested = output();
  readonly initials = (copy.demoUser.displayName as string)
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2);
  private readonly preferences = inject(PreferencesService);
  private readonly persistence = inject(PersistenceService);
  private readonly toast = inject(ToastService);

  resetRequest(): ConfirmRequest {
    return {
      title: copy.profile.resetConfirmTitle,
      body: copy.profile.resetConfirmBody,
      confirmLabel: copy.profile.reset,
      destructive: true,
      typedWord: copy.profile.resetTypedWord,
    };
  }

  askReset(): void {
    this.open.set(false);
    this.confirmOpen.set(true);
  }

  doReset(): void {
    this.persistence.resetAll();
    this.toast.info(copy.toast.resetDone);
    setTimeout(() => window.location.reload(), 600);
  }
}
