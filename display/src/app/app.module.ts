import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { StatusComponent } from './components/status/status.component';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
 
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { Modal1Component } from './_modals/modal1/modal1.component';

import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';
import { NavbarComponent } from './components/navbar/navbar/navbar.component';
import { TableComponent } from './components/table/table/table.component';


const config: SocketIoConfig = { url: 'http://localhost:4444', options: {} };
  
@NgModule({
  declarations: [
    AppComponent,
    StatusComponent,
    Modal1Component,
    NavbarComponent,
    TableComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    SocketIoModule.forRoot(config),
    BrowserAnimationsModule,
    MatButtonModule,
    MatDialogModule,
    MatTableModule
  ],
  providers: [],
  bootstrap: [AppComponent],
  entryComponents: [Modal1Component]
})

export class AppModule { }
