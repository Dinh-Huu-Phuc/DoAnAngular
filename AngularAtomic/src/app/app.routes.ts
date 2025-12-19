import { Routes } from '@angular/router';
import { HomePageComponent } from './pages/home-page/home-page.component';
import { LoginPageComponent } from './pages/auth/login-page.component';
import { RegisterPageComponent } from './pages/auth/register-page.component';
import { PeriodicTablePageComponent } from './pages/periodic-table/periodic-table-page.component';
import { ElementsPageComponent } from './pages/elements/elements-page.component';
import { BalanceEquationPageComponent } from './pages/balance-equation/balance-equation-page.component';
import { Molecules3DPageComponent } from './pages/molecules3d/molecules3d-page.component';
import { SimulationsPageComponent } from './pages/simulations/simulations-page.component';
import { AboutPageComponent } from './pages/about/about-page.component';
import { AccountPageComponent } from './pages/account/account-page.component';
import { ChatboxPageComponent } from './pages/chatbox/chatbox-page.component';
import { ExperimentHistoryPageComponent } from './pages/experiment-history/experiment-history-page.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: HomePageComponent
  },
  {
    path: 'login',
    component: LoginPageComponent
  },
  {
    path: 'register',
    component: RegisterPageComponent
  },
  {
    path: 'elements',
    component: ElementsPageComponent
  },
  {
    path: 'balance-equation',
    component: BalanceEquationPageComponent,
    canActivate: [authGuard]
  },
  {
    path: 'molecules-3d',
    component: Molecules3DPageComponent
  },
  {
    path: 'periodic-table',
    component: PeriodicTablePageComponent
  },
  {
    path: 'simulations',
    component: SimulationsPageComponent
  },
  {
    path: 'about',
    component: AboutPageComponent
  },
  {
    path: 'account',
    component: AccountPageComponent
  },
  {
    path: 'chatbox',
    component: ChatboxPageComponent,
    canActivate: [authGuard]
  },
  {
    path: 'experiment-history',
    component: ExperimentHistoryPageComponent,
    canActivate: [authGuard]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
