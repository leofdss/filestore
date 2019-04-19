import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FileElement } from 'src/app/model/element';

@Component({
  selector: 'app-renameDialog',
  templateUrl: './renameDialog.component.html',
  styleUrls: ['./renameDialog.component.css']
})
export class RenameDialogComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<RenameDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: FileElement
  ) { }

  folderName: string = '';
  ext: string = '';

  ngOnInit() {
    if (!this.data.isFolder) {
      let temp = this.data.name.split('.');
      this.ext = '.' + temp[temp.length - 1];

      temp.pop();

      for (let item of temp) {
        this.folderName += item;
      }
    } else {
      this.folderName = this.data.name;
    }
  }
}
