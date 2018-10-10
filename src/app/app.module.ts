import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {AppComponent} from './app.component';
import {ThreeComponent} from './components/three/three.component';
import {BabylonComponent} from './components/babylon/babylon.component';
import {FormsModule} from '@angular/forms';

const appRoutes: Routes = [
  {path: 'babylon', component: BabylonComponent},
  {path: 'three', component: ThreeComponent},
];

@NgModule({
  declarations: [
    AppComponent,
    ThreeComponent,
    BabylonComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    RouterModule.forRoot(appRoutes)
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
