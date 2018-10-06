import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {Route, RouterModule, Routes} from '@angular/router';

import {AppComponent} from './app.component';
import {ThreeComponent} from './components/three/three.component';
import {BabylonComponent} from './components/babylon/babylon.component';
import { CubicComponent } from './components/cubic/cubic.component';

const appRoutes: Routes = [
  {path: 'babylon', component: BabylonComponent},
  {path: 'three', component: ThreeComponent},
  {path: 'cubic', component: CubicComponent},
  {path: '**', component: ThreeComponent},
  {path: '', component: ThreeComponent}
];

@NgModule({
  declarations: [
    AppComponent,
    ThreeComponent,
    BabylonComponent,
    CubicComponent
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot(appRoutes)
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
