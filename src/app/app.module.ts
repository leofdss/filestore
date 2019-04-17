import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { FileExplorerModule } from './file-explorer/file-explorer.module';
import { FileService } from './service/file.service';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FileExplorerModule,
    HttpClientModule
  ],
  providers: [FileService],
  bootstrap: [AppComponent]
})
export class AppModule { }
