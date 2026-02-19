import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface NavLink {
  icon: string;
  name: string;
  active: boolean;
}

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent {
  navLinks = signal<NavLink[]>([
    { icon: 'fa-solid fa-tachometer-alt', name: 'Dashboard', active: false },
    { icon: 'fa-solid fa-users', name: 'Müşteriler', active: false },
    { icon: 'fa-solid fa-wrench', name: 'Servis Talepleri', active: false },
    { icon: 'fa-solid fa-robot', name: 'Kombi Arıza Tespiti', active: true },
    { icon: 'fa-solid fa-user-cog', name: 'Teknisyenler', active: false },
    { icon: 'fa-solid fa-file-invoice', name: 'Faturalar', active: false },
    { icon: 'fa-solid fa-box', name: 'Stok Yönetimi', active: false },
    { icon: 'fa-solid fa-calendar-alt', name: 'Takvim', active: false },
    { icon: 'fa-solid fa-chart-line', name: 'Raporlar', active: false },
    { icon: 'fa-solid fa-tools', name: 'Bakım', active: false },
  ]);
}
