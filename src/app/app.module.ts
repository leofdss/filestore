import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { FileExplorerModule } from './file-explorer/file-explorer.module';
import { FileService } from './service/file.service';
import { HttpClientModule } from '@angular/common/http';
import { MaterialModule } from './material-module';

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FileExplorerModule,
    HttpClientModule,
    MaterialModule
  ],
  providers: [FileService],
  bootstrap: [AppComponent]
})
export class AppModule { }
