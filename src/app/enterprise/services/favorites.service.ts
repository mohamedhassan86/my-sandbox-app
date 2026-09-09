import { Injectable, signal } from '@angular/core';
import { PersistenceService, persistedKeys } from './persistence.service';
import type { Favorite, FavoriteTargetType } from '../models/entities.models';
import type { RouteRef } from '../models/entities.models';

/** Generates a stable favorite id from its target (dedupe). */
export function favoriteId(targetType: FavoriteTargetType, targetRef: RouteRef): string {
  return `favorite:${targetType}:${targetRef}`;
}

/**
 * Favorites store — single source rendered by the dashboard and the side nav
 * (FR-015); persisted on-device.
 */
@Injectable({ providedIn: 'root' })
export class FavoritesService {
  readonly favorites = signal<Favorite[]>([]);

  constructor(private readonly persistence: PersistenceService) {
    this.favorites.set(this.persistence.read(persistedKeys().favorites, []));
  }

  add(targetType: FavoriteTargetType, targetRef: RouteRef, title: string): void {
    if (this.isFavorite(targetType, targetRef)) return;
    const next: Favorite = {
      id: favoriteId(targetType, targetRef),
      targetType,
      targetRef,
      title,
      addedAt: new Date().toISOString(),
    };
    this.persist([next, ...this.favorites()]);
  }

  removeByTarget(targetType: FavoriteTargetType, targetRef: RouteRef): void {
    const id = favoriteId(targetType, targetRef);
    this.persist(this.favorites().filter((f) => f.id !== id));
  }

  toggle(targetType: FavoriteTargetType, targetRef: RouteRef, title: string): boolean {
    if (this.isFavorite(targetType, targetRef)) {
      this.removeByTarget(targetType, targetRef);
      return false;
    }
    this.add(targetType, targetRef, title);
    return true;
  }

  isFavorite(targetType: FavoriteTargetType, targetRef: RouteRef): boolean {
    const id = favoriteId(targetType, targetRef);
    return this.favorites().some((f) => f.id === id);
  }

  private persist(next: Favorite[]): void {
    this.favorites.set(next);
    this.persistence.write(persistedKeys().favorites, next);
  }
}
